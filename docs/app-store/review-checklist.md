# Atelje — App Review readiness checklist

Status for version 1.0.0 (1). Checked on 20 Oct 2026 against the current App Review Guidelines.

## Guideline 4.2 — Minimum functionality (wrapped web apps)

Atelje is a Capacitor app whose UI is bundled inside the app (no remote URL, `server.url` not set, no web view to any website). Native integrations present:

- [x] **Haptics** — every interaction that used `navigator.vibrate` now triggers iOS haptics via `@capacitor/haptics` (light / medium impact, warning notification at limits).
- [x] **Native share sheet** — "Izvezi" / "Izvezi stol" writes a JSON file and opens the iOS share sheet (`@capacitor/share` + `@capacitor/filesystem`).
- [x] **Persistent on-device storage** — profile, desk and inbox in `@capacitor/preferences` (UserDefaults); photos resized and stored as app files, restored on next launch.
- [x] **Native photo picker / camera** for polaroids (with `NSCameraUsageDescription`).
- [x] **Safe areas** — `viewport-fit=cover`, top inset on the header, bottom inset on the tab bar and sheets (fixed: the original used the top inset at the bottom).
- [x] **Status bar** styling, **launch screen / splash** (`@capacitor/splash-screen`, hidden after first render), **keyboard** resize handling (`@capacitor/keyboard`).
- [x] Page zoom, bounce, text-selection callouts and tap highlights disabled (inputs stay editable); custom pinch-zoom canvas, drag-to-move cards.
- [x] **Offline**: all JS, CSS and fonts are bundled (`npm test` fails the build if any remote URL or Google Fonts reference appears).
- [x] **No web-style links out**: links are stored and displayed as text only; no `<a href>` to external sites, no in-app browser.
- [ ] Worth adding later (not required): Share Extension to send links/photos from other apps into Inbox; Spotlight/App Intents; widgets; an English UI localization.

## Guideline 2.5.19 — Hidden, dormant or undocumented features

Ran `/home/box/agent-data/workflows/app-store-hidden-feature-audit/SKILL.md`:

1. Source grep (debug, devMode, testMode, mock, fake, bypass, unlock, secret, hidden, admin, staging, `__DEV__`, `import.meta.env.DEV`, `NODE_ENV`, featureFlag, remoteConfig, killSwitch, tapCount, konami, `location.search`/`URLSearchParams`/`location.hash`, locale/timezone switches) over `src/`, `scripts/`, `index.html` and the bundle's app code. Only hits: Tailwind class names (`hidden`, `overflow-hidden`, `md:hidden`) and comments in the extraction script — **SAFE**.
2. No URL parameters, launch arguments, remote config, secret gestures, region switches or paywalls. React is the production build. The double-tap (photo) and re-tapping the active tab (reset view) are standard gestures, shown in the on-screen hints and listed in the review notes.
3. **FIXED** (from the original artifact):
   - A "Nastavi s Apple ID — email skriven" button that did not actually sign in with Apple (fake Sign in with Apple; also a 2.1/4.8 risk) → removed. The app has no login.
   - A "Glas" (voice memo) option that created a fake recording card with a fake player → removed from both add menus; the audio card renderers are unreachable and the seed audio card became a note. No microphone permission is requested.
   - Developer notes shown in the UI ("in-memory preview", "no backend", "Performance audit • fixed" box in Settings, "spring 0.32,0.72,0,1", tap coordinates, etc.) → removed or replaced with user-facing Croatian copy. `npm test` guards against their return.
   - Artifact-host scripts (product-id tracking, link rewriting, postMessage focus hooks) → dropped at extraction.
4. Release artifact verified: the built `dist/` JS (copied to `ios/App/App/public`) is checked by `tests/build.test.mjs` for these strings.
5. Review notes listing every feature: see `listing.md` → "App Review notes".

Result: **ready** from a 2.5.19 standpoint.

## Guideline 2.1 — App completeness

- [x] No placeholder features (fake sign-in and fake voice memo removed). Example content is clearly an example desk and can be reset or erased.
- [x] Works offline, no demo account needed.
- [ ] Needs a real-device / TestFlight smoke test by Gaj before submission (Xcode isn't available on the build box).

## Guideline 5.1.1 / 5.1.2 — Privacy

- [x] No account → no account-deletion requirement; "Odjava — obriši podatke" erases all local data anyway.
- [x] Only one permission string (camera), only used on demand. No tracking, no ATT prompt needed.
- [x] Privacy policy at https://laganinii.github.io/atelje/privacy.html (enable GitHub Pages first).
- [x] `PrivacyInfo.xcprivacy` included in the app target's resources.

## Other

- Language: UI is Croatian only. Set the primary language of the App Store record to Croatian; the English store page should mention the UI is in Croatian (it does).
- Guideline 4.1 (copycats) / 5.2 (IP): no third-party brands in the UI; fonts are OFL.
