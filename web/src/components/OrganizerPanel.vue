<template>
  <div v-if="!ready" class="loading">Cargando…</div>

  <!-- Sin entrar: solo el botón de Google. -->
  <section v-else-if="!user" class="card">
    <h2>Zona de la organizadora</h2>
    <div class="hint">Solo quien organiza crea los grupos. El resto de la familia entra con el código.</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="actions">
      <button class="btn btn-outline" @click="emit('back')">Atrás</button>
      <button class="btn btn-primary" :disabled="busy" @click="signIn">
        {{ busy ? "Entrando…" : "Entrar con Google" }}
      </button>
    </div>
  </section>

  <!-- Una cuenta de Google que no es la de la organizadora. -->
  <section v-else-if="!isAdmin" class="card">
    <h2>Esta cuenta no organiza</h2>
    <div class="hint">
      Con {{ user.email }} no se pueden crear grupos. Si te han pasado un código, entra con él desde el inicio.
    </div>
    <div class="hint" style="font-size: 12px; word-break: break-all">Identificador: {{ user.uid }}</div>
    <div class="actions">
      <button class="btn btn-outline" @click="emit('back')">Atrás</button>
      <button class="btn btn-primary" @click="signOut">Salir de Google</button>
    </div>
  </section>

  <!-- La organizadora: sus grupos y crear uno nuevo. -->
  <div v-else class="stack">
    <div class="me-header">
      <div class="me-names">
        <span class="me-group">Organizadora</span>
        <span class="me-hello">Hola, {{ firstName }}</span>
      </div>
      <button class="btn-small" @click="signOut">Salir</button>
    </div>

    <button class="choice choice-primary" @click="emit('create')">
      <span class="choice-title">Nuevo grupo</span>
      <span>Elijo el día de la revelación y comparto el código</span>
    </button>

    <section class="members">
      <div class="members-title">
        <h2>Tus grupos</h2>
        <span class="subtle" style="font-size: 15px">{{ groups.length }}</span>
      </div>
      <div v-if="!groups.length" class="member">
        <span class="empty">Todavía no has creado ningún grupo.</span>
      </div>
      <div v-for="group in groups" :key="group.code" class="member">
        <strong>{{ group.name }}</strong>
        <span>{{ group.pairs ? "Sorteo hecho" : "Revelación" }}: {{ formatReveal(group.revealAt) }}</span>
        <div class="share-row" style="margin-top: 4px">
          <span class="share-code" style="font-size: 20px">{{ group.code }}</span>
          <button class="btn-small" @click="copy(group.code)">Copiar</button>
          <button class="btn-small" @click="emit('join', group.code)">Entrar</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { User } from "firebase/auth";
import { signInAsOrganizer, signOutOrganizer, watchMyGroups, watchUser, type Group } from "../api";
import { ADMIN_UID } from "../admin";
import { formatReveal } from "../logic";
import { useCopy } from "../useCopy";

const emit = defineEmits<{ back: []; create: []; join: [code: string] }>();

const ready = ref(false);
const user = ref<User | null>(null);
const groups = ref<Group[]>([]);
const busy = ref(false);
const error = ref("");
const { copy } = useCopy();

const isAdmin = computed(() => user.value?.uid === ADMIN_UID);
const firstName = computed(() => user.value?.displayName?.split(" ")[0] ?? "");

async function signIn() {
  busy.value = true;
  error.value = "";
  try {
    await signInAsOrganizer();
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
      error.value = "No se pudo entrar con Google. Inténtalo otra vez.";
    }
  } finally {
    busy.value = false;
  }
}

async function signOut() {
  await signOutOrganizer();
}

let stopUser: (() => void) | undefined;
let stopGroups: (() => void) | undefined;

watch(isAdmin, (admin) => {
  stopGroups?.();
  stopGroups = undefined;
  groups.value = [];
  if (admin && user.value) stopGroups = watchMyGroups(user.value.uid, (list) => (groups.value = list));
});

onMounted(() => {
  stopUser = watchUser((value) => {
    user.value = value;
    ready.value = true;
  });
});

onBeforeUnmount(() => {
  stopUser?.();
  stopGroups?.();
});
</script>
