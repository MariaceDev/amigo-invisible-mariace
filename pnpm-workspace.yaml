import { randomBytes } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { drawPairs, validateParticipants } from "./draw";

initializeApp();

// Opciones para TODAS las funciones de este proyecto.
// - region: Madrid, cerca de los usuarios.
// - maxInstances: tope de seguridad. Si alguien abusa de la función, no
//   escalará a cientos de instancias ni disparará la factura.
setGlobalOptions({ region: "europe-southwest1", maxInstances: 5 });

/** Días que se conserva un sorteo. Lo borra solo la política TTL sobre `expireAt`. */
const RETENTION_DAYS = 60;

interface DrawRequest {
  groupName?: unknown;
  budget?: unknown;
  participants?: unknown;
}

export interface DrawResponse {
  groupId: string;
  links: { name: string; token: string }[];
}

export const drawSecretSanta = onCall<DrawRequest, Promise<DrawResponse>>(async (request) => {
  const groupName = typeof request.data.groupName === "string" ? request.data.groupName.trim() : "";
  if (!groupName) {
    throw new HttpsError("invalid-argument", "Ponle un nombre al grupo.");
  }
  const budget = typeof request.data.budget === "string" ? request.data.budget.trim().slice(0, 40) : "";

  let names: string[];
  try {
    names = validateParticipants(request.data.participants);
  } catch (err) {
    // Error esperado (datos mal rellenados): aviso, no error. Así Error
    // Reporting solo agrupa los fallos de verdad.
    logger.warn("sorteo rechazado", { reason: (err as Error).message });
    throw new HttpsError("invalid-argument", (err as Error).message);
  }

  const db = getFirestore();
  const groupRef = db.collection("groups").doc();
  const expireAt = Timestamp.fromMillis(Date.now() + RETENTION_DAYS * 86_400_000);
  const pairs = drawPairs(names);

  // Una sola escritura atómica: o se guarda el sorteo entero o nada.
  const batch = db.batch();
  batch.set(groupRef, {
    name: groupName,
    budget,
    participantCount: names.length,
    createdAt: FieldValue.serverTimestamp(),
    expireAt,
  });

  const links = pairs.map((pair) => {
    // El id del documento ES el enlace secreto: 128 bits aleatorios, imposible de adivinar.
    const token = randomBytes(16).toString("base64url");
    batch.set(db.collection("assignments").doc(token), {
      groupId: groupRef.id,
      groupName,
      budget,
      giver: pair.giver,
      receiver: pair.receiver,
      expireAt,
    });
    return { name: pair.giver, token };
  });

  await batch.commit();

  // Log estructurado: en el Explorador de registros puedes filtrar por
  // jsonPayload.groupId o jsonPayload.participants. Nunca registres quién
  // regala a quién: los logs los puede leer más gente que los datos.
  logger.info("sorteo creado", { groupId: groupRef.id, participants: names.length });

  return { groupId: groupRef.id, links };
});
