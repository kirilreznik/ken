# Name swiper polish: audit findings

One file per lens and group, `findings/<LENS>-<group>.md` (e.g. `A11Y-G2.md`), written by the audit stories (PRD §7). Audits never change code.

Groups (PRD §6): `G1` Entry · `G2` Deck · `G3` Lists and settings. Whole-app lenses use their own name (e.g. `NATIVE.md`, `DS.md`, `JRN.md`, `MOT-G13.md`).

A file with no findings says so and lists what was checked.

## Entry template

```md
# <LENS> · <group>: <screens>

Skill: `<skill>` (`.claude/skills/<skill>/SKILL.md`, references read: …). Assumptions where the skill would ask: …. Skipped steps (need a service): ….

### <LENS>-<group>-01: short title

- **Screen and state:** …
- **Browser:** webkit-iphone · chromium-pixel · sim-safari
- **What's wrong:** …
- **Rule it breaks:** `<skill>` · `<file>` · "<the rule's words, short>"
- **Severity:** P1 (broken, inaccessible or clearly off-brand) · P2 (noticeable) · P3 (refinement)
- **Effort:** XS (< 15 min) · S (< 45 min) · M (one iteration) · L (more)
- **Proposed change:** files, component, token
- **Guardrail:** polish · owner (§3.2 reason)
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/…`
```
