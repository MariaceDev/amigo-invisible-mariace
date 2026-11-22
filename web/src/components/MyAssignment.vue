<script setup lang="ts">
import { onMounted, ref } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const props = defineProps<{ token: string }>();

interface Assignment {
  groupName: string;
  budget: string;
  giver: string;
  receiver: string;
}

const loading = ref(true);
const assignment = ref<Assignment | null>(null);
const revealed = ref(false);

onMounted(async () => {
  // Lectura directa a Firestore: las reglas permiten `get` de este documento
  // (si conoces el token) pero no listar la colección.
  const snapshot = await getDoc(doc(db, "assignments", props.token));
  assignment.value = snapshot.exists() ? (snapshot.data() as Assignment) : null;
  loading.value = false;
});
</script>

<template>
  <v-card rounded="lg" elevation="2" class="text-center pa-6">
    <v-progress-circular v-if="loading" indeterminate color="primary" />

    <template v-else-if="assignment">
      <div class="text-overline">{{ assignment.groupName }}</div>
      <div class="text-h5 mb-6">Hola, {{ assignment.giver }} 👋</div>

      <v-btn v-if="!revealed" color="primary" size="x-large" prepend-icon="mdi-gift" @click="revealed = true">
        Descubrir a quién le regalo
      </v-btn>

      <template v-else>
        <div class="text-body-1">Tu amigo invisible es</div>
        <div class="text-h3 text-primary font-weight-bold my-4">{{ assignment.receiver }}</div>
        <v-chip v-if="assignment.budget" color="secondary" prepend-icon="mdi-cash">
          Presupuesto: {{ assignment.budget }}
        </v-chip>
      </template>
    </template>

    <v-alert v-else type="warning" variant="tonal">
      Este enlace no existe o ha caducado. Pide a quien organizó el sorteo que te lo vuelva a enviar.
    </v-alert>
  </v-card>
</template>
