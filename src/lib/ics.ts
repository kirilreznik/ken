/** Minimal RFC 5545 writer for the subscribed calendar feed. Pure — no browser APIs. */

export interface FeedData {
  name: string;
  due_date: string;
  show_titles: boolean;
  appointments: Array<{ id: string; title: string; kind: string; starts_at: string; provider: string | null; location: string | null; updated_at: string | null }>;
  tasks: Array<{ id: string; title: string; due_date: string; created_at: string | null }>;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold to 75 octets per line without splitting a UTF-8 character. */
export function fold(line: string) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + n > limit) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const day = (s: string) => s.slice(0, 10).replace(/-/g, "");
const nextDay = (s: string) => { const d = new Date(`${s.slice(0, 10)}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ""); };

export function buildIcs(data: FeedData, opts: { host: string; now?: Date }) {
  const now = utc(opts.now ?? new Date());
  const L: string[] = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ken//Pregnancy OS//HE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(data.show_titles ? `קן · ${data.name}` : "קן")}`,
    "X-WR-TIMEZONE:Asia/Jerusalem", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H",
  ];
  const uid = (id: string) => `${id}@${opts.host}`;

  for (const a of data.appointments) {
    const start = new Date(a.starts_at);
    const end = new Date(start.getTime() + 60 * 60_000);
    L.push("BEGIN:VEVENT", `UID:${uid(a.id)}`, `DTSTAMP:${a.updated_at ? utc(new Date(a.updated_at)) : now}`,
      `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`, `SUMMARY:${esc(data.show_titles ? a.title : "תור")}`);
    if (data.show_titles) {
      if (a.location) L.push(`LOCATION:${esc(a.location)}`);
      if (a.provider) L.push(`DESCRIPTION:${esc(a.provider)}`);
    }
    L.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(data.show_titles ? a.title : "תור")}`, "TRIGGER:-PT2H", "END:VALARM", "END:VEVENT");
  }

  for (const t of data.tasks) {
    L.push("BEGIN:VEVENT", `UID:${uid(t.id)}`, `DTSTAMP:${t.created_at ? utc(new Date(t.created_at)) : now}`,
      `DTSTART;VALUE=DATE:${day(t.due_date)}`, `DTEND;VALUE=DATE:${nextDay(t.due_date)}`,
      `SUMMARY:${esc(data.show_titles ? `☐ ${t.title}` : "משימה")}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }

  if (data.show_titles && data.due_date) {
    L.push("BEGIN:VEVENT", `UID:due-${day(data.due_date)}@${opts.host}`, `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${day(data.due_date)}`, `DTEND;VALUE=DATE:${nextDay(data.due_date)}`,
      "SUMMARY:תאריך לידה משוער", "TRANSP:TRANSPARENT", "END:VEVENT");
  }

  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}
