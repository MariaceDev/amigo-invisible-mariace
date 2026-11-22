<template>
  <div class="page">
    <div class="column">
      <header class="header">
        <div class="pill-year">Navidad 2026</div>
        <h1 class="title">Amigo invisible</h1>
      </header>

      <div v-if="screen === 'loading'" class="loading">Cargando…</div>

      <div v-else-if="screen === 'home'" class="stack">
        <div class="intro">
          Cada uno se apunta desde su móvil. El día señalado, a cada persona le aparece a quién tiene que regalar. Ni
          antes ni después.
        </div>
        <button class="choice choice-primary" @click="goJoin('')">
          <span class="choice-title">Tengo un código</span>
          <span>Me apunto al grupo de la familia, o vuelvo a entrar</span>
        </button>
        <button class="choice" @click="screen = 'create'">
          <span class="choice-title">Soy quien organiza</span>
          <span>Creo el grupo, elijo el día y comparto el código</span>
        </button>
      </div>

      <CreateGroup v-else-if="screen === 'create'" @back="screen = 'home'" @created="onCreated" />

      <GroupCreated v-else-if="screen === 'created' && created" :group="created" @join="goJoin" />

      <JoinGroup v-else-if="screen === 'join'" :initial-code="joinCode" @back="screen = 'home'" @joined="onJoined" />

      <MySpace v-else-if="screen === 'me' && session" :key="session.login" :session="session" @logout="logout" />
    </div>
  </div>

  <ElvesDecor />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { checkSession, type Group, type Session } from "./api";
import CreateGroup from "./components/CreateGroup.vue";
import ElvesDecor from "./components/ElvesDecor.vue";
import GroupCreated from "./components/GroupCreated.vue";
import JoinGroup from "./components/JoinGroup.vue";
import MySpace from "./components/MySpace.vue";
import { isValidCode, normalizeCode } from "./logic";

type Screen = "loading" | "home" | "create" | "created" | "join" | "me";

const SESSION_KEY = "amigo-invisible-sesion";

const screen = ref<Screen>("loading");
const session = ref<Session | null>(null);
const created = ref<Group | null>(null);
const joinCode = ref("");

function readSession(): Session | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Partial<Session> | null;
    if (raw && typeof raw.code === "string" && typeof raw.member === "string" && typeof raw.login === "string") {
      return { code: raw.code, member: raw.member, login: raw.login };
    }
  } catch {
    // Sin localStorage (modo privado): se entra con nombre y PIN.
  }
  return null;
}

function writeSession(value: Session | null) {
  try {
    if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Igual que arriba.
  }
}

function goJoin(code: string) {
  joinCode.value = code;
  screen.value = "join";
}

function onCreated(group: Group) {
  created.value = group;
  screen.value = "created";
}

function onJoined(value: Session) {
  session.value = value;
  writeSession(value);
  screen.value = "me";
}

function logout() {
  session.value = null;
  writeSession(null);
  screen.value = "home";
}

onMounted(async () => {
  // Un enlace con ?codigo=NAV-1234 abre «Apúntate» con el código puesto.
  const fromLink = normalizeCode(new URLSearchParams(window.location.search).get("codigo") ?? "");

  const saved = readSession();
  if (saved) {
    try {
      if (await checkSession(saved)) {
        session.value = saved;
        screen.value = "me";
        return;
      }
      writeSession(null);
    } catch {
      // Sin conexión: se intenta igualmente; Firestore avisará.
      session.value = saved;
      screen.value = "me";
      return;
    }
  }
  if (isValidCode(fromLink)) goJoin(fromLink);
  else screen.value = "home";
});
</script>
