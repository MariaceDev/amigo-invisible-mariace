# 🎁 Amigo invisible

App web, pensada para el móvil, para el amigo invisible de la familia. Quien
organiza crea el grupo con el día y la hora de la revelación y comparte un
código. Cada familiar se apunta con el código, su nombre y un PIN, ve a todos
los participantes con sus listas de deseos y edita la suya. Llegada la hora,
el sorteo sale solo y a cada uno le aparece a quién le regala (con su lista
de deseos), con confeti.

El diseño es el de Claude Design («Sorteo de Navidad v3»): colores, tipografía
Bricolage Grotesque, tarjetas con sombra dura y elfos que se asoman.

**Publicada en https://amigo-invisible-mariace.web.app**

## Stack

| Parte         | Tecnología                                 | Carpeta                    |
| ------------- | ------------------------------------------ | -------------------------- |
| Web           | Vue 3 + TypeScript + Vite, CSS propio      | `web/`                     |
| Base de datos | Cloud Firestore (Madrid, `europe-southwest1`) | reglas en `firestore.rules` |
| Hosting       | Firebase Hosting                           | sirve `web/dist`           |

Funciona en el **plan Spark (gratis)**: no hay Cloud Functions. La carpeta
`functions/` es la versión anterior, con el sorteo en una Cloud Function; no
se despliega (necesitaría el plan Blaze).

## Cómo funciona

```
groups/{código}                 { name, revealAt, pairs: {clave: clave} | null, createdAt }
  members/{clave del nombre}    { name, wishes, joinedAt }
  logins/{hash}                 { member }
```

- **Código** `NAV-1234`: es el id del grupo. Con él se lee el grupo; los
  grupos no se pueden listar.
- **Nombre único** por grupo, sin mirar mayúsculas: el id del participante es
  su nombre normalizado (`nameKey`).
- **PIN**: no se guarda. El acceso es un documento cuyo id es el SHA-256 de
  código + nombre + PIN; para entrar hay que saber los tres. Las reglas solo
  dejan crearlo junto con el alta del participante, así que nadie puede
  añadir un segundo PIN a un nombre ajeno.
- **Sorteo**: lo hace el primer móvil que abre el grupo pasada la hora, en
  una transacción. Baraja y forma un círculo (cada uno regala al siguiente),
  así que nadie se toca a sí mismo (`drawPairs` en `web/src/logic.ts`). Las
  reglas solo dejan escribirlo **una vez** y **después de `revealAt`** (hora
  del servidor), y después del sorteo nadie más se puede apuntar.

**Límite conocido** (por no usar servidor): los emparejamientos están en el
documento del grupo y la app solo enseña el tuyo, pero alguien con
conocimientos técnicos podría leerlos todos, o probar los 10.000 PIN. Para
una familia vale; para algo más serio, el sorteo debería ir en una Cloud
Function (plan Blaze).

## Requisitos

- Node 22 y pnpm 9 (`npm install -g pnpm@9.15.0`)
- Java 11 o superior (para el emulador de Firestore)

## Desarrollo local (no toca la nube, no cuesta nada)

```bash
pnpm install
pnpm emulators     # terminal 1: emulador de Firestore (UI en http://127.0.0.1:4000)
pnpm dev           # terminal 2: la web en http://localhost:5173
```

El emulador usa el proyecto `demo-amigo-invisible` (el prefijo `demo-` es un
proyecto falso, solo local). Para probar la revelación sin esperar, crea un
grupo con la hora ya pasada.

```bash
pnpm test          # tests de la lógica (sorteo, PIN, fechas…)
pnpm typecheck
```

## Desplegar

Ya está todo creado en `amigo-invisible-mariace` (base de datos en Madrid,
app web registrada y `web/.env.production`, que no se sube a git). Después de
cambiar algo:

```bash
pnpm deploy:web     # solo la web
pnpm deploy:rules   # solo las reglas de Firestore
pnpm deploy:all     # las dos cosas
```

Ojo: `pnpm deploy` a secas es un comando de pnpm, no el script. Y no uses
`firebase deploy` a pelo: usa la CLI global en vez de la del proyecto.

En un proyecto nuevo: crea la base de datos con
`pnpm exec firebase firestore:databases:create "(default)" --location europe-southwest1`,
registra una app web (`firebase apps:create WEB`) y copia `web/.env.example`
como `web/.env.production` con sus valores (`firebase apps:sdkconfig`).
