# Giftlist — Phase-1 UI Design System Audit

- **Repo**: `giflist-solito`, branch `feat/ui-design-system`, HEAD `c3b8661`
- **Stack**: Bun 1.4.4 (canonical) · Next.js 16.4.3 App Router (Webpack) · React 19.1.0 · Tailwind CSS v4.1.16 via `@tailwindcss/postcss` · Solito + react-native-web 0.21.2 in `packages/app`
- **Scope**: read-only audit. Evidence for Phase 1 (tokens + showcase page), no roll-out.
- **Method**: static inspection of the synced tree (`grep`/file reads, frequency counts). No builds or installs were run (see §8 for why the local tree is not build-safe yet).

---

## 1. Styling architecture map

There is exactly **one** stylesheet in the whole repo, 50 lines long:

| File | Role |
|---|---|
| `apps/next/src/app/globals.css` | sole CSS entry: `@import "tailwindcss"` (`:1`), `:root` vars (`:3-6`), `@theme inline` (`:8-13`), dark `@media` (`:15-20`), `html` (`:22-27`), `body` (`:29-40`), `@supports` safe-area fallback (`:43-50`) |
| `apps/next/src/app/layout.tsx` | only importer of CSS (`:6`); Geist fonts (`:8-16`); `<body className="… antialiased">` (`:63`) |
| `apps/next/postcss.config.mjs` | `plugins: ["@tailwindcss/postcss"]` (`:2`) — the entire PostCSS chain |
| `apps/next/next.config.ts` | `transpilePackages: ['app','expo-image']` (`:4`), webpack alias `react-native → react-native-web` (`:7-10`), `.web.*` resolution order (`:13-19`) |
| `apps/next/tsconfig.json` | `@/*` → `src/*`, `app/*` → `packages/app/*` (`:25-32`) |

**Tailwind v4 is fully CSS-first.** There is **no `tailwind.config.js/ts` anywhere**, no `@source`, no `@custom-variant`, no `@utility`, and **no `postcss-import`**. `@theme inline` only aliases four variables (`--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`); no brand palette is registered.

**No `sass` dependency exists.** `bun.lock` lists `sass` only as Next's *optional* peer (`next@16.4.3`, `"optionalPeers": ["sass"]`); `node_modules/sass` and `sass-embedded` are absent. `next.config.ts` has no `sassOptions`.

**There are no CSS Modules, no styled-jsx and no `<style>` blocks** (glob `*.module.css|scss` → 0; `grep '<style'` → 0).

### The real split: web = Tailwind, shared/native = RN StyleSheet

This is the single most important architectural fact for a "centralized" design system.

| Layer | Styling mechanism | Volume |
|---|---|---|
| `apps/next/src/**` (web-only pages/components) | Tailwind utility strings | **820 `className=`** across 25 files |
| `packages/app/**` (shared, also consumed by Expo) | `StyleSheet.create` + inline `style={}` objects | **0 `className=`**; 3 `StyleSheet` files; 15 inline `style={{}}` |

`StyleSheet.create` lives in `packages/app/components/Header.tsx:378` (335 lines of style objects), `packages/app/features/home/screen.tsx:164`, `packages/app/components/FlickeringGrid.tsx:183`.

Because `Header` is rendered by the web root layout (`layout.tsx:1`, `:66`), **the web header is styled by raw JS objects, not Tailwind** — so no token, `@theme` variable or `.scss` rule can reach it. Concrete duplication of Tailwind values inside `Header.tsx`: `#FFFFFF:380`, `#E5E7EB:386` (= `gray-200`), `#111827:429` (= `gray-900`), `#374151:450` (= `gray-700`), `#1D4ED8:453` (= `blue-700`), `#DBEAFE:442` (= `blue-100`), `#C7D2FE:423` (= `indigo-200`), `maxWidth: 1152` (`:391`, = `max-w-6xl`), `borderRadius: 8` (`:439`, = `rounded-lg`).

Additional inline-style drift: `ReserveDialog.tsx:51-63` re-implements the `env(safe-area-inset-*)` padding already declared in `globals.css:36-39`; `register/page.tsx:213` and `login/page.tsx:172` inject `WebkitTapHighlightColor`/`touchAction`.

**Also note**: `packages/app` is *not* scanned by Tailwind. Tailwind v4 scans from the **current working directory** (here `apps/next`, since scripts run `--cwd apps/next`) and skips `node_modules` + `.gitignore`d paths. Any Tailwind class added to `packages/app` would therefore **not be generated** unless `@source "../../../packages/app"` is added to the CSS entry.

