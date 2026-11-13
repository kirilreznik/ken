"""Shared helper for details batches 021+ (names added to the deck on 2026-11-13)."""
import json, pathlib, sys

def run(num, first, last, E):
    out = {"_about": f"Details content batch {num} (PRD name-detail §6): stories and similar names for the names added to the deck on 2026-11-13 (site-listed and formerly held), names {first}–{last} of 1,074 by births since 2000. Drafted with AI help under the §6.2/§6.3 rules; 'כנראה' marks a guess; spot-checked by the owner.", "names": E}
    root = pathlib.Path(__file__).resolve().parents[3]
    (root / f"data/names/content-src/details-{num:03d}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    bad = 0
    for k, v in E.items():
        s = v["story"]
        if s and not (140 <= len(s) <= 480): print("LEN", k, len(s)); bad += 1
        if s and any(c in s for c in "!?\"'0123456789"): print("CHAR", k); bad += 1
    print(num, len(E), "bad" if bad else "ok")

def maker():
    E = {}
    def n(name, story, similar=(), note=None):
        E[name] = {"story": story, **({"storyNote": note} if note else {}), "similar": list(similar)}
    return E, n

def pad(E, extra):
    """Append a closing sentence to stories that came out short."""
    for k, add in extra.items():
        E[k]["story"] = E[k]["story"] + " " + add
