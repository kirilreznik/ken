"""Prints the next names to draft: given in the latest CBS year, by births, not yet in any batch or sample."""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
src = os.path.join(ROOT, "data/names/content-src")
done = set(json.load(open(os.path.join(src, "samples.json")))["names"])
for f in sorted(os.listdir(src)):
    if f.startswith("batch-") and f.endswith(".json"):
        done |= set(json.load(open(os.path.join(src, f)))["names"])
names = json.load(open(os.path.join(ROOT, "data/names/names.json")))["names"]
rows = [x for x in names if x.get("y") and x["y"][-1] > 0 and x["n"] not in done]
rows.sort(key=lambda x: (-x["y"][-1], -(x["m"] + x["f"])))
count = int(sys.argv[1]) if len(sys.argv) > 1 else 250
print(f"{len(rows)} left; showing {min(count, len(rows))}")
for i, x in enumerate(rows[:count]):
    print(f"{x['n']}:{round(100 * x['m'] / (x['m'] + x['f']))}%:{x['s']}:{x['y'][-1]}", end="  ")
print()