---

## 2. Current visual tokens (all implicit)

Everything is the **Tailwind default palette**. No semantic token layer exists (`bg-blue-600` is used directly as "primary").

**Colors — most repeated utilities** (count): `bg-white` 75 · `text-gray-900` 74 · `text-gray-700` 59 · `border-gray-200` 58 · `ring-blue-500` 49 · `text-gray-600` 47 · `border-gray-300` 40 · `bg-gray-50` 38 · `text-gray-500` 31 · `bg-blue-600` 25 · `bg-blue-700` 22 · `bg-gray-100` 22 · `border-blue-500` 17 · `bg-gray-200` 17 · `text-blue-600` 14 · `text-gray-400` 13 · `bg-blue-50` 12 · `bg-green-700` 11 · `bg-green-600` 11 · `text-red-500` 10 · `bg-red-50` 8 · `text-orange-600` 7 · `border-indigo-200` 5.

Semantic mapping actually in use: **primary = blue-600/700**, **success = green-600/700**, **danger = red-500/600/700**, **warning = orange-500/600 + yellow-50/500**, **neutral = gray-50…900**, **accent = indigo-200 + purple-800** (gradients only).

**Hardcoded hex outside Tailwind** (20 distinct, 78 occurrences) — a parallel palette in JS objects and the email template:
`#e5e7eb` 10 · `#374151` 9 · `#ffffff` 8 · `#f3f4f6` 7 · `#1d4ed8` 7 · `#3b82f6` 5 · `#2563eb` 5 · `#000` 5 · `#f9fafb` 4 · `#c7d2fe` 4 · `#9ca3af` 4 · `#4b5563` 4 · `#111827` 4 · `#dbeafe` 2 · `#1f2937` 2 · `#171717`/`#0a0a0a`/`#ededed` 1 each (`globals.css`) · `#8b5cf6`/`#10b981` 1 each.
Sources: `admin/page.tsx`, `QRCodeDisplay.tsx`, `lib/password-reset.ts:63` (inline-styled email HTML: `#f9fafb`, `#111827`, `#2563eb`, `#4b5563`), `packages/app/components/Header.tsx`, `packages/app/features/home/screen.tsx`. `rgba()` appears 4× (overlays). Several hexes are **near-duplicates of Tailwind shades** (`#3b82f6` = blue-500, `#2563eb` = blue-600, `#1d4ed8` = blue-700, `#8b5cf6` = violet-500).

**Typography.** Geist Sans/Mono are loaded as CSS variables in `layout.tsx:8-16` and mapped by `@theme inline` (`globals.css:11-12`) — **but `body` overrides them with `font-family: Arial, Helvetica, sans-serif` (`globals.css:32`)**. The font variables are therefore dead in effect; the rendered app uses Arial. Sizes: `text-sm` 160 · `text-xs` 53 · `text-lg` 31 · `text-base` 17 · `text-xl` 7 · `text-3xl` 5 · `text-2xl` 5 · `text-4xl` 1. Weights: `font-medium` 82 · `font-semibold` 62 · `font-bold` 19 · `font-normal` 10. No `leading-*`/`tracking-*` scale beyond a handful of ad-hoc values.

**Spacing.** Gaps: `gap-2` 66 · `gap-3` 21 · `gap-4` 18 · `gap-6` 6 · `gap-1.5` 6. Padding: `py-2` 88 · `px-4` 80 · `px-3` 53 · `p-4` 38 · `py-3` 37 · `px-6` 30 · `p-6` 26. Margins: `mb-2` 52 · `mb-4` 40 · `mx-auto` 25. So the *de facto* rhythm is a 4px base with `2/3/4/6` steps — but `p-6` vs `p-4`, `px-3` vs `px-4`, `py-2` vs `py-3` are chosen per component, not per role.

**Radii.** `rounded-lg` 140 · `rounded-full` 50 · `rounded-xl` 47 · `rounded` 9 · `rounded-t` 5 · `rounded-2xl` 2. Two competing "card" radii (`lg` vs `xl`) and two competing control radii (`rounded` vs `rounded-lg`).

**Shadows.** `shadow-sm` 35 · `shadow-lg` 16 · `shadow-md` 11 · `shadow-xl` 10 · `shadow` 4. No elevation scale.

**Breakpoints.** `sm:` **280** uses · `lg:` 12 · `md:` 2. The system is mobile-first with a single effective breakpoint at 640px; `md:` is effectively unused, while `Header.tsx:16,32,46` uses a **JS `window.innerWidth < 768`** breakpoint instead — two different "mobile" definitions (640 vs 768).

