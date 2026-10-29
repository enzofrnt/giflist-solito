# Plan

## Native
- `PasswordField.native.tsx`: label/hint/error, TextInput, absolute eye button, Lucide Eye/EyeOff.
- Replace secure `Field` usages.
- `Button` gains `icon?: LucideIcon`; render icon with on-color/dark color.
- `ShareAction.native.tsx`: pill with Share2 + “Partager”, used in manage/public headers.
- Apply icons: add/list/manage/edit/delete/save/login/register/logout/email/password.

## Web
- `PasswordInput` Lucide Eye/EyeOff, aria-pressed.
- Profile email current password and admin login use PasswordInput.
- Add icons to key `.ds-btn` actions via `.ds-btn__icon` (manage add already; verify).

## Charter
- Constitution: Iconography subsection + version 1.2.0.
- `docs/design-system/README.md`: table of icon sizes, sources, button combinations, accessibility.
