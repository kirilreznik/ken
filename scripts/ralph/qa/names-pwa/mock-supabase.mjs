// node scripts/ralph/qa/names-pwa/mock-supabase.mjs [port]
// A tiny in-memory stand-in for the Supabase endpoints the names PWA calls, so design
// reviews can run the signed-in screens locally with no real project, keys or emails.
// Start the app with NEXT_PUBLIC_SUPABASE_URL=http://localhost:<port> and any anon key,
// then seed localStorage "nest-names-auth" with mockSession() (see mockSession below).
// State: one user, optionally a partner (MOCK_PARTNER=1) whose votes make matches.
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const PORT = Number(process.argv[2] ?? 54329);
export const USER_ID = "00000000-0000-4000-8000-000000000001";
const PARTNER_ID = "00000000-0000-4000-8000-000000000002";
const SPACE_ID = "00000000-0000-4000-8000-0000000000aa";
let partner = process.env.MOCK_PARTNER === "1";

function b64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/** An unsigned JWT supabase-js accepts for reading the session (it never verifies it). */
function token() {
  const now = Math.floor(Date.now() / 1000);
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: USER_ID, role: "authenticated", exp: now + 86_400, iat: now })}.mock`;
}

const user = {
  id: USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "dana@example.com",
  app_metadata: { provider: "email" },
  user_metadata: {
    display_name: "דנה",
    terms_accepted_at: "2026-11-04T10:00:00.000Z",
    terms_version: "2026-11-04-draft",
  },
  created_at: "2026-11-04T10:00:00.000Z",
};

export function mockSession() {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: token(),
    token_type: "bearer",
    expires_in: 86_400,
    expires_at: now + 86_400,
    refresh_token: "mock-refresh",
    user,
  };
}

const votes = new Map(); // name -> row (the signed-in user)
const partnerVotes = partner
  ? new Map(["נועם", "אורי", "שירה", "יעל"].map((name) => [name, { name, vote: "love" }]))
  : new Map();
const members = () => [
  { user_id: USER_ID, display_name: user.user_metadata.display_name, joined_at: "2026-11-04T10:00:00Z" },
  ...(partner ? [{ user_id: PARTNER_ID, display_name: "עומר", joined_at: "2026-11-04T11:00:00Z" }] : []),
];

function matches() {
  const out = [];
  for (const [name, row] of votes) {
    const other = partnerVotes.get(name);
    if (!other || row.vote === "skip" || row.vote === "pass") continue;
    out.push({
      name,
      kept_by_count: [row, other].filter((r) => r.vote === "keep").length,
      loved_by_count: [row, other].filter((r) => r.vote === "love").length,
      matched_at: row.updated_at,
    });
  }
  return out;
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Expose-Headers": "*",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let text = "";
    req.on("data", (chunk) => (text += chunk));
    req.on("end", () => {
      try {
        resolve(text ? JSON.parse(text) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function eqParam(url, key) {
  return url.searchParams.get(key)?.replace(/^eq\./, "");
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const body = await readBody(req);

  if (path === "/auth/v1/user" && req.method === "GET") return send(res, 200, user);
  if (path === "/auth/v1/user" && req.method === "PUT") {
    Object.assign(user.user_metadata, body.data ?? {});
    return send(res, 200, user);
  }
  if (path === "/auth/v1/token") return send(res, 200, mockSession());
  if (path === "/auth/v1/logout") return send(res, 204);
  if (path.startsWith("/auth/v1/")) return send(res, 200, {});

  if (path === "/rest/v1/rpc/names_space") return send(res, 200, SPACE_ID);
  if (path === "/rest/v1/rpc/names_invite") {
    return send(res, 200, [{ code: "K7M2Q9", expires_at: new Date(Date.now() + 7 * 864e5).toISOString() }]);
  }
  if (path === "/rest/v1/rpc/name_matches") return send(res, 200, matches());
  if (path === "/rest/v1/rpc/names_leave") {
    if (!partner) return send(res, 400, { message: "not_shared" });
    partner = false;
    return send(res, 200, SPACE_ID);
  }
  if (path === "/rest/v1/rpc/names_survey") return send(res, 200, true);
  if (path.startsWith("/rest/v1/rpc/")) return send(res, 200, null);

  if (path === "/rest/v1/space_members") {
    if (req.method === "PATCH") {
      if (body.display_name) user.user_metadata.display_name = body.display_name;
      return send(res, 204);
    }
    return send(res, 200, members());
  }
  if (path === "/rest/v1/name_votes") {
    if (req.method === "GET") return send(res, 200, [...votes.values()]);
    if (req.method === "POST") {
      for (const row of Array.isArray(body) ? body : [body]) votes.set(row.name, row);
      return send(res, 201, []);
    }
    if (req.method === "DELETE") {
      votes.delete(eqParam(url, "name"));
      return send(res, 204);
    }
  }
  return send(res, 404, { message: `mock: no route for ${req.method} ${path}` });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`mock supabase on http://localhost:${PORT}${partner ? " (with partner)" : ""}`));
}
