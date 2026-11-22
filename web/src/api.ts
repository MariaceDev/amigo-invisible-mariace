/**
 * Todo lo que toca Firestore. Modelo:
 *
 *   groups/{código}              { name, revealAt, pairs: {clave: clave} | null, adminId, createdAt }
 *     members/{clave del nombre} { name, wishes, joinedAt }
 *     logins/{hash}              { member }   ← hash de código + nombre + PIN
 *
 * El sorteo lo escribe el primer móvil que abre el grupo pasada la hora
 * (`drawIfDue`). Las reglas solo dejan escribirlo una vez y después de
 * `revealAt`.
 */
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { cleanName, drawPairs, loginId, makeCode, MIN_MEMBERS, nameKey } from "./logic";

export type Group = {
  code: string;
  name: string;
  revealAt: Date;
  pairs: Record<string, string> | null;
};

export type Member = {
  id: string;
  name: string;
  wishes: string;
};

export type Session = {
  code: string;
  member: string;
  login: string;
};

const groupRef = (code: string) => doc(db, "groups", code);
const memberRef = (code: string, key: string) => doc(db, "groups", code, "members", key);
const loginRef = (code: string, id: string) => doc(db, "groups", code, "logins", id);

function toGroup(code: string, data: Record<string, unknown>): Group {
  const revealAt = data.revealAt instanceof Timestamp ? data.revealAt.toDate() : new Date(0);
  const pairs = data.pairs && typeof data.pairs === "object" ? (data.pairs as Record<string, string>) : null;
  return { code, name: String(data.name ?? ""), revealAt, pairs };
}

export async function getGroup(code: string): Promise<Group | null> {
  const snap = await getDoc(groupRef(code));
  return snap.exists() ? toGroup(code, snap.data()) : null;
}

// ---------- La organizadora (cuenta de Google) ----------

export function watchUser(onChange: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, onChange);
}

export async function signInAsOrganizer(): Promise<void> {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutOrganizer(): Promise<void> {
  await signOut(auth);
}

/** Los grupos de la organizadora, del más reciente al más antiguo. */
export function watchMyGroups(uid: string, onChange: (groups: Group[]) => void): Unsubscribe {
  return onSnapshot(query(collection(db, "groups"), where("adminId", "==", uid)), (snap) => {
    const groups = snap.docs.map((d) => toGroup(d.id, d.data()));
    groups.sort((a, b) => b.revealAt.getTime() - a.revealAt.getTime());
    onChange(groups);
  });
}

/** Crea el grupo con un código libre y lo devuelve. Solo la organizadora. */
export async function createGroup(name: string, revealAt: Date): Promise<Group> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Entra con tu cuenta de Google para crear grupos.");
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = makeCode();
    const created = await runTransaction(db, async (tx) => {
      const ref = groupRef(code);
      if ((await tx.get(ref)).exists()) return false;
      tx.set(ref, {
        name: cleanName(name),
        revealAt: Timestamp.fromDate(revealAt),
        pairs: null,
        adminId: uid,
        createdAt: serverTimestamp(),
      });
      return true;
    });
    if (created) return { code, name: cleanName(name), revealAt, pairs: null };
  }
  throw new Error("No se pudo crear el grupo. Inténtalo otra vez.");
}

export class JoinError extends Error {}

/**
 * Apuntarse o volver a entrar. Si el nombre ya está, el PIN tiene que
 * coincidir; si no, se apunta (mientras no se haya hecho el sorteo).
 */
export async function join(code: string, name: string, pin: string): Promise<Session> {
  const group = await getGroup(code);
  if (!group) throw new JoinError("Ese código no existe. Revísalo con quien organiza.");

  const key = nameKey(name);
  const login = await loginId(code, key, pin);
  const existing = await getDoc(memberRef(code, key));

  if (existing.exists()) {
    const access = await getDoc(loginRef(code, login));
    if (!access.exists()) throw new JoinError("Ese nombre ya está apuntado y el PIN no coincide.");
    return { code, member: key, login };
  }
  if (group.pairs) throw new JoinError("El sorteo ya se hizo. Habla con quien organiza.");

  const batch = writeBatch(db);
  batch.set(memberRef(code, key), { name: cleanName(name), wishes: "", joinedAt: serverTimestamp() });
  batch.set(loginRef(code, login), { member: key });
  await batch.commit();
  return { code, member: key, login };
}

/** Comprueba que una sesión guardada sigue valiendo. */
export async function checkSession(session: Session): Promise<boolean> {
  const access = await getDoc(loginRef(session.code, session.login));
  return access.exists() && access.data().member === session.member;
}

export function watchGroup(code: string, onChange: (group: Group | null) => void): Unsubscribe {
  return onSnapshot(groupRef(code), (snap) => onChange(snap.exists() ? toGroup(code, snap.data()) : null));
}

export function watchMembers(code: string, onChange: (members: Member[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "groups", code, "members"), (snap) => {
    const members = snap.docs.map((d) => ({
      id: d.id,
      name: String(d.data().name ?? ""),
      wishes: String(d.data().wishes ?? ""),
    }));
    members.sort((a, b) => a.name.localeCompare(b.name, "es"));
    onChange(members);
  });
}

export async function saveWishes(session: Session, wishes: string): Promise<void> {
  await updateDoc(memberRef(session.code, session.member), { wishes });
}

/**
 * Hace el sorteo si ya es la hora y nadie lo ha hecho. En una transacción:
 * si dos móviles lo intentan a la vez, solo vale el primero.
 */
export async function drawIfDue(code: string, memberIds: string[]): Promise<void> {
  if (memberIds.length < MIN_MEMBERS) return;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(groupRef(code));
    if (!snap.exists()) return;
    const group = toGroup(code, snap.data());
    if (group.pairs || Date.now() < group.revealAt.getTime()) return;
    tx.update(groupRef(code), { pairs: drawPairs(memberIds) });
  });
}
