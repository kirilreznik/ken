import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import { parseNames, type RawNamesFile } from "@/lib/names/data";
import { CUSTOM_NAME_ERRORS, normalizeName, validateCustomName } from "@/lib/names/custom";

const names = parseNames(namesFile as RawNamesFile);
const none: string[] = [];

describe("validateCustomName", () => {
  it("accepts a rare name as custom", () => {
    expect(validateCustomName("  זיוולי ", names, none)).toEqual({ ok: true, name: "זיוולי", isDataName: false });
  });

  it("accepts gershayim, ASCII or Hebrew", () => {
    expect(validateCustomName('ש"י', names, none)).toMatchObject({ ok: true, name: 'ש"י' });
    expect(validateCustomName("ש״י", names, none)).toMatchObject({ ok: true, name: 'ש"י' });
  });

  it("accepts geresh, hyphen, maqaf and inner spaces", () => {
    expect(validateCustomName("ג׳ורג׳", names, none)).toEqual({ ok: true, name: "ג'ורג'", isDataName: true });
    expect(validateCustomName("שי-לי", names, none)).toEqual({ ok: true, name: "שי-לי", isDataName: true });
    expect(validateCustomName("שי־לי", names, none)).toEqual({ ok: true, name: "שי-לי", isDataName: true });
    expect(validateCustomName("בת   שבע", names, none)).toEqual({ ok: true, name: "בת שבע", isDataName: true });
  });

  it("strips niqqud before matching the data", () => {
    expect(validateCustomName("יָעֵל", names, none)).toEqual({ ok: true, name: "יעל", isDataName: true });
    expect(validateCustomName("שִׁירָה", names, none)).toEqual({ ok: true, name: "שירה", isDataName: true });
  });

  it("treats a data name as the data name", () => {
    expect(validateCustomName("תמר", names, none)).toEqual({ ok: true, name: "תמר", isDataName: true });
  });

  it("rejects empty input", () => {
    for (const input of ["", "   ", "ָ"]) {
      expect(validateCustomName(input, names, none)).toEqual({ ok: false, error: "empty", message: "צריך לכתוב שם" });
    }
  });

  it("rejects Latin, digits, emoji and stray punctuation", () => {
    for (const input of ["Noa", "נועה1", "נועהa", "נועה!", "-נועה", "נועה-", "'נועה", "נו--עה", "נו - עה", "🙂"]) {
      expect(validateCustomName(input, names, none)).toMatchObject({ ok: false, error: "not-hebrew" });
    }
  });

  it("allows 1–20 characters", () => {
    expect(validateCustomName("א", names, none)).toMatchObject({ ok: true, name: "א" });
    expect(validateCustomName("א".repeat(20), names, none)).toMatchObject({ ok: true });
    expect(validateCustomName("א".repeat(21), names, none)).toEqual({
      ok: false,
      error: "too-long",
      message: "עד 20 תווים",
    });
  });

  it("counts length after trimming and stripping niqqud", () => {
    expect(validateCustomName(`  ${"אָ".repeat(20)}  `, names, none)).toMatchObject({ ok: true });
  });

  it("rejects a name already on the list", () => {
    const myList = ["יעל", 'ש"י'];
    expect(validateCustomName("יעל", names, myList)).toEqual({ ok: false, error: "duplicate", message: "כבר ברשימה" });
    expect(validateCustomName("יָעֵל ", names, myList)).toMatchObject({ error: "duplicate" });
    expect(validateCustomName("ש״י", names, myList)).toMatchObject({ error: "duplicate" });
  });

  it("has a Hebrew message for every error", () => {
    for (const message of Object.values(CUSTOM_NAME_ERRORS)) expect(message).toMatch(/[א-ת]/);
  });
});

describe("normalizeName", () => {
  it("uses the names.json spelling", () => {
    expect(normalizeName(" ח׳אלד ")).toBe("ח'אלד");
    expect(normalizeName("ש”י")).toBe('ש"י');
  });
});
