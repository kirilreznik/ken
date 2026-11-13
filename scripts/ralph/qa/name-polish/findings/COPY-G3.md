# COPY · G3: Lists and settings (saved, matches, row menu, chosen banner, add-name, duel, hidden, settings and its dialogs, about, privacy, terms)

Skills: `ux-writing` (`SKILL.md`; references `content-usability-checklist.md`; templates `error-message-template.md`, `empty-state-template.md`), `ux-copy` (`SKILL.md`). The assumptions are the same as in COPY-G1 and COPY-G2. The "context, user state, tone" inputs of `ux-copy` come from `PRODUCT.md`, `BRAND.md` and the earlier PRDs: warm, calm, plain, gender-neutral Hebrew with no exclamation marks. Skipped: `ux-copy`'s `CONNECTORS.md`, its knowledge-base and Figma connectors, and the English-only readability tools. Capitalization rules don't apply to Hebrew.

**Method:** every visible and screen-reader string goes through `ux-writing`'s four-phase edit (purposeful, concise, conversational, clear) and the content-usability checklist. Errors are checked against `[What failed]. [Why]. [What to do].`, empty states against the empty-state template, confirmation dialogs against `ux-copy`'s "Confirmation Dialogs", and buttons against `[Verb] [object]`. Terms are checked against "Same word means same thing throughout".

**Label voice (checked, kept):** G3 labels speak in the person's voice ("השמות שלי", "שמרתי", "שמות שהסתרתי", "שם שהוספתי", "בחרתי בשם…"), and sentences address the person ("השמות ששמרת", "שמות שהסתרת"). It's the same rule on every screen, so it isn't a consistency problem.

**How it was checked:**
- Strings were read from the code (inventory below) and seen on screen.
- Playwright on the dev server :3000 (`us007-g3.mjs` with `G3_OUT=…/audit/COPY-G3 G3_PORT=3000`): all 24 G3 states in WebKit iPhone 15 and Chromium Pixel 7, plus the `-full` shots. Every backend call was mocked. The settings dialogs were opened by URL and never confirmed.
- Simulator Mobile Safari on :3000, signed in as QA user 1 with the real backend, by URL only (`shots/copy-g3-sim.mjs url …`, no taps, no writes): saved empty, matches empty, duel too few, hidden empty, add-name, settings shared, the leave and delete dialogs, and about. The copy and its bidi look the same as in Playwright. QA user 1 has nothing saved or hidden, so Safari shows only the empty and shared states.
- Shots: `scripts/ralph/qa/name-polish/shots/audit/COPY-G3/<screen>-<state>-<webkit|chromium|sim>.png`.

**Out of scope (§3.1.5):** the body text of `/names/privacy` and `/names/terms` (intro, sections, items; `src/content/names-legal/`), and the about page's licence and attribution text, which is the same `AboutContent` that COPY-G2 reviewed. The legal pages' chrome is in scope: the titles, the draft banner and "עודכן ב־".

**Already filed by earlier lenses (not repeated here; this lens agrees):**
- IMP-C-G3-02: empty states in three patterns. This lens sets their wording in COPY-G3-02.
- IMP-C-G3-17: the add-name errors are fragments. This lens sets the wording in COPY-G3-03.
- IMP-C-G3-08 and IMP-C-G3-26: "שניכם" and "שלפחות שניים מכם" in the matches copy (owner for the rule). COPY-G3-06 depends on them.
- IMP-C-G3-11: the duel's round counter ("סיבוב 14 מתוך 14" after the end).
- IMP-C-G3-18: the matches offline line is a bare "עודכן לאחרונה ב־…".
- IMP-C-G3-25: "דו־קרב" as a tab (owner). "דו־קרב" is the earlier PRDs' name for the feature (boards 5–6), so it's kept here too.
- IMP-C-G3-07, A11Y-G3-05: the chosen banner's "ביטול" (behavior, `aria-haspopup`). COPY-G3-10 adds the wording.
- CRIT-G3-01: "לא להציג יותר" on a name the user added, and the "החזרה" that follows.
- A11Y-G3-06: the opt-in switch reads "פעיל / כבוי" twice.
- COPY-G2-13 (owner): the Nest consent wording "לחנויות" / "יוצאת", which the settings switch repeats ("עדכון כש־Nest יוצאת לחנויות").
- COPY-G1-12: "השמות ששמרת עוברים איתך." in the solo matches card.
- COPY-G1-14: "מהשרת" in the goodbye lead (`DELETED_LEAD`), which is G1's screen.
- IMP-C-G3-23: one-word last lines in G3's intros, e.g. "יודע." under the matches intro.

