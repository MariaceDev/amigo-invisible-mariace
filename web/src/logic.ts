/**
 * Lógica pura de la app: sin Vue ni Firebase, para poder probarla
 * (ver logic.test.ts).
 */

export const MIN_MEMBERS = 3;
export const MAX_NAME_LENGTH = 40;
export const MAX_WISHES_LENGTH = 1000;

/** «nav-1234 » → «NAV-1234». */
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidCode(code: string): boolean {
  return /^NAV-\d{4}$/.test(code);
}

/** Código nuevo de grupo: NAV- y cuatro cifras. */
export function makeCode(random: () => number = Math.random): string {
  return `NAV-${Math.floor(1000 + random() * 9000)}`;
}

/** Deja el nombre como se ve: sin espacios de más. */
export function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Clave del nombre dentro del grupo: es el id del documento del participante,
 * así dos personas no pueden apuntarse con el mismo nombre (sin mirar
 * mayúsculas). Una barra no puede ir en un id de Firestore.
 */
export function nameKey(name: string): string {
  return cleanName(name).toLocaleLowerCase("es").replace(/\//g, "-");
}

/** Devuelve el error del nombre, o null si vale. */
export function nameError(name: string): string | null {
  const clean = cleanName(name);
  if (!clean) return "Escribe tu nombre.";
  if (clean.length > MAX_NAME_LENGTH) return "Ese nombre es demasiado largo.";
  if (/^\.+$/.test(clean) || /^__.*__$/.test(clean)) return "Ese nombre no vale. Prueba con otro.";
  return null;
}

/** Solo cifras y como mucho cuatro, según se escribe. */
export function cleanPin(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Sortea: baraja (Fisher-Yates) y forma un círculo, cada uno regala al
 * siguiente y el último al primero. Así nadie se regala a sí mismo.
 * Devuelve { quienRegala: aQuien }.
 */
export function drawPairs(ids: string[], random: () => number = Math.random): Record<string, string> {
  if (ids.length < MIN_MEMBERS) {
    throw new Error(`Se necesitan al menos ${MIN_MEMBERS} personas.`);
  }
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return Object.fromEntries(shuffled.map((id, i) => [id, shuffled[(i + 1) % shuffled.length]!]));
}

/** «3d 4h 5m», o «4h 5m 6s» el último día. */
export function formatCountdown(ms: number): string {
  const left = Math.max(0, ms);
  const d = Math.floor(left / 864e5);
  const h = Math.floor(left / 36e5) % 24;
  const m = Math.floor(left / 6e4) % 60;
  const s = Math.floor(left / 1e3) % 60;
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;
}

/** «jueves, 24 de diciembre, 20:00». */
export function formatReveal(date: Date): string {
  return date.toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Fecha y hora de los campos del formulario, en la hora del móvil. */
export function revealFromInputs(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const at = new Date(`${date}T${/^\d{2}:\d{2}$/.test(time) ? time : "00:00"}`);
  return Number.isNaN(at.getTime()) ? null : at;
}

/**
 * Id del documento de acceso: el hash de código, nombre y PIN. El PIN nunca
 * se guarda; para entrar hay que saber los tres.
 */
export async function loginId(code: string, key: string, pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${code}|${key}|${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
