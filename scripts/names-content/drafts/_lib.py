"""Helpers for drafting a content batch. Each batch-NNN.py writes data/names/content-src/batch-NNN.json."""
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))

def Q(quote, book, ch, v, note=None):
    b = {"quote": quote, "book": book, "ch": ch, "v": v}
    if note: b["note"] = note
    return b

def F(figure, book, ch, chTo=None, match=None, more=None):
    b = {"figure": figure, "book": book, "ch": ch}
    if chTo: b["chTo"] = chTo
    if match: b["match"] = match
    if more: b["more"] = [{"book": m[0], "ch": m[1]} for m in more]
    return b

def write(num, entries, about, themes=None):
    """themes: {name: "id id"} or a 5th tuple element; build-themes reads them via apply-themes.mjs."""
    themes = dict(themes or {})
    names = {}
    for e in entries:
        name, niqqud, intro = e[0], e[1], e[2]
        bible = e[3] if len(e) > 3 else None
        if len(e) > 4 and e[4]: themes[name] = e[4]
        if name in names: sys.exit(f"duplicate {name}")
        if isinstance(bible, dict) and "_hold" in bible:
            names[name] = {"hold": bible["_hold"]}
            continue
        entry = {"niqqud": niqqud, "intro": intro}
        if isinstance(bible, dict): entry["bible"] = bible
        names[name] = entry
    for name, ids in themes.items():
        if name not in names or "hold" in names[name]: sys.exit(f"themes for unknown or held name {name}")
        names[name]["themes"] = ids.split()
    path = os.path.join(ROOT, f"data/names/content-src/batch-{num:03d}.json")
    json.dump({"_about": about, "names": names}, open(path, "w"), ensure_ascii=False, indent=1)
    print(f"{path}: {len(names)}")

def hold(name, why):
    return (name, None, None, {"_hold": why})
