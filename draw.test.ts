{
  "name": "amigo-invisible-mariace",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "emulators": "pnpm --filter functions build && firebase emulators:start --project demo-amigo-invisible --import ./emulator-data --export-on-exit ./emulator-data",
    "dev": "pnpm --filter web dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "deploy": "pnpm build && firebase deploy",
    "deploy:functions": "pnpm --filter functions build && firebase deploy --only functions",
    "deploy:web": "pnpm --filter web build && firebase deploy --only hosting",
    "deploy:rules": "firebase deploy --only firestore:rules,firestore:indexes",
    "logs": "firebase functions:log"
  },
  "devDependencies": {
    "firebase-tools": "^14.0.0"
  }
}
