<template>
  <!-- Decoración: no se puede tocar (pointer-events: none). -->
  <div class="fx" style="left: 0; top: 38%">
    <div style="animation: peekL 11s ease-in-out infinite; transform-origin: left center">
      <ElfFigure wave :scale="0.8" />
    </div>
    <div class="elf-bubble" style="left: 54px; animation: bubL 11s ease-in-out 0s infinite">
      Psst… ¿a quién te ha tocado?
    </div>
  </div>

  <div class="fx" style="right: 0; top: 62%">
    <div style="animation: peekR 11s ease-in-out 3s infinite; transform-origin: right center">
      <ElfFigure hat="#386641" tunic="#BC4749" :scale="0.8" />
    </div>
    <div class="elf-bubble" style="right: 54px; animation: bubL 11s ease-in-out 3.8s infinite">
      ¡Yo no he visto nada!
    </div>
  </div>

  <div class="fx" style="bottom: 2px; left: -70px; animation: walk 22s linear 2s infinite">
    <div style="animation: hop 0.45s ease-in-out infinite">
      <ElfFigure walk :scale="0.7" />
    </div>
  </div>

  <div
    class="fx"
    style="
      position: absolute;
      top: 0;
      right: max(8px, calc(50% - 290px));
      transform-origin: top center;
      animation: swing 2.6s ease-in-out infinite;
      display: flex;
      flex-direction: column;
      align-items: center;
    "
  >
    <div style="width: 2px; height: 30px; background: #386641" />
    <div style="margin-top: -24px">
      <ElfFigure wave :scale="0.65" hat="#6A994E" tunic="#386641" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ElfFigure from "./ElfFigure";
</script>
