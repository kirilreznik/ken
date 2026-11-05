# Name card content sources (E16b)

`data/names/name-content.json` is built from this folder. Never edit that file by hand.

| File | What it is | Who writes it |
|---|---|---|
| `samples.json` | The 10 hand-written E16 sample cards | Owner review |
| `batch-NNN.json` | Drafted cards (niqqud, intro, Bible reference), most popular names first | Rendered from `scripts/names-content/drafts/batch-NNN.py` |
| `people.json` | Known people per name, from Wikidata only | `scripts/names-content/fetch-people.mjs` |
| `people-exclude.json` | People the owner flagged (QIDs); never shown | Owner |
| `REPORT.md` | Build report: counts, held names, dropped Bible references | Build script |
| `spot-check-NNN.md` | Random cards from a batch for the owner to check | `scripts/names-content/spot-check.mjs` |

## Steps

```bash
python3 scripts/names-content/drafts/batch-001.py      # render a drafted batch to JSON
node scripts/names-content/fetch-people.mjs --only 1    # Wikidata people (needs query.wikidata.org)
node scripts/names-content/build-content.mjs            # check Bible refs, build name-content.json
node scripts/names-content/spot-check.mjs 1             # sample for the owner
```

## Checks in the build

- **Bible quote**: the quoted words must appear, in order, in the cited verse of the Tanakh text (Sefaria export, downloaded to `.cache/tanakh/`). The card shows the verse's own vowelled words, with the divine name as ה׳.
- **Bible figure**: the name must appear in the cited chapter(s).
- A reference that fails is dropped from the card and listed in `REPORT.md`; the card still ships.
- **Niqqud**: its letters must match the name, apart from the vowel letters ו and י.
- An entry with `hold` is left out of the deck until the owner decides (unclear origin or meaning).

## Writing rules (E16 spec §2)

One short, neutral line on the origin and literal meaning. No claims about luck, character or destiny, no religious judgement, the same tone for every origin. When the origin or meaning is not certain, the entry is held, not guessed.
