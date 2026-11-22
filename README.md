# 🎁 Amigo invisible — laboratorio de Google Cloud

App para organizar un amigo invisible: escribes los participantes, una Cloud
Function hace el sorteo y cada persona recibe un enlace privado con su
asignación.

Es pequeña a propósito: sirve para practicar **todo el ciclo de una app en
Google Cloud** —desarrollo local, despliegue, logs, TTL, costes— sin miedo a
romper nada del trabajo.

## Stack

| Parte | Tecnología | Carpeta |
|---|---|---|
| Web | Vue 3 + TypeScript + Vuetify 3 + Vite | `web/` |
| Backend | Cloud Functions v2 (Node 22, TypeScript) | `functions/` |
| Base de datos | Cloud Firestore | reglas en `firestore.rules` |
| Hosting | Firebase Hosting | sirve `web/dist` |

## Cómo funciona

```
Organizador ──► web (CreateGroup.vue)
                  │  httpsCallable("drawSecretSanta")
                  ▼
           Cloud Function drawSecretSanta  (europe-southwest1, Madrid)
                  │  valida, sortea y guarda en un batch
                  ▼
           Firestore: groups/{id}  +  assignments/{token}  (uno por persona)

Participante ──► web/?t=<token> (MyAssignment.vue) ──► lee assignments/{token}
```

- El **token** es el id del documento: 128 bits aleatorios. Quien tiene el
  enlace puede leer SU documento; las reglas impiden listar la colección.
- El sorteo forma un **círculo** (cada uno regala al siguiente), así que nadie
  se toca a sí mismo. Lógica pura en `functions/src/draw.ts`, con tests.

## Requisitos

- Node 22 y pnpm 9 (`npm install -g pnpm@9.15.0`)
- Java 11 o superior (lo necesita el emulador de Firestore)

## Desarrollo local (no toca la nube, no cuesta nada)

```bash
pnpm install
pnpm emulators     # terminal 1: emuladores de Functions + Firestore (UI en http://127.0.0.1:4000)
pnpm dev           # terminal 2: la web en http://localhost:5173
```

Los emuladores usan el proyecto `demo-amigo-invisible`: el prefijo `demo-`
le dice a Firebase que es un proyecto falso, solo local. Los datos se guardan
en `emulator-data/` al cerrar los emuladores.

```bash
pnpm test          # tests del sorteo
pnpm typecheck     # TypeScript en web y functions
```

## Desplegar

Primera vez:

1. Crea el proyecto en la [consola de Firebase](https://console.firebase.google.com)
   con el id `amigo-invisible-mariace`.
2. Actívale el plan **Blaze** (las Cloud Functions lo exigen). Antes de nada,
   crea un **presupuesto** (ver más abajo).
3. Crea la base de datos Firestore en `europe-southwest1` (Madrid).
4. Registra una app web (Configuración del proyecto → Tus apps → `</>`), copia
   `web/.env.example` como `web/.env.production` y rellena los valores.
5. Inicia sesión y despliega:
   ```bash
   pnpm exec firebase login
   pnpm deploy:all   # ojo: `pnpm deploy` a secas es un comando de pnpm, no el script
   ```

Después, despliega solo lo que cambies: `pnpm deploy:functions`,
`pnpm deploy:web` o `pnpm deploy:rules`.

## Ejercicios de Google Cloud

Cada uno practica algo que hablamos para Digibite y para el examen *Associate
Cloud Engineer*.

1. **Presupuesto y alertas.** Facturación → Presupuestos y alertas → crea uno
   de 5 € para este proyecto con avisos al 50 %, 90 % y 100 %.
2. **TTL.** Los sorteos guardan `expireAt` a 60 días. Activa la política:
   ```bash
   gcloud firestore fields ttls update expireAt --collection-group=assignments --enable-ttl --project=amigo-invisible-mariace
   gcloud firestore fields ttls update expireAt --collection-group=groups --enable-ttl --project=amigo-invisible-mariace
   gcloud firestore fields ttls list --project=amigo-invisible-mariace
   ```
3. **Logs.** Haz un sorteo y búscalo en el Explorador de registros:
   ```
   resource.type="cloud_run_revision"
   resource.labels.service_name="drawsecretsanta"
   jsonPayload.message="sorteo creado"
   ```
   Luego intenta un sorteo con dos nombres iguales y busca el aviso
   `sorteo rechazado` (`severity=WARNING`).
4. **Error Reporting.** Provoca un error de verdad (por ejemplo, lanza un
   `throw new Error("prueba")` en la función, despliega y llámala). Míralo
   agrupado en Error Reporting, márcalo como resuelto y quita el error.
5. **Alerta en Cloud Monitoring.** Crea una política que te mande un correo si
   `drawsecretsanta` devuelve errores 5xx.
6. **IAM.** Mira con qué cuenta de servicio corre la función (Cloud Run →
   `drawsecretsanta` → Seguridad) y qué permisos tiene.
7. **Costes.** Tras unos días, mira el informe de facturación agrupado por
   SKU: lecturas y escrituras de Firestore, CPU de Cloud Run…

## Decisiones que conviene conocer

- `maxInstances: 5` en `setGlobalOptions`: tope de seguridad para que un abuso
  no escale la función (ni la factura) sin límite.
- Los logs **nunca** registran quién regala a quién: los logs los ve más gente
  que los datos.
- Los errores esperados (datos mal rellenados) se registran como `warn`, no
  como `error`, para que Error Reporting solo agrupe fallos reales.
