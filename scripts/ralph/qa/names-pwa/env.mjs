// Loads scripts/ralph/.env.test.local for the QA scripts. Never prints values.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ENV_FILE = fileURLToPath(new URL("../../.env.test.local", import.meta.url));

const REQUIRED = [
  "NAMES_QA_SUPABASE_URL",
  "NAMES_QA_ANON_KEY",
  "NAMES_QA_SERVICE_ROLE_KEY",
  "NAMES_QA_EMAIL_1",
  "NAMES_QA_EMAIL_2",
  "NAMES_QA_EMAIL_3",
];

function parse(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).replace(/^export\s+/, "").trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

let cached;

/** Returns the QA env. Throws (naming keys only) if the file or a key is missing. */
export function loadEnv() {
  if (cached) return cached;
  let text;
  try {
    text = readFileSync(ENV_FILE, "utf8");
  } catch {
    throw new Error("scripts/ralph/.env.test.local is missing");
  }
  const env = { ...parse(text) };
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length) throw new Error(`.env.test.local is missing: ${missing.join(", ")}`);
  env.NAMES_QA_SUPABASE_URL = env.NAMES_QA_SUPABASE_URL.replace(/\/+$/, "");
  cached = env;
  return env;
}

/** The email of QA user 1, 2 or 3. */
export function qaEmail(n) {
  const email = loadEnv()[`NAMES_QA_EMAIL_${n}`];
  if (!email) throw new Error(`No QA user ${n}; use 1, 2 or 3`);
  return email;
}
