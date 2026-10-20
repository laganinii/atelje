# Atelje — screenshot instructions

Apple requires screenshots for the largest iPhone size and, because the app supports iPad (`TARGETED_DEVICE_FAMILY = 1,2`), for the largest iPad size. Smaller sizes are scaled automatically.

| Set | Device in Simulator | Pixel size (portrait) |
|---|---|---|
| iPhone 6.9" (required) | iPhone 16 Pro Max / 17 Pro Max | 1320 × 2868 (1290 × 2796 also accepted) |
| iPad 13" (required while iPad is supported) | iPad Pro 13-inch (M4 or later) | 2064 × 2752 |

Upload 3–10 per set; 5 is a good number. If you'd rather not do iPad screenshots, change `TARGETED_DEVICE_FAMILY` to `1` (iPhone only) in Xcode before the first submission.

## 1. Build and run in the Simulator (on the Mac)

```bash
git clone https://github.com/laganinii/atelje.git && cd atelje
npm ci && npm run build && npx cap sync ios
npx cap open ios          # Xcode: choose the simulator, press Run
```

## 2. Clean status bar

```bash
xcrun simctl status_bar booted override --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
```

(`xcrun simctl status_bar booted clear` resets it.)

## 3. Capture

```bash
xcrun simctl io booted screenshot ~/Desktop/atelje-01-desk.png
```

Repeat for each screen (rename the file). Use the Simulator at 100% scale so the PNG has the full native resolution; check sizes with `sips -g pixelWidth -g pixelHeight ~/Desktop/atelje-*.png`.

## 4. Which screens (with suggested captions)

| # | Screen and content | Caption |
|---|---|---|
| 1 | **Desk** right after onboarding: example cards, washi tape, a polaroid visible, the welcome toast gone | Your creative desk |
| 2 | Tap an empty spot → the **Add here** sheet (Photo / Link / Note) | Leave a trace anywhere |
| 3 | Open the **wet fabric** card → detail with **Threads** sticky-note replies; type a reply | Reply with sticky notes |
| 4 | Add your own photo (drag a photo into the Simulator's Photos first) → polaroid with a caption on the desk | Polaroids with captions |
| 5 | **Inbox** tab with saved links and tags, or the onboarding role picker (**Pick a role**) | Everything stays on your device |

Tips: use your own name in onboarding (e.g. "Gaj", roles painter + musician); avoid the Settings screen; do not show the iOS keyboard on more than one screenshot. Captions can be added in a simple frame (Figma/Keynote) or uploaded as plain screenshots — both are accepted.

Optional App Preview video: `xcrun simctl io booted recordVideo ~/Desktop/atelje.mov` (15–30 s, same sizes).
