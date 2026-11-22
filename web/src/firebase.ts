import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// En desarrollo (`pnpm dev`) todo va al emulador de Firestore con un proyecto
// "demo-": no toca la nube ni cuesta nada. En producción se usan las variables
// de `.env.production`.
const isDev = import.meta.env.DEV;

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: isDev ? "demo-amigo-invisible" : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const db = getFirestore(app);

if (isDev) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