---

## 3. UI inventory & inconsistencies

**Pages** (`apps/next/src/app/**/page.tsx`): `/` (11 L, thin shell), `dashboard` (34 L shell + `DashboardClient.tsx` 631), `manage/[id]` (880), `list/[shareCode]` (611 + `page.tsx`), `admin` (679), `profile` (383), `login` (200), `register` (237), `forgot-password`, `reset-password`, `setup-passkey` (68).

**Components.** Web (`apps/next/src/components`): `AlertModal` 174 · `EditListModal` 193 · `GiftFormModal` 274 · `GiftList` 207 · `GiftStatusBadge` 58 · `PasskeyManager` 77 · `PasswordInput` 171 · `PasswordRecoveryForm` 113 · `QRCodeDisplay` 298 · `ReserveDialog` 178 · `SecretModeToggle` 37 · `ScrapingTest` 124 · `AmazonDebug` 111. Shared (`packages/app/components`): `Header` 712 · `FlickeringGrid` 196 · `LogoImage` 42.

### Button — worst offender
`bg-blue-600` appears **25× across 14 files in ~19 distinct variants** (`rounded-lg` vs `rounded-xl`, with/without `border`, `font-medium` vs `font-semibold`, `disabled:opacity-50` sometimes plus `disabled:cursor-not-allowed`, `transition-colors` vs `transition-all duration-200`, `shadow-sm`/`shadow-md`). Examples:
- `register/page.tsx:212` — full string incl. `min-h-[44px] … relative z-10`
- `PasswordRecoveryForm.tsx:103` — `px-4 py-3 font-medium … focus:ring-offset-2`
- `ReserveDialog.tsx:155` — `bg-green-600 … rounded-xl … font-semibold` (green primary)
- `admin/page.tsx:582` — `bg-gradient-to-r from-blue-600 to-blue-700 … shadow-sm hover:shadow-md`
- `PublicListClient.tsx:426` — `text-xs sm:text-sm … shadow-md hover:shadow-lg`

A **second button language** (gradient + `rounded-xl` + `shadow-lg`) exists only on the public list and admin (`PublicListClient.tsx:426,443,482`, `admin/page.tsx:582`). Secondary buttons are also ad-hoc: `px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 …` (`admin/page.tsx:346`, `PublicListClient`, `GiftList`). **No `Button` component exists.**

### Input — second worst offender
Canonical string repeated verbatim **3×**: `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900` (`register/page.tsx:138,157`, `login/page.tsx`, `PasswordInput.tsx:109`), plus a reordered variant in `PasswordRecoveryForm.tsx:100`. `ReserveDialog.tsx:82,93,104` uses a **different scale**: `px-4 py-3 text-base border-2 border-gray-300 rounded-xl … placeholder-gray-500 transition-colors`, while its checkboxes are `w-5 h-5 … border-2 border-gray-400` (`:116,131`). Textareas: 6, no shared class. **No `Input`/`Textarea`/`Field` component.**

### Cards
De facto card = `bg-white rounded-xl shadow-sm border border-gray-200` (`p-6` ×4, `p-4` ×2, `p-8` ×1, `p-4 sm:p-6`); variants add `hover:shadow-md transition-all`, `border-2`, `rounded-2xl shadow-xl p-8 border-gray-100`. `SecretModeToggle.tsx:13` swaps in `border-orange-300`. **No `Card` component.**

### Badges
`GiftStatusBadge.tsx` is the only real badge: `inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium` + tone `bg-green-50 text-green-700 border-green-200` / `bg-orange-50 text-orange-700 border-orange-200` / `bg-gray-50 text-gray-600 border-gray-200`, each with a `w-1.5 h-1.5 bg-*-500 rounded-full` dot. Well-formed, but duplicated inline in `PublicListClient` and `GiftList`. Status chips elsewhere are `bg-green-500 rounded-full`/`bg-orange-500 rounded-full` (different recipe).

### Alerts
Recipes compete: `bg-red-50 border border-red-200 rounded-lg p-3` + `text-sm text-red-600` (`register/page.tsx:201`) vs `bg-red-50 p-3 text-sm text-red-700` vs `rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900` (`PasswordRecoveryForm.tsx:86`) vs `bg-green-50 p-4 text-sm text-green-800` (`:82`). `AlertModal` has a **completely separate** 4-tone system (`bg-*-100` icon chip + `text-*-900` title + `text-*-700` body + `bg-*-600` confirm, `AlertModal.tsx:47-102`). Amber appears only in the recovery form; warning elsewhere is orange/yellow.