## String inventory and review

Verdicts: ✓ means the string passes the four standards. Otherwise the cell gives the finding or earlier ID.

| Screen | String (source) | Verdict |
|---|---|---|
| lists header | "השמות שלי" (h1), "חזרה", "הזמנה לבחירה משותפת" (aria), "הוספת שם" (aria "הוספת שם שלא ברשימה") (`ListsScreen.tsx:183–201`) | ✓ (visible words are in the name, 2.5.3) |
| lists tabs | "רשימות" (tablist), "שמרתי · {n}", "התאמות · {n}", "דו־קרב" | ✓ (tab: IMP-C-G3-25) |
| lists loading | "בטעינה" (sr) | ✓ |
| saved | intro "השמות ששמרת, אלה שאהבת מאוד ראשונים." | ✓ |
| saved | "שמות ששמרתי" (list aria), "אהבתי מאוד", "שם שהוספתי" | ✓ |
| saved / matches / hidden rows | meta "{בן/בת/מתאים לכולם} · ניתן ל־{n} ב־2024 · {↗/→/↘} {בעלייה/יציב/בירידה}", or "ניתן לכ־{n} מאז 1949" (`lists.ts:7–21`) | ✓ |
| saved empty | "עוד לא נשמרו שמות.", "לבחירת שמות" | COPY-G3-02 |
| duel link | "דו־קרב בין השמות ששמרתי" / "דו־קרב בין ההתאמות", "שני שמות בכל פעם, עד שנשארת חמישייה" | ✓ |
| row menu | "אפשרויות עבור {name}" (aria), "בחרתי בשם {name}" / "בחרנו בשם {name}" (`launch.ts:85`), "הסרה מהרשימה", "לא להציג יותר" (`RowMenu.tsx`) | COPY-G3-04 ("לא להציג יותר"); rest ✓ |
| row actions (sr) | "השם {n} הוסר מהרשימה", "השם {n} הוסתר ולא יוצג יותר" (`lists.ts:76`) | COPY-G3-04 (second) |
| sheet vote toast on lists | "דילוג: {n}" with action "ביטול", restore toast (`ListsScreen.tsx:148–168`, `a11y.ts`) | COPY-G2-03, IMP-C-G2-13 |
| chosen banner | "השם שבחרתי" / "השם שבחרנו", "{name}", "ביטול" (aria "ביטול הבחירה בשם {name}") | COPY-G3-10 |
| add-name | title "הוספת שם", lead "אפשר להוסיף שם שלא מופיע בבחירה. הוא יישמר ברשימה בלי נתונים.", label "השם", hint "אותיות בעברית, עד 20 תווים.", "הוספה לרשימה" (`AddNameSheet.tsx`) | COPY-G3-01 (lead); rest ✓ |
| add-name errors | "צריך לכתוב שם", "אפשר לכתוב רק אותיות בעברית", "עד 20 תווים", "כבר ברשימה" (`custom.ts:7–12`) | COPY-G3-03 |
| add-name status | "השם {n} נוסף לרשימה" (toast and sr, `lists.ts:81`) | ✓ |
| matches solo | "בוחרים ביחד?", "אפשר להזמין את מי שבוחר איתך. כל אחד בוחר בטלפון שלו, ושם ששניכם שמרתם יופיע כאן כהתאמה.", "על מה כל אחד דילג נשאר פרטי. השמות ששמרת עוברים איתך.", "הזמנה לבחירה משותפת" | IMP-C-G3-08, COPY-G1-12; COPY-G3-06 (skip line) |
| matches intro | "שמות ששניכם שמרתם. על שמות שדילגתם עליהם אף אחד לא יודע." / "שמות שלפחות שניים מכם שמרו. …" / solo "התאמות יופיעו כשמישהו נוסף יבחר איתך. הדילוגים נשארים פרטיים." (`matches.ts:253–257`) | IMP-C-G3-08, IMP-C-G3-26; COPY-G3-06 |
| matches empty | "עוד אין התאמות.", "שם ששניכם שמרתם יופיע כאן." (and the 3+ and solo variants), "הזמנה לבחירה משותפת", "לבחירת שמות" | IMP-C-G3-08; rest ✓ (title, reason, action) |
| matches rows | "התאמות" (list aria), "חדש", "סומן ״אהבתי מאוד״", "{n} שמרו" (3+) | ✓ (passive on purpose: never says who) |
| matches offline | "עודכן לאחרונה ב־23:35" / "…ב־3.11, 14:05" (`matches.ts:281–286`) | IMP-C-G3-18 |
| duel header | "דו־קרב", "חזרה", "דו־קרב בין" (radiogroup), "בין:", "שמרתי · {n}", "התאמות · {n}", "סיבוב {r} מתוך {t}" | IMP-C-G3-11 (counter); rest ✓ |
| duel too few | "לדו־קרב צריך לפחות שני שמות ברשימה." / "…שתי התאמות.", "לבחירת שמות" | COPY-G3-02 |
| duel round | "התקדמות הדו־קרב" (aria), "איזה מהשניים?", "או", meta "{sex} · {arrow} {word}" / "שם שהוספתי", "הרשימה השתנתה מאז, אז הדו־קרב מתחיל מחדש." | ✓ |
| duel mid-way | "החמישייה עד עכשיו", "{i}. {name}" chips, "עצירה, אפשר להמשיך אחר כך", toast "הדו־קרב נשמר. אפשר להמשיך מאותו מקום." | ✓ |
| duel done | "הדו־קרב הסתיים.", "החמישייה" / "הדירוג", "מקום {i}:" (sr), "בחרתי בשם {name}", "דו־קרב חדש", "חזרה לרשימה" | ✓ |
| duel (sr) | "סיבוב {r} מתוך {t}: {a} או {b}", "הדו־קרב הסתיים. 1. {a}, 2. {b}, …" (`duel.ts:224–231`) | ✓ |
| hidden | "שמות שהסתרתי" (h1), lead "שמות שהסתרת לא מופיעים בבחירה. אחרי החזרה השם יופיע בה שוב.", "שמות מוסתרים" (list aria), "החזרה" (aria "החזרה של {name}") | COPY-G3-01 (lead); rest ✓ |
| hidden status | "השם {n} יחזור לבחירה" (sr, `lists.ts:40`) | COPY-G3-01 |
| hidden empty | "אין שמות מוסתרים" | COPY-G3-02 |
| settings | "הגדרות", section "החשבון", "השם שלי", "שמירה" / "שומרים…", hint "כך יופיע השם שלך אצל מי שבוחרים איתך." | ✓ |
| settings | "כניסה באמצעות" + "Google" or the address | ✓ |
| settings | switch "עדכון כש־Nest יוצאת לחנויות", "פעיל" / "כבוי" · "לא חובה", sr "העדכונים הופעלו" / "העדכונים כובו" | COPY-G2-13 (owner), A11Y-G3-06; status ✓ |
| settings | section "בחירה ביחד", "הזמנת מישהו לבחור ביחד", "יציאה מהבחירה המשותפת" + "השמות ששמרת יישארו אצלך" | COPY-G3-09 (invite label, heading); leave row ✓ |
| settings | section "מידע", "על הנתונים", "התקנה למסך הבית", "תנאי שימוש", "מדיניות פרטיות", "(נפתח בכרטיסייה חדשה)" (sr) | ✓ |
| settings | "יציאה מהחשבון" / "יוצאים…", "מחיקת החשבון" | ✓ ("יציאה" for sign-out and for leaving: each label carries its object, and they're in different sections) |
| settings errors | "צריך שם, עד 30 תווים.", "אין חיבור לאינטרנט. אפשר לשמור שוב כשהחיבור יחזור.", "לא הצלחנו לשמור. אפשר לנסות שוב.", status and toast "השם נשמר" (`settings.ts`) | COPY-G3-03 (first two); rest ✓ |
| install sheet | "התקנה למסך הבית", "אפשר להוסיף את בחירת השם למסך הבית ולפתוח אותה כמו אפליקציה.", steps "לוחצים על כפתור השיתוף", "ואז על 'הוספה למסך הבית'", "הבנתי", "סגירה" (`install.ts`, `Install.tsx`) | COPY-G3-11 (quote marks); rest ✓ |
| leave dialog | "לצאת מהבחירה המשותפת?", body "השמות ששמרת יישארו אצלך, ברשימה נפרדת. ההתאמות עם {names} יימחקו, והבחירה המשותפת תימשך בלעדיך. כדי לחזור צריך קישור הזמנה חדש.", "יציאה מהבחירה המשותפת" / "יוצאים…", "ביטול" (`leave.ts`) | ✓ (the action, its consequences, a labelled confirm) |
| leave results | "יצאת מהבחירה המשותפת. השמות ששמרת איתך.", "אין חיבור לאינטרנט. אפשר לנסות שוב כשהחיבור יחזור.", "היציאה לא הצליחה. אפשר לנסות שוב." | COPY-G3-05 (done); rest ✓ |
| delete dialog | "למחוק את החשבון?", body "מחיקת החשבון תמחק את כל הבחירות שלך. בחירה משותפת ממשיכה בלעדיך, עם הבחירות של שאר המשתתפים.", "מחיקה לצמיתות" / "מוחקים…", "ביטול" (`accountDeletion.ts`) | COPY-G3-07 |
| delete errors | "לא הצלחנו למחוק את החשבון. אפשר לנסות שוב.", "אין חיבור לאינטרנט. אפשר למחוק כשהחיבור יחזור.", "צריך להתחבר מחדש כדי למחוק את החשבון.", "המחיקה כבר נשלחה. אפשר לנסות שוב בעוד דקה." | COPY-G3-08 (last); rest ✓ |
| about | "על הנתונים" (h1), `AboutContent` (reviewed in COPY-G2) | COPY-G2-12 |
| privacy / terms | "מדיניות פרטיות", "תנאי שימוש" (h1), banner "טיוטה, ממתינה לבדיקה משפטית" (`legal.ts:9`), "עודכן ב־{date}" | ✓ (banner: the owner's legal status line) |

Checked in G3: there are no due dates, no medical advice, no raw English errors and no exclamation marks. G3 has no slash forms. The Hebrew is gender-neutral by wording, except for the "שניכם" / "מי שבוחר" / "כל אחד" lines in IMP-C-G3-08. "מישהו" in "הזמנת מישהו לבחור ביחד" is the same generic, and it's covered by IMP-C-G2-17's wording.

---

### COPY-G3-01: "בחירה" names six different things, and G3's leads use it for the deck (extends COPY-G2-01)

- **Screen and state:** add-name sheet (`add-name-default`), `/names/hidden` (`hidden-default`, `hidden-empty`), hidden "החזרה" (sr status), delete dialog (`settings-delete-dialog`)
- **Browser:** all three
- **What's wrong:**
  - In G3 alone, "בחירה" is the app ("בחירת השם" in the install hint), the deck ("לבחירת שמות", "לא מופיע בבחירה", "יחזור לבחירה"), the shared space ("הבחירה המשותפת"), a single vote ("כל הבחירות שלך", "הבחירות של שאר המשתתפים"), and the chosen name ("ביטול הבחירה בשם…"). The section heading "בחירה ביחד" is a sixth form.
  - So "אפשר להוסיף שם שלא מופיע בבחירה" can be read as "a name that isn't in the shared choice". And "שמות שהסתרת לא מופיעים בבחירה. אחרי החזרה השם יופיע בה שוב." needs two reads: "בה" points back to "בחירה", and "אחרי החזרה" is a noun with no subject (whose return?).
  - The add-name lead ends with "בלי נתונים". That's the system's word. What the person loses is the numbers and the meaning that other names have.
- **Rule it breaks:**
  - `content-usability-checklist.md` · Clear · "Same word means same thing throughout"
  - `ux-copy` · `SKILL.md` · "Consistent: Same terms for the same things everywhere"
  - `ux-writing` · `SKILL.md` Common Mistakes · "System-oriented language vs. user language"
- **Severity:** P3
- **Effort:** S (strings only)
- **Proposed change:** keep "בחירת שם" (the app) and "הבחירה המשותפת" (the shared space; the earlier PRDs' term). Elsewhere in G3, use a word for each other thing:
  - The deck, in sentences: "הכרטיסים".
    - add-name lead (`AddNameSheet.tsx:66`): "אפשר להוסיף שם שאין לו כרטיס. הוא יישמר ברשימה, בלי מספרים ופירוש."
    - hidden lead (`HiddenScreen.tsx:72`): "שמות שהסתרת לא מופיעים בכרטיסים. ״החזרה״ מחזירה שם לכרטיסים."
    - `restoredText` (`lists.ts:40`): "השם {name} יחזור לכרטיסים".
    - The "לבחירת שמות" links stay: they name the screen, whose h1 is "בחירת שם".
  - A vote: "השמות ששמרת, דילגת עליהם והסתרת" (in COPY-G3-07).
  - The chosen name: COPY-G3-10.
  - The section heading "בחירה ביחד": COPY-G3-09.

  Update the tests that pin `restoredText` (`tests/names/lists.test.ts`, if pinned). Check the hidden lead at `webkit320`: it's about 60 characters, two lines today, and stays two lines.
- **Guardrail:** polish (wording only; the shared-space term isn't changed)
- **Screenshot:** `shots/audit/COPY-G3/add-name-default-webkit.png`, `hidden-default-webkit.png`, `settings-delete-dialog-webkit.png`, `add-name-default-sim.png`

### COPY-G3-02: The saved, hidden and duel empty states don't say how the list fills (wording for IMP-C-G3-02)

- **Screen and state:** `lists-saved-empty`, `hidden-empty`, `duel-few`; `lists-matches-empty` for comparison
- **Browser:** all three (`*-sim.png` for each of the four)
- **What's wrong:**
  - Saved: "עוד לא נשמרו שמות." is passive and doesn't say how a name gets here. The link "לבחירת שמות" is the right action.
  - Hidden: "אין שמות מוסתרים" is the "nothing here" form the empty-state template warns against. It has no period, unlike every other G3 empty state, and doesn't say how a name gets hidden. That's the one thing a person landing here from the filters sheet needs.
  - Duel too few: "לדו־קרב צריך לפחות שני שמות ברשימה." gives the rule but not the count the person has. With one saved name, "לבחירת שמות" is the only way out, and "הוספת שם" isn't mentioned.
  - Matches empty ("עוד אין התאמות." + reason + action) already follows the template. It's the model for the other three.
- **Rule it breaks:**
  - `empty-state-template.md` · Empty State Checklist · "Clear context: User knows what's empty and why", "Actionable", "Avoids negativity: No 'nothing here'"
  - `ux-copy` · `SKILL.md` Empty States · "What this is + Why it's empty + How to start"
- **Severity:** P3
- **Effort:** XS (strings; the layout is IMP-C-G3-02)
- **Proposed change:** use the matches pattern (title, one line, action) with this wording:
  - saved: title "עוד אין שמות שמורים." · line "שמות ששומרים או אוהבים בכרטיסים יופיעו כאן." · link "לבחירת שמות" (unchanged)
  - hidden: title "אין כרגע שמות מוסתרים." · line "שם שבוחרים בו ״דילוג ולא להציג שוב״ יופיע כאן." (the action bar's label; the line in IMP-C-G2-07 should say the same)
  - duel, saved, 1 name: "לדו־קרב צריך לפחות שני שמות ברשימה, ויש בה אחד." · links "לבחירת שמות" and "הוספת שם" (opens `?sheet=add-name`). With 0 names, the first sentence alone.
  - duel, matches: unchanged apart from the count, "…לפחות שתי התאמות, ויש אחת." for one.
- **Guardrail:** polish (wording of existing states; the second duel link reuses the existing add-name sheet)
- **Screenshot:** `shots/audit/COPY-G3/lists-saved-empty-webkit.png`, `hidden-empty-webkit.png`, `duel-few-webkit.png`, `lists-matches-empty-webkit.png`, `hidden-empty-sim.png`

### COPY-G3-03: G3's field errors are fragments, one reads as a permission, and one says "שוב" before a first try (wording for IMP-C-G3-17)

- **Screen and state:** add-name error (`add-name-error`); settings name field (error states, code only: the probe never submits)
- **Browser:** all three for add-name; settings errors from code
- **What's wrong:**
  - `custom.ts:7–12`: "כבר ברשימה" and "עד 20 תווים" have no subject, so they don't say which field or which list. "צריך לכתוב שם" has no period, while the hint under the same field is a full sentence with one.
  - "אפשר לכתוב רק אותיות בעברית" reads as a permission, the same problem as COPY-G2-05.
  - The settings name error "צריך שם, עד 30 תווים." joins two rules with a comma. The person sees it after leaving the field empty or after typing too much, and only one of the two applies.
  - `SETTINGS_OFFLINE_TEXT` "אפשר לשמור שוב כשהחיבור יחזור." says "שוב", but nothing was saved. `DELETE_OFFLINE_TEXT` in the same file group says "אפשר למחוק כשהחיבור יחזור.", without "שוב".
- **Rule it breaks:**
  - `ux-writing` · `SKILL.md` Validation Errors · "Pattern: [Field] [specific requirement]"
  - `error-message-template.md` · Inline Error · "Brief, immediate correction guidance"
  - `ux-writing` · `SKILL.md` Phase 4 · "Ensure unambiguous meaning"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - `custom.ts`:
    - empty: "צריך לכתוב שם."
    - not-hebrew: "השם צריך להיות באותיות בעברית."
    - too-long: "השם ארוך מדי. אפשר עד 20 תווים."
    - duplicate: "השם הזה כבר ברשימה ״שמרתי״."
  - `SettingsScreen.tsx:127`: split by the case: empty "צריך לכתוב שם." and too long "השם ארוך מדי. אפשר עד 30 תווים." (`isValidDisplayName` already knows which).
  - `settings.ts:13`: "אין חיבור לאינטרנט. אפשר לשמור כשהחיבור יחזור."

  Update `tests/names/custom.test.ts:63` and any test that pins the settings strings. At `webkit320` the longest error, "השם הזה כבר ברשימה ״שמרתי״.", is about 27 characters plus the icon, one line.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G3/add-name-error-webkit.png`, `add-name-error-chromium.png`

### COPY-G3-04: "Don't show again" has three wordings

- **Screen and state:** row menu (`lists-row-menu`); the sr status after hiding from a row; the deck's skip menu (G2) for comparison
- **Browser:** all three
- **What's wrong:** one act has three names:
  - The row menu says "לא להציג יותר" (`RowMenu.tsx:125`).
  - Its status says "השם {n} הוסתר ולא יוצג יותר" (`lists.ts:76`).
  - The deck's skip menu says "דילוג ולא להציג שוב", and its status says "השם {n} לא יוצג שוב" (`a11y.ts`).
  - The screen where these names end up is "שמות שהסתרתי".
- **Rule it breaks:** `content-usability-checklist.md` · Clear · "Same word means same thing throughout"; `ux-copy` · `SKILL.md` · "Consistent"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** use the deck's words:
  - `RowMenu.tsx:125`: "לא להציג שוב".
  - `rowActionText` hide: "השם {name} לא יוצג שוב". This is the deck's sentence. "שמות שהסתרתי" in the filters sheet tells people where to find it.

  Do it together with CRIT-G3-01, which removes the item from rows of names the person added. Update `tests/names/lists.test.ts` where `rowActionText` is pinned.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G3/lists-row-menu-webkit.png`, `lists-row-menu-chromium.png`

### COPY-G3-05: "יצאת מהבחירה המשותפת. השמות ששמרת איתך." has no verb

- **Screen and state:** `/names/settings` after leaving a shared choice (toast and sr status, `LEAVE_DONE`)
- **Browser:** code (`leave.ts:14`; leaving always fails today, IMP-C-G3-09, so the toast can't be reached on screen)
- **What's wrong:** "השמות ששמרת איתך" has no verb, so it reads as "the names you saved with you", as if the names were saved together with someone. The settings row above it says the full thing: "השמות ששמרת יישארו אצלך".
- **Rule it breaks:** `ux-writing` · `SKILL.md` Success Messages · "Past tense, specific"; Phase 4 · "Ensure unambiguous meaning"; `content-usability-checklist.md` · "Connecting words included … Not telegraphic or robotic"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `LEAVE_DONE` = "יצאת מהבחירה המשותפת. השמות ששמרת נשארו אצלך." Update the test that pins `LEAVE_DONE`, if any.
- **Guardrail:** polish
- **Screenshot:** none (code only; the leave row and dialog are in `settings-shared-webkit.png`, `settings-leave-dialog-webkit.png`)

### COPY-G3-06: The promise that skips stay private has four wordings, and one says "אף אחד לא יודע"

- **Screen and state:** matches intro (`lists-matches-empty`, `lists-matches-default`), solo invite card (`lists-matches-solo`), solo intro (code), G2's pause invite for comparison
- **Browser:** all three
- **What's wrong:**
  - The same promise is said four ways:
    - matches intro: "על שמות שדילגתם עליהם אף אחד לא יודע."
    - solo card: "על מה כל אחד דילג נשאר פרטי."
    - solo intro: "הדילוגים נשארים פרטיים."
    - G2 pause: "על מה דילגת נשאר רק אצלך."
  - "אף אחד לא יודע" is also not true: the person knows, and so does the app. What it means is that the others don't see it.
  - The G2 wording is the clearest. It's singular, gender-neutral and says where the information stays.
- **Rule it breaks:** `ux-copy` · `SKILL.md` · "Consistent: Same terms for the same things everywhere"; `ux-writing` · `SKILL.md` Clarity · "Unambiguous, accurate"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** use one sentence, "על מה דילגת נשאר רק אצלך.", in:
  - `matches.ts:255` (solo intro)
  - `matches.ts:257` (the second sentence of the shared intro)
  - `ListsScreen.tsx:599` (the solo card's first sentence; its second sentence is COPY-G1-12)

  Do it in the same change as IMP-C-G3-08, which rewrites the first sentence of the same intro. Update `tests/names/matches*` where `matchesIntro` is pinned.
- **Guardrail:** polish (the privacy rule doesn't change, only the wording)
- **Screenshot:** `shots/audit/COPY-G3/lists-matches-default-webkit.png`, `lists-matches-solo-webkit.png`, `lists-matches-empty-sim.png`

### COPY-G3-07: The delete dialog says "הבחירות", and "can't be undone" is only in the button

- **Screen and state:** `/names/settings?dialog=delete-account` (`settings-delete-dialog`)
- **Browser:** all three
- **What's wrong:**
  - The body says "מחיקת החשבון תמחק את כל הבחירות שלך." "הבחירות" is the vote sense of the word from COPY-G3-01. The person thinks of these as their saved names, so it's unclear what's lost.
  - That it can't be undone shows only in the button ("לצמיתות"). The body doesn't say it.
  - The button "מחיקה לצמיתות" has no object. The row that opened the dialog says "מחיקת החשבון".
  - The second sentence says what others keep ("עם הבחירות של שאר המשתתפים") but not the person's own name in that shared choice.
- **Rule it breaks:**
  - `ux-copy` · `SKILL.md` Confirmation Dialogs · "Describe consequences: 'This can't be undone'", "Label buttons with the action: 'Delete files'"
  - `ux-writing` · `SKILL.md` Tone · Cautious · "Clear consequences"
- **Severity:** P3 (the title and the button already say it's permanent)
- **Effort:** XS
- **Proposed change:**
  - `DELETE_BODY` = "כל השמות ששמרת, דילגת עליהם והסתרת יימחקו, ואי אפשר יהיה לשחזר אותם. אם בחרת עם מישהו, הבחירה המשותפת תימשך בלעדיך." (about 115 characters; the leave dialog's body is about 125, so the dialog keeps its height).
  - Button: "מחיקת החשבון לצמיתות" / "מוחקים…".
  - The title "למחוק את החשבון?" and "ביטול" stay.

  Update the tests that pin `DELETE_BODY`. Check the button at `webkit320` (about 19 characters, one line). Leave `DELETED_LEAD` to COPY-G1-14 (G1), but use the same words there ("השמות ששמרת…").
- **Guardrail:** polish (wording only; the delete flow and its server call don't change)
- **Screenshot:** `shots/audit/COPY-G3/settings-delete-dialog-webkit.png`, `settings-delete-dialog-sim.png`

### COPY-G3-08: The rate-limited delete says "המחיקה כבר נשלחה" and then "try again"

- **Screen and state:** delete dialog after a 429 from `DELETE /api/names/account` (`DELETE_WAIT_TEXT`, `accountDeletion.ts:13,34`)
- **Browser:** code only (a 429 can't be produced without hitting the real route; nothing was sent)
- **What's wrong:** "המחיקה כבר נשלחה. אפשר לנסות שוב בעוד דקה." gives two signals that don't fit together. The first sentence says the deletion is on its way, so the account may already be gone. The second asks the person to do it again. The 429 means this request was refused, so the account is still there.
- **Rule it breaks:** `ux-writing` · `SKILL.md` System Errors · "[Action failed]. [Likely cause]. [Recovery step]."; Clarity · "Unambiguous, accurate"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `DELETE_WAIT_TEXT` = "החשבון עוד לא נמחק, כי היו כמה ניסיונות ברצף. אפשר לנסות שוב בעוד דקה." Update the test that pins it.
- **Guardrail:** polish
- **Screenshot:** none (code only)

### COPY-G3-09: The invite has two labels, and the settings section has a third name for the shared choice

- **Screen and state:** settings "בחירה ביחד" section (`settings-solo`, `settings-shared`); lists header and the matches cards
- **Browser:** all three
- **What's wrong:** the same link to `/names/invite` has two labels:
  - "הזמנה לבחירה משותפת" on the lists header (aria), the solo matches card and the matches empty state (and G2's pause invite).
  - "הזמנת מישהו לבחור ביחד" in settings (and "להזמין מישהו לבחור ביחד" at G2's deck end).

  The section heading above it, "בחירה ביחד", is a third name for what the leave row and the dialogs call "הבחירה המשותפת".
- **Rule it breaks:** `ux-copy` · `SKILL.md` · "Consistent"; `content-usability-checklist.md` · "Same word means same thing throughout"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - Settings link (`SettingsScreen.tsx:346`): "הזמנה לבחירה משותפת".
  - Section heading (`:344`): "בחירה משותפת".
  - G2's deck end (`EmptyDeck.tsx:88`): "הזמנה לבחירה משותפת" too, so the polish story covers both groups.

  Update the tests that pin the settings or deck-end labels.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G3/settings-shared-webkit.png`, `lists-matches-solo-webkit.png`, `settings-shared-sim.png`

### COPY-G3-10: The chosen banner's visible "ביטול" doesn't say what it cancels (with COPY-G2-11)

- **Screen and state:** lists, chosen banner (`lists-chosen-banner`)
- **Browser:** webkit-iphone · chromium-pixel (the Simulator account has no chosen name)
- **What's wrong:**
  - The banner reads "השם שבחרתי · מוחמד … ביטול". In G3, "ביטול" already means "close this dialog" (both settings dialogs) and "undo" (the toast action after a skip from the sheet). Here it means "clear the chosen name".
  - The aria-label says the full thing ("ביטול הבחירה בשם מוחמד"), but the visible word doesn't.
  - The decision sheet calls the same act "לשנות את הבחירה", which COPY-G2-11 rewrites to "ביטול הבחירה ב־{name}".
- **Rule it breaks:** `ux-writing` · `SKILL.md` Buttons · "Pattern: [Verb] [object]", "Avoid: Generic labels"; `content-usability-checklist.md` · "Same word means same thing throughout"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** the visible label becomes "ביטול הבחירה". The name is already in the banner, and the aria-label stays "ביטול הבחירה בשם {name}". It fits beside the name at 320 px: the banner has a whole row, and the label is about 12 characters. Do it in one change with COPY-G2-11 and IMP-C-G3-07 (same act, same undo toast), so the banner, the decision sheet and the toast all use "ביטול הבחירה".
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G3/lists-chosen-banner-webkit.png`, `lists-chosen-banner-chromium.png`

### COPY-G3-11: The install steps quote the iOS menu item with ASCII apostrophes

- **Screen and state:** install sheet, from settings "התקנה למסך הבית" (iOS steps)
- **Browser:** code (`install.ts:6`); the steps show on iOS Safari only
- **What's wrong:** "ואז על 'הוספה למסך הבית'" uses ASCII single quotes. Every other quoted label in the app uses gershayim: "סומן ״אהבתי מאוד״", and COPY-G3-02's "״דילוג ולא להציג שוב״". In RTL text an ASCII apostrophe also looks like a geresh, so "'הוספה" can read as a letter mark.
- **Rule it breaks:** `ux-copy` · `SKILL.md` · "Consistent"; `content-usability-checklist.md` · "UI patterns applied consistently"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `INSTALL_STEPS[1]` = "ואז על ״הוספה למסך הבית״". Update `tests/names/install*` if it pins the step.
- **Guardrail:** polish
- **Screenshot:** none (code only; the install sheet isn't one of G3's baseline states)
