// Supabase REST helpers for QA. Never logs tokens, codes or emails.
import { randomBytes } from "node:crypto";
import { loadEnv, qaEmail } from "./env.mjs";

function base() {
  return loadEnv().NAMES_QA_SUPABASE_URL;
}

function anonHeaders(token) {
  const { NAMES_QA_ANON_KEY } = loadEnv();
  return {
    apikey: NAMES_QA_ANON_KEY,
    Authorization: `Bearer ${token ?? NAMES_QA_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function adminHeaders() {
  const { NAMES_QA_SERVICE_ROLE_KEY } = loadEnv();
  return {
    apikey: NAMES_QA_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${NAMES_QA_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function call(path, { method = "GET", headers, body, label = path } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${base()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    // Per-user rate limit (e.g. resend): wait 60 s and retry once.
    if (res.status === 429 && attempt === 0) {
      await sleep(60_000);
      continue;
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const reason = data?.msg ?? data?.message ?? data?.error_description ?? data?.error ?? "";
      throw new Error(`${method} ${label} -> ${res.status} ${reason}`.trim());
    }
    return data;
  }
}

/** A fresh 6-digit email code from admin generate_link. No email is sent. */
export async function emailCode(email) {
  const data = await call("/auth/v1/admin/generate_link", {
    method: "POST",
    headers: adminHeaders(),
    body: { type: "magiclink", email },
    label: "admin/generate_link",
  });
  const code = data?.email_otp ?? data?.properties?.email_otp;
  if (!code) throw new Error("admin/generate_link returned no email_otp");
  return code;
}

/** Signs in an email user without the UI and returns the full session. */
export async function sessionFor(email) {
  const token = await emailCode(email);
  const session = await call("/auth/v1/verify", {
    method: "POST",
    headers: anonHeaders(),
    body: { type: "email", email, token },
    label: "verify",
  });
  if (!session?.access_token) throw new Error("verify returned no session");
  if (!session.expires_at) session.expires_at = Math.round(Date.now() / 1000) + (session.expires_in ?? 3600);
  return session;
}

/** Signs in QA user 1, 2 or 3; returns the full session. */
export function signInSession(n) {
  return sessionFor(qaEmail(n));
}

/** Signs in QA user 1, 2 or 3; returns the access token. */
export async function signIn(n) {
  return (await signInSession(n)).access_token;
}

/** The user's own name_votes rows (RLS), all spaces. */
export function votes(token) {
  return call("/rest/v1/name_votes?select=*&order=updated_at.asc", {
    headers: anonHeaders(token),
    label: "name_votes",
  });
}

/** rpc name_matches for a space. */
export function matches(token, space) {
  return call("/rest/v1/rpc/name_matches", {
    method: "POST",
    headers: anonHeaders(token),
    body: { p_space: space },
    label: "rpc/name_matches",
  });
}

/** rpc names_space: the active space id (creates a names space if none). */
export function namesSpace(token, displayName = "QA") {
  return call("/rest/v1/rpc/names_space", {
    method: "POST",
    headers: anonHeaders(token),
    body: { p_display_name: displayName },
    label: "rpc/names_space",
  });
}

export function adminGetUser(id) {
  return call(`/auth/v1/admin/users/${id}`, { headers: adminHeaders(), label: "admin/users/:id" });
}

export function adminDeleteUser(id) {
  return call(`/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
    label: "admin/users/:id",
  });
}

export function adminUpdateUser(id, attrs) {
  return call(`/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: attrs,
    label: "admin/users/:id",
  });
}

/** Creates a confirmed throwaway email user (delivered+names-tmp-{random}@resend.dev). */
export async function createThrowawayUser() {
  const email = `delivered+names-tmp-${randomBytes(4).toString("hex")}@resend.dev`;
  const user = await call("/auth/v1/admin/users", {
    method: "POST",
    headers: adminHeaders(),
    body: { email, email_confirm: true, user_metadata: { qa: true } },
    label: "admin/users",
  });
  return { id: user.id, email };
}
