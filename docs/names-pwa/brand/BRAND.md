# Nest

**כל ההריון במקום אחד.** Nest is a Hebrew-first app for managing a pregnancy: the follow-up plan and appointments, tasks, questions for the doctor, and documents, arranged by pregnancy week. It is for whoever manages the pregnancy: the pregnant parent, a partner, or both, and it works just as well for someone doing it alone. Sharing is always optional.

This is the brand book for the app, the landing page, the store listings and anything else that carries the name. The colors, type and shapes come from the app's Claude Design redesign; the logo was chosen by the founder on 31 October 2026.

## Name

- The product is **Nest**. The wordmark is always lowercase, **nest**. In running English text write "Nest".
- In Hebrew copy, keep the Latin name: "Nest מרכזת את…", "להוריד את Nest". The Hebrew word קן (nest) is the idea behind the name and can appear in storytelling, never as a second name.
- Tagline: **כל ההריון במקום אחד.** Secondary line used on the landing page: **קצת יותר שקט.**

## Logo

The logo is a lowercase **n** drawn as a shelter, with a clay dot (the egg) held underneath. The rest of the word, **est**, is drawn in the same rounded line: one stroke weight (1/8 of the letter box), round caps, round joins. The n with its dot is the mark and the app icon.

| Asset | Use |
| --- | --- |
| `assets/Logos/nest-wordmark.svg` | Default logo on light grounds (canvas, surface, peach). |
| `assets/Logos/nest-wordmark-on-dark.svg` | On ink or on dark photos. Letters white, dot stays clay. |
| `assets/Logos/nest-mark.svg` | The n alone, where the name is already present or space is tight. |
| `assets/Logos/nest-mark-on-dark.svg` | The n alone on dark grounds. |
| `assets/Logos/app-icon-peach.svg`, `app-icon-peach-1024.png` | **Primary app icon** (iOS 1024 master, web icons). Ink n on `peach-soft`. |
| `assets/Logos/app-icon-ink.svg`, `app-icon-ink-1024.png` | Alternate icon: white n on `ink`. |
| `assets/Logos/android-adaptive-foreground.svg` | Android adaptive icon foreground (432 px, mark inside the 66 dp safe zone). Background color `peach-soft`. |
| `assets/Logos/android-monochrome.svg` | Android 13+ themed icon. |
| `assets/Logos/favicon.svg` | Browser tab icon. |
| `assets/Motion/nest-logo-animated.svg`, `.mp4` | The logo animation (below). |

Rules:

