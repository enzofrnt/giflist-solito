# UI Contract — Design System Classes (`ds-`)

**Feature**: `002-ui-design-system` · **Status**: Phase 1 proposal
**Purpose**: Stable class/variant contract that Phase 2 pages and future components implement. The showcase renders these classes; the SCSS partials own the styling.

## Conventions

- Namespace: every class starts with `ds-`.
- Tokens: components consume `var(--ds-*)` only; no raw hex/px in component partials.
- Layers: component rules live in `@layer components`; Tailwind utilities may override deliberately.
- States use native pseudo-classes plus `aria-*`/`disabled`; do not rely on class-only state.
- French copy in examples; component API is language-neutral.
- Minimum touch target: 44×44px for interactive controls.

## Buttons

```html
<button class="ds-btn ds-btn--primary ds-btn--md">Enregistrer</button>
<button class="ds-btn ds-btn--secondary ds-btn--sm">Annuler</button>
<button class="ds-btn ds-btn--ghost ds-btn--md">Retour</button>
<button class="ds-btn ds-btn--danger ds-btn--md">Supprimer</button>
<button class="ds-btn ds-btn--primary ds-btn--lg ds-btn--block" disabled>Indisponible</button>
<button class="ds-btn ds-btn--primary ds-btn--md ds-btn--loading" aria-busy="true">Envoi…</button>
```

| Modifier | Values |
|----------|--------|
| Variant | `--primary`, `--secondary`, `--ghost`, `--danger`, `--accent` |
| Size | `--sm`, `--md` (default), `--lg` |
| Layout | `--block`, `--icon` (icon-only, requires `aria-label`) |
| State | `:hover`, `:focus-visible`, `:active`, `[disabled]`, `.ds-btn--loading` + `aria-busy="true"` |
| Icon | `<span class="ds-btn__icon" aria-hidden="true">…</span>` before/after label |

Rules: one primary action per view; danger requires confirmation; loading keeps the width stable; disabled uses `disabled`/`aria-disabled`, never color alone.

## Fields and labels

```html
<div class="ds-field">
  <label class="ds-label" for="email">Adresse e-mail <span class="ds-label__required">*</span></label>
  <input class="ds-input" id="email" type="email" aria-describedby="email-hint email-error" aria-invalid="true" required />
  <p class="ds-hint" id="email-hint">Utilisée pour la connexion.</p>
  <p class="ds-error" id="email-error">Adresse invalide.</p>
</div>
```

| Class | Purpose |
|-------|---------|
| `.ds-field` | Vertical wrapper: label + control + hint/error |
| `.ds-label`, `.ds-label__required` | Label and required marker |
| `.ds-input`, `.ds-textarea`, `.ds-select` (dans `.ds-select-wrap`) (+ wrapper `.ds-select-wrap`) | Controls; `.ds-input--sm/lg`, `.ds-input--invalid` |
| `.ds-hint`, `.ds-error` | Help and error text; error must be linked with `aria-describedby` and `aria-invalid` |
| `.ds-checkbox`, `.ds-radio`, `.ds-switch` | Native-input based controls; switch uses `role="switch"` + `aria-checked` |
| `.ds-field--inline` | Checkbox/radio row (control + label) |

Rules: every control has a real `<label for>`; error text is not placeholder-only; disabled/read-only states remain readable; autocomplete is set on auth fields.

## Feedback

```html
<div class="ds-alert ds-alert--success" role="status">
  <span class="ds-alert__icon" aria-hidden="true">…</span>
  <div class="ds-alert__content">
    <p class="ds-alert__title">Enregistré</p>
    <p class="ds-alert__message">Votre liste a été mise à jour.</p>
  </div>
</div>
```

Variants: `--info`, `--success`, `--warning`, `--danger`. Rules: use `role="alert"` for errors that appear after an action, `role="status"` for non-urgent confirmation; include an icon and text (never color-only); dismiss buttons need an accessible name.

## Cards, badges, containers

| Class | Purpose / variants |
|-------|--------------------|
| `.ds-card` | Surface container; `.ds-card__header`, `.ds-card__body`, `.ds-card__footer` |
| `.ds-card--interactive` | Adds hover/focus elevation for clickable cards |
| `.ds-badge` | Small status label; `--neutral`, `--success`, `--warning`, `--danger`, `--info`; `.ds-badge--dot` |
| `.ds-chip` | Filter/metadata pill; `.ds-chip--selected` |
| `.ds-avatar` | Initial/logo circle; `--sm`, `--md`, `--lg` |
| `.ds-divider` | 1px separator; `--vertical` |
| `.ds-empty` | Empty-state block: icon/title/message/action |
| `.ds-skeleton` | Loading placeholder; honors reduced motion |

## Strength meter

```html
<div class="ds-strength" data-level="3">
  <div class="ds-strength__header">
    <span class="ds-strength__label">Robustesse : Fort</span>
    <span class="ds-strength__hint">4/5 règles</span>
  </div>
  <div class="ds-strength__track" role="meter" aria-valuemin="0" aria-valuemax="4" aria-valuenow="3" aria-label="Robustesse du mot de passe">
    <div class="ds-strength__fill" style="width: 75%"></div>
  </div>
  <ul class="ds-strength__rules">…</ul>
</div>
```

Levels: `0` Très faible (danger), `1` Faible (warning), `2` Moyen (caution), `3` Fort (success), `4` Très fort (strong). Rules derive from `getPasswordRules`; labels and messages are stable.

## Layout helpers

| Class | Purpose |
|-------|---------|
| `.ds-container` | Centered max-width container with responsive gutters |
| `.ds-section` | Vertical rhythm section (token spacing) |
| `.ds-stack` | Vertical flex/grid stack with `--gap-*` |
| `.ds-grid` | Responsive auto layout grid with `--gap-*`, `--min` |

## Accessibility contract

- Focus: every interactive element shows a visible `:focus-visible` ring (2px + 3px offset) via `ds-focus-ring`.
- Keyboard: all demos and modals are reachable in logical order; Escape closes overlays; focus is restored.
- ARIA: `aria-invalid`, `aria-describedby`, `aria-live` (status), `aria-busy` (loading), `role="meter"` (strength), `role="dialog"`/`aria-modal` (future modal component).
- Motion: `prefers-reduced-motion: reduce` disables non-essential transitions/spinners (spinner becomes a static indicator).
- Contrast: body text ≥ 4.5:1; large text ≥ 3:1; control borders ≥ 3:1; never use color as the only signal.
- Touch: interactive controls ≥ 44×44px effective target.

## Phase 2 usage rule

New or refactored screens should compose `.ds-*` components and tokens instead of new page-local Tailwind strings. Tailwind remains available for layout utilities; when a utility conflicts with a component rule, utilities win by layer order, so use them intentionally and document exceptions in the PR.
