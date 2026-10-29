# Implementation Plan

1. Add `header` slot to `Screen.native` (outside ScrollView/KeyboardAvoidingView).
2. Move `AppHeader` from children to `header=` on home/login/register/dashboard/manage/giftForm/profile/public.
3. Native stack options `animation: 'fade'` for manage, giftForm, public.
4. Verify simulator: header Y stable, scroll keeps header, back/share appear.
