<template>
  <section class="card">
    <div v-if="groupName" style="display: flex; flex-direction: column; gap: 2px">
      <div class="subtle">Te apuntas a</div>
      <h2>{{ groupName }}</h2>
    </div>
    <h2 v-else>Apúntate</h2>

    <label class="field">
      Código del grupo
      <input v-model="code" class="input-code" placeholder="NAV-0000" maxlength="8" autocomplete="off" @input="error = ''" />
    </label>
    <label class="field">
      Tu nombre
      <input v-model="name" placeholder="Como te llama la familia" maxlength="40" @input="error = ''" />
    </label>
    <label class="field">
      PIN secreto (4 números)
      <input
        :value="pin"
        class="input-pin"
        inputmode="numeric"
        maxlength="4"
        placeholder="••••"
        autocomplete="off"
        @input="onPin"
      />
      <span class="hint">Para que nadie entre con tu nombre y te espíe el regalo.</span>
    </label>

    <div v-if="error" class="error">{{ error }}</div>
    <div class="actions">
      <button class="btn btn-outline" @click="emit('back')">Atrás</button>
      <button class="btn btn-primary" :disabled="busy" @click="enter">{{ busy ? "Entrando…" : "Entrar" }}</button>
    </div>
    <div class="hint">¿Ya te apuntaste? Pon el mismo nombre y PIN para volver a entrar.</div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { getGroup, join, JoinError, type Session } from "../api";
import { cleanPin, isValidCode, isValidPin, nameError, normalizeCode } from "../logic";

const props = defineProps<{ initialCode: string }>();
const emit = defineEmits<{ back: []; joined: [session: Session] }>();

const code = ref(props.initialCode);
const name = ref("");
const pin = ref("");
const error = ref("");
const busy = ref(false);
const groupName = ref("");

// Con un código bien escrito, se enseña a qué grupo se apunta.
watch(
  code,
  async (value) => {
    const normalized = normalizeCode(value);
    groupName.value = "";
    if (!isValidCode(normalized)) return;
    try {
      const group = await getGroup(normalized);
      if (normalizeCode(code.value) === normalized) groupName.value = group?.name ?? "";
    } catch {
      // Sin conexión: ya avisará al pulsar «Entrar».
    }
  },
  { immediate: true },
);

function onPin(event: Event) {
  const input = event.target as HTMLInputElement;
  pin.value = cleanPin(input.value);
  input.value = pin.value;
  error.value = "";
}

async function enter() {
  const normalized = normalizeCode(code.value);
  if (!isValidCode(normalized)) {
    error.value = "Ese código no existe. Revísalo con quien organiza.";
    return;
  }
  const badName = nameError(name.value);
  if (badName) {
    error.value = badName;
    return;
  }
  if (!isValidPin(pin.value)) {
    error.value = "El PIN tiene que ser de 4 números.";
    return;
  }
  busy.value = true;
  try {
    emit("joined", await join(normalized, name.value, pin.value));
  } catch (err) {
    error.value =
      err instanceof JoinError ? err.message : "No se pudo entrar. Revisa la conexión e inténtalo otra vez.";
  } finally {
    busy.value = false;
  }
}
</script>
