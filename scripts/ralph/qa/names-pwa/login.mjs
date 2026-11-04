// node scripts/ralph/qa/names-pwa/login.mjs <1|2|3>
// Signs a QA user in through Supabase REST (no email is sent) and writes a
// Playwright storageState to .auth/user<N>.json with the session under the
// supabase-js storage key, for both the dev (3000) and prod (3100) origins.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { signInSession } from "./rest.mjs";

export const STORAGE_KEY = "nest-names-auth";
export const ORIGINS = ["http://localhost:3000", "http://localhost:3100"];

export function authFile(n) {
  return fileURLToPath(new URL(`./.auth/user${n}.json`, import.meta.url));
}

/** Writes the storageState for QA user n and returns its path. */
export async function login(n) {
  const session = await signInSession(n);
  // supabase-js v2 (no userStorage) stores JSON.stringify(session), user included.
  const value = JSON.stringify(session);
  const state = {
    cookies: [],
    origins: ORIGINS.map((origin) => ({
      origin,
      localStorage: [{ name: STORAGE_KEY, value }],
    })),
  };
  const file = authFile(n);
  mkdirSync(fileURLToPath(new URL("./.auth/", import.meta.url)), { recursive: true });
  writeFileSync(file, JSON.stringify(state, null, 2));
  return file;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = process.argv[2];
  if (!["1", "2", "3"].includes(n)) {
    console.error("usage: node login.mjs <1|2|3>");
    process.exit(2);
  }
  try {
    await login(n);
    console.log(`QA user ${n} signed in -> scripts/ralph/qa/names-pwa/.auth/user${n}.json`);
  } catch (error) {
    console.error(`login failed: ${error.message}`);
    process.exit(1);
  }
}