### Modals — 6 hand-rolled shells
`fixed inset-0 z-50 overflow-y-auto` + overlay `fixed inset-0 bg-black/20 backdrop-blur-sm` ×5 (`AlertModal.tsx:116-120`, `GiftFormModal.tsx:77-79`, `EditListModal.tsx:57-58`, `PublicListClient.tsx:523-525`, `manage/[id]/page.tsx:739-741`) and one divergent `flex items-end sm:items-center … bg-black/40 p-0 sm:p-4` (`ReserveDialog.tsx:50`, bottom-sheet on mobile). Panels: `bg-white rounded-xl shadow-xl max-w-md w-full` (+ `border border-gray-200`, or `max-h-[90vh] overflow-y-auto`, or `max-w-2xl`). Only `AlertModal` wires **Escape** (`:29-43`) — the others do not. **No focus trap anywhere.**

### Toggles / switches — exact copy-paste ×3
`role="switch"` with identical markup: `DashboardClient.tsx:324-333`, `DashboardClient.tsx:462-471`, `EditListModal.tsx:140-149` (`ml-4 relative inline-flex h-6 w-11 … rounded-full border-2 border-transparent … translate-x-5`). These are the *good* accessible examples (role + `aria-checked`), and are ready to become a `Switch` component.

### Page frames & headers
`min-h-screen bg-gray-50` dominates, in 5 variants (with/without `flex items-center justify-center`, `relative`, `py-12 px-4 sm:px-6 lg:px-8`). Container widths split `max-w-md` 11 · `max-w-6xl` 4 · `max-w-7xl` 2 · `max-w-2xl` 2 · `max-w-4xl` 1. Heading semantics are inconsistent: page titles are `<h1 class="text-3xl">` on `profile`, `<h1 class="text-2xl">` on `dashboard`/`admin`/`manage`, but **`<h2 class="text-3xl">` on `login` and `register`** (no `h1` on either). `admin/page.tsx:336` and `manage/[id]` roll their own `bg-white/90 backdrop-blur-sm shadow-sm border-b` sub-header in addition to the shared `Header`.

### Other drift
- Duplicated/conflicting utilities: `PublicListClient.tsx:443` has both `sm:px-5` **and** `sm:px-6`.
- Gradients: `bg-gradient-to-br from-blue-50 to-indigo-100` (`admin/page.tsx:250`), `from-blue-50 via-white to-purple-50` (`PublicListClient.tsx:235`), `bg-clip-text text-transparent` (`:309`), plus 4 button gradients — purple/indigo appear **only** in marketing accents.
- 89 inline `<svg>` icons with no icon component; menus/badges/spinners all re-declare paths.
- `animate-spin` 22×, no `prefers-reduced-motion` guard anywhere.
- `Header.tsx:473-480` `avatar: { width: 32, height: 22 }` vs `:639-646` `mobileAvatar: 32×32` — a genuine bug in the native/desktop header.
- `min-h-[44px]` (44px touch target) appears only on some auth/nav buttons, not systematically.

---

## 4. Password strength indicator

**Files.** UI: `apps/next/src/components/PasswordInput.tsx` (client). Rules: `packages/app/lib/passwordValidation.ts` (shared, also imported by server routes `api/auth/register`, `reset-password`, `change-password` and by `register/page.tsx`, `ProfileClient.tsx`, `PasswordRecoveryForm.tsx`).

**Rules (single source of truth, `passwordValidation.ts:22-62`)** — 5 independent checks, applied identically client and server: `minLength ≥ 8` (`:25`), `[a-z]` (`:29`), `[A-Z]` (`:33`), `\d` (`:37`), special set `!@#$%^&*()_+-=[]{};':"\\|,.<>/?` (`:41`, `:60`). `validatePassword` returns `errors: string[]` (first error is surfaced as the toast/`role="alert"`); `getPasswordRules` returns the 5 booleans used by the meter; `validatePasswordForZod` adapts to Zod.

**Levels (`PasswordInput.tsx:25-52`).** Score = count of passed rules (0-5), then `Math.min(4, Math.floor(score * 0.8))` → 0-4, mapped to `{label, color}`:

| input | empty | 1 rule | 2 rules | 3 rules | 4 rules | 5 rules |
|---|---|---|---|---|---|---|
| raw score | 0 | 1 | 2 | 3 | 4 | 5 |
| normalized `min(4, floor(score*0.8))` | 0 | 0 | 1 | 2 | 3 | 4 |
| label | `''` | Très faible | Faible | Moyen | Fort | Très fort |
| `color` | gray | red | orange | yellow | green | emerald |

