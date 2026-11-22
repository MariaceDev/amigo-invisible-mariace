/** Mínimo y máximo de participantes de un sorteo. */
export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 50;
const MAX_NAME_LENGTH = 40;

export type Pair = { giver: string; receiver: string };

/**
 * Limpia y valida la lista de participantes que llega del navegador.
 * Quita los huecos vacíos y lanza un error en castellano si algo no cuadra.
 */
export function validateParticipants(input: unknown): string[] {
  if (!Array.isArray(input)) {
    throw new Error("La lista de participantes no es válida.");
  }
  const names = input
    .filter((value): value is string => typeof value === "string")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (names.length < MIN_PARTICIPANTS) {
    throw new Error(`Hacen falta al menos ${MIN_PARTICIPANTS} participantes.`);
  }
  if (names.length > MAX_PARTICIPANTS) {
    throw new Error(`Como mucho ${MAX_PARTICIPANTS} participantes.`);
  }
  const tooLong = names.find((name) => name.length > MAX_NAME_LENGTH);
  if (tooLong) {
    throw new Error(`El nombre «${tooLong.slice(0, 20)}…» es demasiado largo.`);
  }
  const seen = new Set<string>();
  for (const name of names) {
    const key = name.toLocaleLowerCase("es");
    if (seen.has(key)) {
      throw new Error(`«${name}» está repetido. Añade la inicial del apellido para distinguirlos.`);
    }
    seen.add(key);
  }
  return names;
}

/**
 * Sortea las parejas: baraja los nombres (Fisher-Yates) y forma un círculo,
 * cada uno regala al siguiente y el último al primero. Así nadie se toca a
 * sí mismo y todos regalan y reciben exactamente una vez.
 */
export function drawPairs(names: string[], random: () => number = Math.random): Pair[] {
  const shuffled = [...names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.map((giver, i) => ({
    giver,
    receiver: shuffled[(i + 1) % shuffled.length]!,
  }));
}
