# Name swiper polish, second run: summary

Spec: `tasks/prd-name-polish-2.md`. Items and per-item status: `backlog.md`. Per-story notes: `scripts/ralph/prd.json`, `scripts/ralph/progress.txt`.

**Nothing here is verified.** After US-NP057 the run went code-only, as the owner asked: no browser, Simulator, screenshots, tests or re-scoring. The only checks were `npx tsc --noEmit` on each commit and, at the end, `npm run lint` (0 errors, 2 warnings) and `npm run build` (passes). Test files whose strings changed were updated but not run.

## Counts

| status | items |
|---|---|
| done (coded) | 116 |
| dropped | 1 |
| total | 117 |

## Dropped

- **NP-123** (MatchSheet shows the card's niqqud): already fixed. MatchSheet has shown niqqud since NP-122 in the first run.

## Left for the owner

Nothing was moved to `owner-decisions.md`. These are partial, or need a look, according to the story notes:

- **US-B21**: `Onboarding.tsx` still has the old error strings ('צריך שם, עד 40 תווים.', '…לשמור שוב…'). They weren't in that item's files.
- **US-B56**: `Intro.tsx:115` and `InviteScreen.tsx:158` still end '…ועל דילוגים אף אחד לא יודע.' inside a longer sentence.
- **US-B69**: the legal text in `privacy.ts` still says 'בבחירה ביחד' (legal text wasn't touched).
- **US-B61**: if the 404 tab title still changes after load, add a React 19 `<title>` in `not-found.tsx`, as `error.tsx` does.
- **US-B49**: a sheet vote on another name no longer arms the pause (NP-092 side effect).
- **US-B50, US-B64**: flagged unverified in their notes: the short-screen card scroll, and text-field autofocus after the sheet animation.
- Tests whose expected strings changed, none run: `authErrors`, `custom`, `detail`, `filters`, `launch`, `lists`, `matches`, `install`, `card` (see the US-B notes).

## US-END fixes

`npm run lint` had 3 React Compiler errors from this run. Fixed in `fix(names): lint and build after the second polish run`:

- `ui/BottomSheet.tsx` `useScrollEdges`: the effect no longer calls `setState` synchronously; the ResizeObserver's first report sets the starting edges. `update` is a plain function now (no `useCallback`), because the compiler couldn't keep the manual memoization.
- `lists/DuelScreen.tsx`: the stop-toast id is set through a module-level `rememberStopToast()` instead of reassigning the module variable inside the component.

The 2 lint warnings were left as they are: `aria-haspopup` on the card `article` (`NameCard.tsx:42`), and an anonymous default export in `pregnancy-landing.mjs`, which isn't `/names` code.
