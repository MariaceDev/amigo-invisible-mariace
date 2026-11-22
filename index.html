<script setup lang="ts">
import { computed, ref } from "vue";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

interface DrawResponse {
  groupId: string;
  links: { name: string; token: string }[];
}

const groupName = ref("");
const budget = ref("");
const participants = ref<string[]>(["", "", ""]);
const loading = ref(false);
const errorMessage = ref("");
const result = ref<DrawResponse | null>(null);
const copied = ref("");

const filledCount = computed(() => participants.value.filter((p) => p.trim()).length);

function addParticipant() {
  participants.value.push("");
}

function removeParticipant(index: number) {
  participants.value.splice(index, 1);
}

function linkFor(token: string): string {
  return `${window.location.origin}/?t=${token}`;
}

async function copyLink(name: string, token: string) {
  await navigator.clipboard.writeText(linkFor(token));
  copied.value = name;
}

async function draw() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const call = httpsCallable<object, DrawResponse>(functions, "drawSecretSanta");
    const response = await call({
      groupName: groupName.value,
      budget: budget.value,
      participants: participants.value,
    });
    result.value = response.data;
  } catch (err) {
    // El mensaje viene de la función (HttpsError) y ya está en castellano.
    errorMessage.value = err instanceof Error ? err.message : "No se pudo hacer el sorteo.";
  } finally {
    loading.value = false;
  }
}

function reset() {
  result.value = null;
  copied.value = "";
}
</script>

<template>
  <v-card v-if="!result" rounded="lg" elevation="2">
    <v-card-title class="text-h5 pt-6 px-6">Organiza tu amigo invisible</v-card-title>
    <v-card-subtitle class="px-6">
      Cada persona recibirá un enlace privado con su amigo invisible. Nadie más lo verá, ni siquiera tú.
    </v-card-subtitle>

    <v-card-text class="px-6">
      <v-text-field v-model="groupName" label="Nombre del grupo" placeholder="Cena de Navidad 2026" class="mt-4" />
      <v-text-field v-model="budget" label="Presupuesto (opcional)" placeholder="20 €" />

      <div class="text-subtitle-1 mb-2">Participantes ({{ filledCount }})</div>
      <v-text-field
        v-for="(_, index) in participants"
        :key="index"
        v-model="participants[index]"
        :label="`Participante ${index + 1}`"
        density="comfortable"
        :append-inner-icon="participants.length > 3 ? 'mdi-close' : undefined"
        @click:append-inner="removeParticipant(index)"
      />
      <v-btn variant="text" prepend-icon="mdi-plus" @click="addParticipant">Añadir participante</v-btn>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">{{ errorMessage }}</v-alert>
    </v-card-text>

    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn color="primary" variant="flat" size="large" :loading="loading" prepend-icon="mdi-shuffle-variant" @click="draw">
        Hacer el sorteo
      </v-btn>
    </v-card-actions>
  </v-card>

  <v-card v-else rounded="lg" elevation="2">
    <v-card-title class="text-h5 pt-6 px-6">¡Sorteo hecho! 🎁</v-card-title>
    <v-card-subtitle class="px-6">Envía a cada persona SU enlace. No abras los de los demás.</v-card-subtitle>

    <v-list class="px-2">
      <v-list-item v-for="link in result.links" :key="link.token" :title="link.name" prepend-icon="mdi-account">
        <template #append>
          <v-btn
            :color="copied === link.name ? 'secondary' : 'primary'"
            variant="tonal"
            :prepend-icon="copied === link.name ? 'mdi-check' : 'mdi-content-copy'"
            @click="copyLink(link.name, link.token)"
          >
            {{ copied === link.name ? "Copiado" : "Copiar enlace" }}
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-card-actions class="px-6 pb-6">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="reset">Nuevo sorteo</v-btn>
    </v-card-actions>
  </v-card>
</template>
