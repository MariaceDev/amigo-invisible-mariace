<script setup lang="ts">
import CreateGroup from "./components/CreateGroup.vue";
import MyAssignment from "./components/MyAssignment.vue";

// Sin router: si la URL trae ?t=<token>, es un participante abriendo su enlace.
const token = new URLSearchParams(window.location.search).get("t");
</script>

<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-title>
        <v-icon icon="mdi-gift-outline" class="mr-2" />
        Amigo invisible
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container max-width="720" class="py-8">
        <MyAssignment v-if="token" :token="token" />
        <CreateGroup v-else />
      </v-container>
    </v-main>
  </v-app>
</template>
