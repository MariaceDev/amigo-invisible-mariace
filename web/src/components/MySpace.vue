<template>
  <div v-if="!group" class="loading">Cargando el grupo…</div>

  <div v-else class="stack">
    <div class="me-header">
      <div class="me-names">
        <span class="me-group">{{ group.name }}</span>
        <span class="me-hello">Hola, {{ me?.name ?? "" }}</span>
      </div>
      <button class="btn-small" @click="emit('logout')">Salir</button>
    </div>

    <section v-if="!open" class="dark" style="padding: 24px; gap: 8px">
      <div style="font-size: 16px">Tu amigo invisible se revela en</div>
      <div class="countdown">{{ formatCountdown(group.revealAt.getTime() - now) }}</div>
      <div style="font-size: 15px">{{ formatReveal(group.revealAt) }}</div>
    </section>

    <section v-else-if="group.pairs && !shown" class="dark" style="padding: 28px 24px">
      <div class="day-title">¡Ha llegado el día!</div>
      <div style="font-size: 16px">Asegúrate de que nadie mira tu pantalla.</div>
      <button class="btn-reveal" @click="reveal">Descubrir a quién le regalo</button>
    </section>

    <section v-else-if="group.pairs && target" class="dark pop">
      <div style="font-size: 17px">Psst, {{ me?.name }}… te ha tocado</div>
      <div class="big-pill target-pill">{{ target.name }}</div>
      <div class="wishlist">
        <div class="wishlist-label">Su lista de deseos</div>
        <div class="wishes">{{ target.wishes.trim() || "No ha pedido nada. Toca improvisar (o investigar)." }}</div>
      </div>
      <button class="btn-ghost" @click="shown = false">Ocultar</button>
    </section>

    <section v-else-if="!group.pairs && members.length >= MIN_MEMBERS" class="dark" style="padding: 24px">
      <div class="day-title">Haciendo el sorteo…</div>
    </section>

    <div v-if="open && !group.pairs && members.length < MIN_MEMBERS" class="warning">
      Se necesitan al menos 3 personas apuntadas para hacer el sorteo.
    </div>

    <section class="members">
      <div class="members-title">
        <h2>Participantes y deseos</h2>
        <span class="subtle" style="font-size: 15px">{{ members.length }}</span>
      </div>

      <div v-if="me" class="my-wishes">
        <div class="member-name">
          <span>{{ me.name }}</span>
          <span class="tag-me">Tú</span>
        </div>
        <textarea
          v-model="myWishes"
          rows="3"
          maxlength="1000"
          placeholder="¿Qué te gustaría? Calcetines divertidos, un libro, chocolate…"
          @input="queueSave"
          @blur="saveNow"
        />
        <div class="hint" style="font-size: 13px">{{ saveLabel }}</div>
      </div>

      <div v-for="member in others" :key="member.id" class="member">
        <strong>{{ member.name }}</strong>
        <span v-if="member.wishes.trim()">{{ member.wishes }}</span>
        <span v-else class="empty">Todavía no ha pedido nada</span>
      </div>
    </section>

    <section class="share">
      <div style="font-size: 15px">¿Falta alguien? Pásale el código:</div>
      <div class="share-row">
        <span class="share-code">{{ group.code }}</span>
        <button class="btn-copy" @click="copy(group.code)">{{ copyLabel }}</button>
      </div>
    </section>
  </div>

  <ConfettiBurst v-if="burst" :key="burst" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { drawIfDue, saveWishes, watchGroup, watchMembers, type Group, type Member, type Session } from "../api";
import { formatCountdown, formatReveal, MIN_MEMBERS } from "../logic";
import { useCopy } from "../useCopy";
import ConfettiBurst from "./ConfettiBurst.vue";

const props = defineProps<{ session: Session }>();
const emit = defineEmits<{ logout: [] }>();

const group = ref<Group | null>(null);
const members = ref<Member[]>([]);
const now = ref(Date.now());
const shown = ref(false);
const burst = ref(0);
const { copy, copyLabel } = useCopy();

const me = computed(() => members.value.find((m) => m.id === props.session.member) ?? null);
const others = computed(() => members.value.filter((m) => m.id !== props.session.member));
const open = computed(() => !!group.value && now.value >= group.value.revealAt.getTime());
const target = computed(() => {
  const id = group.value?.pairs?.[props.session.member];
  return id ? (members.value.find((m) => m.id === id) ?? null) : null;
});

// ---------- Lista de deseos: se guarda sola ----------

const myWishes = ref("");
const dirty = ref(false);
const saveLabel = ref("Todos pueden ver tu lista. Se guarda sola.");
let saveTimer: ReturnType<typeof setTimeout> | undefined;

// Lo que llega de Firestore no pisa lo que se está escribiendo.
watch(me, (value) => {
  if (value && !dirty.value) myWishes.value = value.wishes;
});

function queueSave() {
  dirty.value = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 800);
}

async function saveNow() {
  clearTimeout(saveTimer);
  if (!dirty.value) return;
  const text = myWishes.value;
  try {
    await saveWishes(props.session, text);
    if (myWishes.value === text) dirty.value = false;
    saveLabel.value = "Todos pueden ver tu lista. Se guarda sola.";
  } catch {
    saveLabel.value = "No se ha podido guardar. Revisa la conexión.";
  }
}

// ---------- Sorteo y cuenta atrás ----------

let lastTry = 0;
async function tryDraw() {
  if (!group.value || group.value.pairs || !open.value) return;
  if (members.value.length < MIN_MEMBERS || Date.now() - lastTry < 5000) return;
  lastTry = Date.now();
  try {
    await drawIfDue(group.value.code, members.value.map((m) => m.id));
  } catch {
    // El reloj del móvil puede ir adelantado: se reintenta en el siguiente tic.
  }
}

function reveal() {
  shown.value = true;
  burst.value = Date.now();
  setTimeout(() => (burst.value = 0), 4500);
}

let stopGroup: (() => void) | undefined;
let stopMembers: (() => void) | undefined;
let ticker: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  stopGroup = watchGroup(props.session.code, (g) => {
    if (!g) emit("logout");
    else group.value = g;
  });
  stopMembers = watchMembers(props.session.code, (list) => (members.value = list));
  ticker = setInterval(() => {
    now.value = Date.now();
    void tryDraw();
  }, 1000);
});

onBeforeUnmount(() => {
  void saveNow();
  stopGroup?.();
  stopMembers?.();
  clearInterval(ticker);
});
</script>
