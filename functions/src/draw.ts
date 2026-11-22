/**
 * Lógica pura del sorteo: sin Firebase, sin red. Por eso se puede probar con un
 * test unitario en milisegundos (ver draw.test.ts).
 */

export interface Pair {
  giver: string;
  receiver: string;
}

export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 50;

/** Limpia los nombres y comprueba que el grupo se puede sortear. */
export function validateParticipants(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    throw new Error("La lista de participantes no es válida.");
  }
  const names = raw
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter((n) => n.length > 0);

  if (names.length < MIN_PARTICIPANTS) {
    throw new Error(`Hacen falta al menos ${MIN_PARTICIPANTS} participantes.`);
  }
  if (names.length > MAX_PARTICIPANTS) {
    throw new Error(`Como máximo ${MAX_PARTICIPANTS} participantes.`);
  }
  const unique = new Set(names.map((n) => n.toLocaleLowerCase("es")));
  if (unique.size !== names.length) {
    throw new Error("Hay nombres repetidos: añade un apellido o una inicial.");
  }
  return names;
}

/**
 * Baraja y forma un único círculo: cada persona regala a la siguiente y la
 * última a la primera. Así nadie se puede tocar a sí mismo, y no hace falta
 * repetir el sorteo hasta que "salga bien".
 *
 * `random` se inyecta para que el test pueda fijar el resultado.
 */
export function drawPairs(names: string[], random: () => number = Math.random): Pair[] {
  const shuffled = [...names];
  // Fisher–Yates: cada orden posible tiene la misma probabilidad.
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((giver, i) => ({
    giver,
    receiver: shuffled[(i + 1) % shuffled.length],
  }));
}
