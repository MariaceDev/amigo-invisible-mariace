<template>
  <section class="card">
    <h2>Nuevo grupo</h2>
    <label class="field">
      Nombre del grupo
      <input v-model="name" placeholder="Familia García" maxlength="60" @input="error = ''" />
    </label>
    <div class="date-row">
      <label class="field">
        Día de la revelación
        <input v-model="date" type="date" @input="error = ''" />
      </label>
      <label class="field">
        Hora
        <input v-model="time" type="time" @input="error = ''" />
      </label>
    </div>
    <div class="hint">Ese día, a esa hora, se hace el sorteo solo con todos los que se hayan apuntado.</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="actions">
      <button class="btn btn-outline" @click="emit('back')">Atrás</button>
      <button class="btn btn-primary" :disabled="saving" @click="create">
        {{ saving ? "Creando…" : "Crear grupo" }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { createGroup, type Group } from "../api";
import { revealFromInputs } from "../logic";

const emit = defineEmits<{ back: []; created: [group: Group] }>();

const name = ref("");
const date = ref("2026-12-24");
const time = ref("20:00");
const error = ref("");
const saving = ref(false);

async function create() {
  const revealAt = revealFromInputs(date.value, time.value);
  if (!name.value.trim() || !revealAt) {
    error.value = "Ponle nombre al grupo y elige un día.";
    return;
  }
  saving.value = true;
  try {
    emit("created", await createGroup(name.value, revealAt));
  } catch {
    error.value = "No se pudo crear el grupo. Revisa la conexión e inténtalo otra vez.";
  } finally {
    saving.value = false;
  }
}
</script>
