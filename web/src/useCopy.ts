import { computed, ref } from "vue";

/** Botón «Copiar» que pasa a «¡Copiado!» un momento. */
export function useCopy() {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Sin permiso para el portapapeles: el código se ve en pantalla igualmente.
    }
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 1500);
  }

  return { copy, copyLabel: computed(() => (copied.value ? "¡Copiado!" : "Copiar")) };
}