**Rendering.** Bar = `w-full bg-gray-200 rounded-full h-2` track + inner `h-2 rounded-full transition-all duration-300` with inline `width: (score/4)*100%` (`:138-142`); label `text-xs font-medium` in the matching `text-*-600` (`:134`); optional checklist (`showGuide`) renders 5 rows with check/cross SVGs, `text-green-600` when satisfied else `text-gray-500` (`:147-167`). Tone maps are duplicated literals `strengthColors` (`:79-86`) and `strengthTextColors` (`:88-95`). Show/hide eye toggle with `aria-label` (`:112-128`). Consumers: `register/page.tsx:167` (`showStrength`+`showGuide`), `profile/ProfileClient.tsx:250,267,284` (change password), `PasswordRecoveryForm.tsx:92` (`showStrength showGuide`), `login/page.tsx:140` (both `false`).

**Defects to fix in the refactor (do not preserve):**
1. A non-empty password that fails every rule (e.g. `"aaaa"`) yields `score 0` → **bar width 0%** while the label already reads "Très faible" — the bar looks empty/broken.
2. `Math.floor(score*0.8)` + `Math.min(4, …)` compresses 5 rules into 4 segments, so the bar jumps 0/0/25/50/75/100 and "Très fort" is reachable only at 5/5. Score and label disagree at the low end.
3. Empty state returns `label: ''` and `color: 'gray'` (`:26-28`) — only safe because rendering is guarded by `value`.
4. `minLength={showGuide ? 8 : 6}` (`:110`) contradicts the real 8-character rule when `showGuide` is false (login).
5. `yellow`/`emerald` tones are used by **no other component** — they are one-off tokens.

**Reuse vs refine.** **Reuse**: `getPasswordRules`/`validatePassword` verbatim (already shared and server-aligned — the meter must keep deriving from them so UI and API never disagree); the 5 rule labels; the `showPassword` toggle + its `aria-label`; the checklist pattern; the component's public props (`showStrength`, `showGuide`, `className`). **Refine**: extract `calculatePasswordStrength` out of the component into `packages/app/lib/passwordValidation.ts` (or a sibling `passwordStrength.ts`) so the showcase and any native surface share it; replace the arithmetic with an explicit 4-level threshold (`0 rules → 0%`, monotonic); move `strengthColors`/`strengthTextColors` into the token layer as semantic `--ds-color-strength-*`; replace `border`+`rounded-lg` with the new `Input` token set; add `aria-live="polite"` on the label and `aria-valuenow/min/max` on the meter (currently absent).

---

## 5. SCSS feasibility & recommended architecture

### What the toolchains actually support

