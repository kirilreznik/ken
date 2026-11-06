import { describe, expect, it } from "vitest";
import { LEGAL_DRAFT as PRIVACY_DRAFT, privacy } from "@/content/names-legal/privacy";
import { LEGAL_DRAFT as TERMS_DRAFT, terms } from "@/content/names-legal/terms";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/content/names-legal/versions";
import { legalContacts, legalParts, legalTexts } from "@/lib/names/legal";

describe("legalContacts", () => {
  it("reads trimmed values", () => {
    expect(legalContacts({ PREGNANCY_OPERATOR_NAME: " Operator ", PREGNANCY_CONTACT_EMAIL: " hi@example.com " })).toEqual({
      operator: "Operator",
      contact: "hi@example.com",
    });
  });

  it("treats missing, blank and malformed values as unset", () => {
    expect(legalContacts({})).toEqual({ operator: null, contact: null });
    expect(legalContacts({ PREGNANCY_OPERATOR_NAME: "  ", PREGNANCY_CONTACT_EMAIL: "" })).toEqual({ operator: null, contact: null });
    expect(legalContacts({ PREGNANCY_CONTACT_EMAIL: "not-an-email" }).contact).toBeNull();
  });
});

describe("legalParts", () => {
  it("splits on the operator and contact tokens", () => {
    expect(legalParts("מופעל על ידי {operator}. כתובת: {contact}.")).toEqual([
      { kind: "text", text: "מופעל על ידי " },
      { kind: "operator" },
      { kind: "text", text: ". כתובת: " },
      { kind: "contact" },
      { kind: "text", text: "." },
    ]);
  });

  it("keeps other text, braces included", () => {
    expect(legalParts("{x} בלי סימון")).toEqual([{ kind: "text", text: "{x} בלי סימון" }]);
    expect(legalParts("{contact}")).toEqual([{ kind: "contact" }]);
  });
});

describe("legal drafts", () => {
  it("are drafts with the versions users accept at onboarding", () => {
    expect(PRIVACY_DRAFT).toBe(true);
    expect(TERMS_DRAFT).toBe(true);
    expect(privacy.version).toBe(PRIVACY_VERSION);
    expect(terms.version).toBe(TERMS_VERSION);
  });

  it("privacy names every processor, the device-only data, retention and the contact", () => {
    const text = legalTexts(privacy).join("\n");
    for (const word of ["Supabase", "פרנקפורט", "Vercel", "Resend", "Google", "Cloudflare Turnstile", "Microsoft Clarity"]) expect(text).toContain(word);
    for (const word of ["שם המשפחה", "תמונת רקע", "המסננים", "עד שהחשבון נמחק", "18", "לא נמכר", "ייעוץ רפואי"]) {
      expect(text).toContain(word);
    }
    expect(text).toContain("{contact}");
    expect(text).toContain("{operator}");
  });

  it("terms cover medical advice, CBS, AI texts, deletion and the operator", () => {
    const text = legalTexts(terms).join("\n");
    for (const word of ["ייעוץ רפואי", "הלשכה המרכזית לסטטיסטיקה", "בינה מלאכותית", "למחוק", "{operator}", "{contact}"]) {
      expect(text).toContain(word);
    }
  });

  it("follow the copy rules: no exclamation marks, no slash forms, no due date", () => {
    for (const doc of [privacy, terms]) {
      for (const text of legalTexts(doc)) {
        expect(text).not.toMatch(/!/);
        expect(text).not.toMatch(/\/[הת]\b|\/[הת](?=[\s.,;:)]|$)/);
        expect(text).not.toMatch(/תאריך לידה משוער|שבוע הריון/);
      }
    }
  });
});
