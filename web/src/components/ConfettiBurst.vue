<template>
  <div class="confetti">
    <span v-for="(piece, i) in pieces" :key="i" :style="piece" />
  </div>
</template>

<script setup lang="ts">
// ~110 piezas con los colores de la paleta; caen en 2,2–4 s girando.
const colors = ["#BC4749", "#A7C957", "#6A994E", "#386641", "#F2E8CF", "#ffffff"];

const pieces = Array.from({ length: 110 }, (_, i) => {
  const w = 6 + Math.random() * 8;
  const round = Math.random() < 0.3;
  return {
    left: `${Math.random() * 100}%`,
    width: `${w}px`,
    height: `${round ? w : w * 1.8}px`,
    background: colors[i % colors.length],
    borderRadius: round ? "50%" : "2px",
    "--dx": `${Math.random() * 160 - 80}px`,
    "--r": `${Math.random() * 1080 - 540}deg`,
    animation: `fall ${2.2 + Math.random() * 1.8}s cubic-bezier(.25,.6,.4,1) ${Math.random() * 0.6}s forwards`,
  };
});
</script>