- **Next.js has first-class Sass support** once `sass` is installed: `.scss`/`.sass` and `.module.scss` are compiled by `sass-loader`, configurable via `sassOptions` in `next.config`. Requires `bun add -D sass` — [Next.js Sass guide](https://nextjs.org/docs/app/guides/sass). Today `sass` is **not** installed.
- **Tailwind CSS v4 explicitly does not support preprocessors**: "Tailwind CSS v4.0 is a full-featured CSS build tool designed for a specific workflow, and is not designed to be used with CSS preprocessors like Sass, Less, or Stylus" — [Tailwind compatibility](https://tailwindcss.com/docs/compatibility). Tailwind bundles `@import` itself, and provides nesting/variables natively; with CSS Modules it needs `@reference` for `@apply`.
- **Sass `@import` is deprecated** as of Dart Sass 1.80.0 and will be **removed in 3.0.0**; use `@use`/`@forward` — [Sass @import](https://sass-lang.com/documentation/at-rules/import/). Also: Sass only inlines plain `.css` imports when the URL **omits** the `.css` extension.
- **Metro/Expo has no SCSS compile step for native.** React Native native styles are JS objects. Therefore `packages/app` **cannot** consume `.scss` — the shared/native boundary is hard.

### Recommended structure (feasible, low risk)

Keep **two cooperating layers**: Tailwind CSS-first for utilities/`@theme`, SCSS for the semantic component layer and token authoring. SCSS never becomes the Tailwind entry.

```
apps/next/src/styles/
  _tokens.scss      # SCSS maps (source of truth) → emits :root { --ds-* } custom properties
  _mixins.scss      # breakpoint(), focus-ring(), elevation(), safe-area(), truncate()
  _typography.scss  # .ds-h1…h4, .ds-body, .ds-caption, .ds-label
  _forms.scss       # .ds-input, .ds-textarea, .ds-select, .ds-checkbox, .ds-field-error
  _components.scss  # .ds-btn (+ --primary/--secondary/--ghost/--danger, --sm/--md), .ds-card, .ds-badge, .ds-alert, .ds-modal, .ds-switch
  index.scss        # @use 'tokens'; @use 'mixins'; … all inside @layer components
apps/next/src/app/globals.css   # unchanged role: @import "tailwindcss"; + @theme mapping to var(--ds-*)
```

Design rules that make this safe:

1. **One source of truth = SCSS maps → CSS custom properties.** `_tokens.scss` emits `:root { --ds-color-primary-600: #2563eb; --ds-space-2: .5rem; --ds-radius-lg: .5rem; --ds-shadow-sm: …; --ds-font-sans: …; }`. `globals.css` then aliases them into Tailwind's theme: `@theme inline { --color-primary: var(--ds-color-primary-600); --font-sans: var(--ds-font-sans); … }` so `bg-primary`/`font-sans` and `.ds-btn` read the **same** values. SCSS variables alone never reach Tailwind; CSS custom properties do.
2. **Keep `@import "tailwindcss"` in a `.css` file.** Never move it into `index.scss`. Tailwind will not parse SCSS, and Sass would try to resolve `tailwindcss` as a Sass module (needs `loadPaths`/custom importer) — it may accidentally survive today because Next chains sass-loader → postcss-loader, but it is unsupported and version-fragile.
3. **Import both in `layout.tsx`** (`import './globals.css'` then `import '@/styles/index.scss'`). Do **not** rely on import order for precedence — make the SCSS layer order-explicit with `@layer` (Tailwind v4 declares `theme, base, components, utilities`), so `.ds-*` rules land in `components` and any override belongs in `utilities`.
4. **Use `@use`/`@forward`, never `@import`** (Dart Sass deprecation → 3.0 removal). Add `sassOptions: { includePaths: [path.join(process.cwd(), 'src/styles')] }` in `next.config.ts` so partials resolve as `@use 'tokens' as *`.
5. **Avoid `@apply` inside SCSS.** It needs Tailwind's theme context; per Tailwind's own CSS-Modules guidance you would need `@reference "../app/globals.css"`. Prefer `var(--ds-*)` or plain CSS properties — also faster at build time.
6. **Do not duplicate the reset.** Tailwind emits Preflight; `globals.css` already hand-rolls `html`/`body`/safe-area (`:22-50`). Move those into `_tokens.scss`/base layer once, not twice.

**Feasible**: full token + component SCSS layer on web; `*.module.scss` for one-off isolated components; `@use`d mixins for breakpoints/elevation/focus; generated `:root` custom properties consumable by Tailwind, inline styles and (read-only) RNW.
**Not feasible**: replacing Tailwind with SCSS; a single `globals.scss` that `@import`s Tailwind; SCSS in `packages/app` or `apps/expo` for native; making the RN `StyleSheet` layer consume CSS variables (StyleSheet has no `var()` — native must instead read a **JS token module**, e.g. `packages/app/theme/tokens.ts`, generated from or kept in sync with `_tokens.scss`; that sync is the one real duplication cost and should be explicitly accepted or generated in a later phase).

---

## 6. Responsive / accessibility baseline

- **Breakpoints**: effectively one (`sm:` 640px, 280 uses). `md:` used 2×, `lg:` 12×. `Header.tsx` bypasses CSS entirely with `window.innerWidth < 768` (`:16,32,46`) and `Dimensions` on native — so the header switches at 768 while the rest switches at 640.
- **Mobile menu**: `Header.tsx` `showMobileMenu` state, absolute/fixed overlay `rgba(0,0,0,0.5)` (`:569`), panel `:577-593`, auto-closes on resize to desktop (`:34-51`). It is a `Pressable` with `pressed` styles, `minHeight 44` (`:542-549`). **No `aria-expanded`, no `aria-controls`, no Escape-to-close** on the header menu. Other mobile UI (grids, tables) collapses via `sm:`/`grid-cols-1`.
- **Focus states**: consistently present on web primitives — `focus:outline-none` 62×, `focus:ring-2` 64×, `focus:ring-blue-500` 49×, `focus:ring-offset-2` 15×, plus `focus:ring-{red,green,gray,orange}-500` for destructive/success/secondary. **`focus-visible:` is used 0 times**, and there is **no global `:focus-visible` rule** — a design-system-level fix (one mixin) would remove ~60 repeated class strings. `Header`/`FlickeringGrid` have no visible keyboard focus at all (RN pressed states only).
- **Hover/disabled**: `hover:` 121×; `disabled:opacity-50` 28×, `disabled:cursor-not-allowed` 17× (i.e. inconsistent pairing).
- **ARIA**: `aria-label` **2** (`PasskeyManager.tsx:62`, `PasswordInput.tsx:115`), `aria-describedby` **0**, `aria-invalid` **0**, `aria-live` **0**, `aria-expanded` **0**, `aria-current` **0**, `aria-hidden` **0**. `role=` 11 — good spots: `role="switch"`+`aria-checked` ×3, `role="alert"`/`role="status"` in `PasswordRecoveryForm`, `PasskeyManager`, `setup-passkey`. **No `role="dialog"`/`aria-modal` on any of the 6 modals**, no focus trap, no restore-focus, no `document.body` scroll lock. 45 `<label>` for 32 `<input>` (some wrapped), so label association is mostly there but error text is never programmatically linked to its field.
- **Dark mode is declared but dead**: `globals.css:15-20` flips `--background/--foreground`, but `body` is the only consumer (`:30-31`) while every card/input hardcodes `bg-white text-gray-900`; `dark:` variants: **0**. The result is a white-on-light UI on a dark page canvas for dark-mode users.
- **Motion**: 22 `animate-spin`, 6+ `transition-*`; **0** `prefers-reduced-motion` guards.
- **Touch targets**: `min-h-[44px]` is ad-hoc (auth/header only), not systemic.
- **Contrast**: `text-gray-400` (13×) and `placeholder-gray-500` on `bg-white` sit at/below 4.5:1 for body text; `text-gray-500` on `bg-gray-50` is borderline — a token-level decision is needed rather than per-instance.

---

## 7. Showcase content plan (`/design-system` route, Phase 1)

| Showcase section | Reuse (existing) | New |
|---|---|---|
| Brand / logo | `LogoImage` (`packages/app/components/LogoImage.tsx`, web/native split), `/public/logo.webp`, `layout.tsx` metadata block | Wordmark lockup + size scale (`--ds-logo-*`) |
| Palette | measured Tailwind usage (§2) as the seed | `--ds-color-{primary,success,danger,warning,neutral,accent}` + 50-900 ramps; swatch grid with hex/var names; contrast-annotated pairs |
| Typography scale | Geist wiring (`layout.tsx:8-16`), observed sizes/weights | Fix `body` font-family; `display/h1/h2/h3/body/caption/label` tokens + `.ds-*` classes; specimen with real strings |
| Buttons (variants × sizes × states) | the 25 `bg-blue-600` instances + secondary/gradient offenders as the spec to converge on | `.ds-btn` + `--primary/--secondary/ghost/danger/success`; `--sm/--md/--lg`; default/hover/active/focus-visible/disabled/loading; icon-left/right |
| Form controls | `PasswordInput` shell (`:109`), the canonical input class, `ReserveDialog` checkbox pattern | `.ds-input`, `.ds-textarea`, `.ds-select`(0 today), `.ds-checkbox`, `.ds-radio`, `.ds-field` (label + hint + error + `aria-describedby`) |
| Alerts / states | `AlertModal` 4-tone map (`:47-102`), `PasswordRecoveryForm` inline alerts, `role="alert"`/`role="status"` usage | `.ds-alert` + `--info/success/warning/danger` (inline + banner + toast); empty/loading/error skeleton states |
| Cards / badges | `GiftStatusBadge` (all 4 tones incl. dot), de-facto card string, `SecretModeToggle` orange variant | `.ds-card` (`p-4/p-6`, `shadow-sm`, `rounded-xl`), `.ds-badge` + `--dot`, stat-card, list-item row |
| Interactive states | switch copy-paste ×3 (`DashboardClient:324,462`, `EditListModal:140`), `SecretModeToggle`, modals' shells | `.ds-switch`, `.ds-modal` (wrapping `AlertModal` shell + `role="dialog"`/`aria-modal`/focus trap/ESC), `.ds-tooltip`, `.ds-tabs` |
| Spacing / borders / radii / shadows | measured rhythm (§2), `rounded-lg/xl/full`, `shadow-sm/md/lg/xl` | `--ds-space-*`, `--ds-radius-*`, `--ds-shadow-*`, `--ds-border-*` scales + visual rulers/z-index ladder |
| Password strength | **reuse `getPasswordRules`/`validatePassword`, labels, toggle**; refine meter (§4) | extracted `calculatePasswordStrength`, `.ds-strength` (track/fill/label/checklist) + a live demo of all 5 levels |

Showcase page itself: `apps/next/src/app/design-system/page.tsx` (static, Server Component, no auth), built **only** from `app/design-system/components/*` showcase blocks; must not import Prisma/auth. Reuse-heavy sections (badge, switch, alert, password) should be rendered from the **real** extracted components, not copies, so the showcase doubles as a regression surface.

---

## 8. Risks & acceptance evidence

**Hard risks**
1. **Expo/native regression.** `packages/app` is the native contract. Any Tailwind class, `.scss` import or CSS custom property added there breaks Metro. Keep shared components on `StyleSheet` (or a JS token module); never import `.scss`/`.css` from `packages/app`.
2. **Solito/RNW boundary.** `next.config.ts:7-19` aliases `react-native → react-native-web` and orders `.web.*` extensions; it is load-bearing (documented in `apps/next/AGENTS.md`). Do not touch, and do not switch to Turbopack.
3. **Tailwind source scanning.** Tailwind scans from `apps/next` cwd only. If the SCSS layer (or a showcase) introduces classes that only appear in `packages/app` or in constructed strings (`bg-${tone}-600`), nothing is generated. Prefer complete literals / explicit maps; add `@source "../../../packages/app"` only if shared files must carry utilities.
4. **Tailwind purge/layer regressions.** Moving rules into `@layer components` changes precedence vs current unlayered utilities; a `.ds-btn` in `components` can be overridden by utilities (intended) — but existing `bg-blue-600` on a `.ds-btn` will now win over the component's base. Verify each refactored page visually.
5. **`@import "tailwindcss"` inside SCSS** would break unpredictably (see §5). Gate it with a lint/grep check.
6. **Sass deprecation noise.** Mixing `@import` partials will emit Dart Sass deprecation warnings and break at Sass 3.0 — enforce `@use`.
7. **Duplicate reset.** Preflight + `globals.css` `html/body` + new SCSS base could triple-apply safe-area/padding and shift every page by 1-2px.
8. **Stale local install (blocking today).** `bun.lock` pins `next@16.4.3` but the installed tree resolves **`next 15.5.2`** (`node_modules/.bin/next --version`), and `node_modules/app` is an unrelated npm package ("app" 0.1.0, `lib/index.js`) rather than a link to `packages/app`. Any build in this state is **not** evidence for Next 16 / the workspace package. Also **local Bun is 1.4.2 vs canonical 1.4.4**.

**Acceptance commands (Phase-1 implementation must run, in order, from repo root)**

```sh
bun --version                                  # must be 1.4.4 (local 1.4.2 → report, don't claim pass)
git fetch origin && git log -1 --oneline       # must be c3b8661 / current origin/main
bun install --frozen-lockfile                  # REQUIRED first: fixes next 15.5.2→16.4.3 + broken `app`
bun run web:typecheck                          # bun run --cwd apps/next typecheck
bun run web:lint                               # bun run --cwd apps/next lint .
bun run web:build                              # bun run --cwd apps/next build (webpack) — must show sass compiled
bun run test                                   # password-reset suite (guards passwordValidation refactor)
bun run --cwd apps/expo export                 # native smoke: proves packages/app untouched/valid
```

Plus targeted assertions for this refactor:

```sh
# 1. Tailwind still emits utilities alongside SCSS output
grep -c 'bg-blue-600' apps/next/src/app/globals.css || true
grep -rq 'ds-btn' .next/static/css/*.css            # token layer reached the bundle
# 2. No SCSS/CSS leaked into the native boundary
! grep -rq "\.scss\|\.css'" packages/app apps/expo/src
# 3. No Sass @import partials (deprecated) and no tailwind import in SCSS
! grep -rn '@import "tailwindcss"' apps/next/src/styles
! grep -rn '^@import' apps/next/src/styles
# 4. Password rules stayed single-sourced (server + client agree)
grep -rn "getPasswordRules\|validatePassword" apps/next/src packages/app/lib | wc -l
# 5. Only the audit + intended files changed
git status --short
```

**Definition of done for Phase 1**: tokens + `.ds-*` layer + `/design-system` showcase exist; `globals.css` still owns `@import "tailwindcss"`; no page was restyled (no roll-out); the four gates above pass under Bun 1.4.4 with `next@16.4.3` installed; `git status` shows only `docs/design-system/ui-audit.md` (this audit) plus the new `styles/`, showcase files and any added dependency (`sass`) that a later feature PR introduces.
