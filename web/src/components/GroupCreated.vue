<template>
  <section class="dark pop">
    <div style="font-size: 16px">¡Grupo «{{ group.name }}» creado! Este es el código:</div>
    <div class="big-pill code-pill">{{ group.code }}</div>
    <div style="font-size: 16px; text-wrap: pretty">
      Mándaselo a la familia por WhatsApp. Cada uno entra con el código, su nombre y un PIN.
    </div>
    <div style="font-size: 15px">Revelación: {{ formatReveal(group.revealAt) }}</div>
    <div class="actions-column">
      <button class="btn btn-light-outline" @click="copy(group.code)">{{ copyLabel }}</button>
      <button class="btn btn-primary" @click="emit('join', group.code)">Apuntarme yo también</button>
      <button class="btn-ghost" @click="emit('back')">Ver mis grupos</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Group } from "../api";
import { formatReveal } from "../logic";
import { useCopy } from "../useCopy";

defineProps<{ group: Group }>();
const emit = defineEmits<{ join: [code: string]; back: [] }>();

const { copy, copyLabel } = useCopy();
</script>