- The dot is always `clay` (#C97A3E). The letters are `ink` on light grounds and white on dark ones. Never recolor the dot to match the letters, except in the Android monochrome icon.
- Clear space around the logo: at least the height of the dot's circle on every side.
- Minimum size: wordmark 16 px tall; mark 20 px tall.
- Don't add a container shape behind the wordmark, outline it, stretch it, set it in Heebo, or rebuild "est" from a font. Use the files.
- The mark is a symmetric glyph, so it is never mirrored in RTL layouts.

## Motion

The logo animation tells the name's story in 2.8 seconds:

1. **The nest draws** (0 to 0.6 s): the n is drawn upside down, as a U-shaped nest.
2. **The egg lands** (0.6 to 1.6 s): the clay dot drops in, squashes on contact and settles.
3. **The nest turns** (1.7 to 2.4 s): a half turn swings the nest over the egg, so it becomes the sheltering n.
4. **It settles** (2.4 to 2.6 s): a slight overshoot, then the static mark.

Use it for the app's splash screen, first launch and the landing page's loading moment, and play it once only. With reduced motion turned on, show the static mark. The SVG respects `prefers-reduced-motion` already. For the app, rebuild the same timing with Reanimated or export it as Lottie rather than playing the MP4.

## Color

The palette is warm and quiet: near-black `ink` on a soft warm-grey `canvas`, white `surface` cards, and two brand warms, `peach` and `clay`.

- Most of the UI is `ink`, `stone` and `canvas`. Warmth is used sparingly: `peach-soft` for the app icon and empty states, `clay` for the egg dot and small accent fills.
- Primary buttons are `ink` with white text. Selected chips are `ink`. Avoid colored primary buttons.
- `clay` fails as text (3.0:1). For accent text, use `clay-deep`.
- `mist` and `faint` are for icons, placeholders and disabled states, never for text people need to read.
- Status colors (`info`, `caution`, `urgent` and their `-bg` pairs) describe **administrative** state only, such as scheduled, booking window closing or overdue. They never imply a medical result, and "done" or "result available" are never shown as a green success state. Status is never shown by color alone; each one also carries a word and an icon.

## Typography

One family: **Heebo** (Google Fonts), which covers Hebrew and Latin. Weights 500, 700 and 800.

- Headings are ExtraBold (800), titles of cards are Bold (700), and running text is Medium (500).
- The type scale is in `tokens.json`: `display-xl` (landing hero only), `display`, `title`, `section`, `card-title`, `body`, `caption`, `label`.
- Hebrew is set right-to-left. Numbers and Latin words inside Hebrew lines keep their own direction.

## Shape and surfaces

- Generous radii: `radius-lg` (22 px) for cards, `radius-xl` (30 px) for the photo hero, `radius-pill` for buttons and chips.
- Cards are white on canvas with `shadow-card`. Over photos, cards are **liquid glass**: white at 16% opacity, a 28 px blur and 180% saturation, a 1 px white border at 40%, and `shadow-glass`.
- Soft peach blobs (60 px blur, 18 to 25% opacity) may sit behind content on canvas. Use one or two per screen at most.

## Imagery

- Warm, natural light; quiet home interiors; soft fabrics; hands, notebooks, baskets and objects of everyday preparation.
- Photos of people show calm, unposed moments. Across a set of images, show different family shapes: one parent, two parents of any gender, a supporting friend or relative. Never imply that Nest is only for women or only for couples.
- Photos used as backgrounds carry a dark-to-clear scrim at the top so white text stays legible (4.5:1 or better).
- Product screenshots and mockups use fictional data and say so: "הנתונים במסך זה הם לדוגמה בלבד".

## Iconography

- Line icons with a 1.8 to 2 px stroke, round caps and round joins, the same family as the logo's line (Feather or Lucide style).
- Icons are `ink` on light grounds, white on glass and ink. A clay icon is reserved for the brand moment (for example the empty state).
- Mirror only directional icons (arrows, chevrons) in RTL. The logo and other non-directional icons stay as they are.
- Touch targets are at least 44 × 44 px, and every icon-only control has a Hebrew `accessibilityLabel` or `aria-label`.

## Voice and copy

Nest sounds like a calm, organized friend: warm, brief, practical and never alarming.

- **Gender-neutral Hebrew.** Use infinitives, nouns and "אפשר…" forms ("לקבוע תור", "אפשר להזמין מישהו נוסף"). Use slashes (רופא/ה) only in labels, never in sentences. Don't assume there is a partner. Sharing is described as optional, and the relationship is free text (בן/בת זוג, אמא, חבר/ה, דולה).
- **Explicit action labels** that say what happens: "קביעת תור", "הוספת משימה", "לקבל עדכון על ההשקה". Avoid "המשך" or "אישור".
- **No medical advice.** Nest organizes; it doesn't diagnose or recommend. Don't invent medical recommendations, benefit amounts or eligibility. Say that Nest doesn't replace the care team wherever health comes up.
- **Mark demo data** as fictional, every time.
- Short sentences, active voice, no exclamation marks in system messages.

Examples:

| Instead of | Write |
| --- | --- |
| "השאירי אימייל ונעדכן אותך" | "משאירים אימייל, ונעדכן כשאפשר יהיה להוריד את האפליקציה." |
| "המשך" | "קביעת תור" |
| "התוצאה תקינה" ✓ green | "התוצאה זמינה" in `ink`, no green |

## Where things live

- Brand files (SVG, PNG, app icons, animation): the project folder `brand/nest/`.
- Landing page: repo `kirilreznik/ken`, route `/pregnancy`, file `src/lib/pregnancy-landing.mjs`.
- App: repo `kirilreznik/pregnancy-manager`. The theme tokens in `src/theme` should move to this palette when the app adopts the redesign.
