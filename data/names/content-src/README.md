# Name card content sources (E16b)

`data/names/name-content.json` is built from this folder. Never edit that file by hand.

| File | What it is | Who writes it |
|---|---|---|
| `samples.json` | The 10 hand-written E16 sample cards | Owner review |
| `batch-NNN.json` | Drafted cards (niqqud, intro, Bible reference), most popular names first | Rendered from `scripts/names-content/drafts/batch-NNN.py` |
| `people.json` | Known people per name, from Wikidata only | `scripts/names-content/fetch-people.mjs` |
| `people-exclude.json` | People the owner flagged (QIDs); never shown | Owner |
| `themes.json` | Theme lists for the "נושאים" filter (one list per theme; `unisex` is computed from CBS) | AI draft, owner review |
| `THEMES.md` | Every theme's names and the names with none, for review | `scripts/names-content/build-themes.mjs` |
| `sectors.json` | Births per name in the Jewish sector vs all sectors (CBS) | `scripts/names-content/build-sectors.mjs` |
| `sector-overrides.json` | Owner exceptions to the Jewish-sector rule (`keep` / `drop`, with a reason) | Owner |
| `sector-excluded.json`, `SECTOR-REPORT.md` | Names the Jewish-sector rule leaves out, with counts and borderline names | `build-content.mjs` |
| `REPORT.md` | Build report: counts, held names, dropped Bible references | Build script |
| `spot-check-NNN.md` | Random cards from a batch for the owner to check | `scripts/names-content/spot-check.mjs` |

## Steps

```bash
python3 scripts/names-content/drafts/batch-001.py      # render a drafted batch to JSON
node scripts/names-content/fetch-people.mjs --only 1    # Wikidata people (needs query.wikidata.org)
node scripts/names-content/build-content.mjs            # check Bible refs, build name-content.json
node scripts/names-content/spot-check.mjs 1             # sample for the owner
node scripts/names-content/build-themes.mjs             # check theme lists, build ../name-themes.json + THEMES.md
```

## Checks in the build

- **Bible quote**: the quoted words must appear, in order, in the cited verse of the Tanakh text (Sefaria export, downloaded to `.cache/tanakh/`). The card shows the verse's own vowelled words, with the divine name as ה׳.
- **Bible figure**: the name must appear in the cited chapter(s).
- A reference that fails is dropped from the card and listed in `REPORT.md`; the card still ships.
- **Niqqud**: its letters must match the name, apart from the vowel letters ו and י.
- An entry with `hold` is left out of the deck until the owner decides (unclear origin or meaning).
- **Jewish-sector rule** (owner decision 2026-11-13, `scripts/names-content/sector.mjs`): the deck keeps a name only when most babies ever given it were in the CBS Jewish sector, or when since 2000 at least 100 Jewish babies got it and they are at least 10% of its births (shared names such as לין, איה, אדם). Exceptions go in `sector-overrides.json`. `build-themes` and `build-details` skip the names it leaves out.

## Writing rules (E16 spec §2)

One short, neutral line on the origin and literal meaning. No claims about luck, character or destiny, no religious judgement, the same tone for every origin. When the origin or meaning is not certain, the entry is held, not guessed.

# Name sheet details: stories and similar names

`data/names/name-details.json` holds, for every deck name, the story and the similar names shown in the name sheet ("פרטי השם"). It is built from this folder by `scripts/names-content/build-details.mjs`; never edit it by hand. Full rules: [`tasks/prd-name-detail.md`](../../../tasks/prd-name-detail.md) §6.

| File | What it is | Who writes it |
|---|---|---|
| `details-NNN.json` | One batch: `{ "_about", "names": { "<name>": { "story": "<text>" \| null, "storyNote"?: "<why null>", "similar": [...] } } }` | Rendered from `scripts/names-content/drafts/details-NNN.py` |
| `similar-candidates.json` | Per deck name, the deck names the candidate rules propose as forms of it (generous; the batches choose) | `scripts/names-content/similar-candidates.mjs` |
| `DETAILS-REPORT.md` | Coverage, every null story with its note, every dropped similar name, the warnings | `build-details.mjs` |
| `spot-check-details-NNN.md`, `spot-check-details-INDEX.md` | 10 random entries per batch (seeded by the batch number) for the owner | `scripts/names-content/spot-check-details.mjs` |

## Batches

20 batches, deck names ordered by 2024 births (most first, ties by name): batch 1 = names 1–65, batch 2 = 66–130, …, batch 20 = the last 60. `node scripts/names-content/details-batches.mjs N` prints batch N (`name<TAB>births`; `| cut -f1` for just the names), so every batch uses the same split. All 1,295 deck names are covered: 1,276 stories and 19 null stories (see the report).

## Steps

```bash
node scripts/names-content/similar-candidates.mjs          # after the deck changes: refresh the candidates
node scripts/names-content/details-batches.mjs 1 | cut -f1  # the names of batch 1
python3 scripts/names-content/drafts/details-001.py         # render a drafted batch to JSON
node scripts/names-content/build-details.mjs                # validate, fill symmetry, write ../name-details.json + DETAILS-REPORT.md
node scripts/names-content/spot-check-details.mjs 1         # sample for the owner (reads the built file)
npm run names:data                                          # publish as public/names/data/details.<hash>.json (also runs on build)
```

## Rules summary

- **Story:** 2 to 4 sentences, 140–480 characters, Hebrew, gender-neutral, plain register. What the name means, its language, how it is formed and where it appears; builds on the card's intro without repeating it. No births, ranks or trends, no famous people, no quotes or chapter/verse references, no `!` or `?`, no claims about luck, character, religion or who gives the name. A Bible person or place only when the card has a checked verse or the intro already names it. When the meaning isn't well established: a shorter story about the word, or `story: null` with an English `storyNote`.
- **Similar names:** forms of the same name only: girls' and boys' forms, real short forms, other spellings, names built on the same word. Not names that only sound or look alike; when unsure, leave it out. Deck names only, never the name itself, 0–6 per name. The candidate rules (`similar-rules.mjs`, tested in `tests/names/similar.test.ts`): same consonants without ו/י and a final ה/א, a feminine ending, ±־אל / ־יה / יהו־ / אלי־, doubled ו/י.
- **The build fails** (exit 1) on a story outside 140–480 characters, `!` or `?`, a quote mark, a chapter/verse pattern or a digit other than a 4-digit year in a story, a similar name that is the name itself or not a known name, a details name that isn't a deck name, and a name in two batches. It **warns** in the report on a deck name with no entry, a Bible mention without a checked verse, and a story sharing more than 60% of its words with the intro. A similar name that is a CBS name but has no card is dropped with a report line. Then it fills symmetry (A lists B, so B lists A), re-sorts each list by 2024 births and caps it at 6. Tested in `tests/names/details.test.ts`.
- The app also removes the user's hidden names from the similar list (`similarForDisplay` in `src/lib/names/detail.ts`).
