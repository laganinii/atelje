# Atelje — App Store listing draft

Bundle ID `ie.laganinii.atelje` · Version 1.0.0 (build 1) · Primary language: Croatian (hr), with an English (U.S.) localization of the store page.
Character counts are shown as used/limit.

## App information

| Field | Value |
|---|---|
| Name | **Atelje** (6/30) |
| Subtitle (hr) | Stol za kreativne tragove (25/30) |
| Subtitle (en-US) | A desk for creative traces (26/30) |
| Primary category | **Productivity** |
| Secondary category | Graphics & Design |
| Support URL | https://laganinii.github.io/atelje/ |
| Marketing URL | (optional) https://laganinii.github.io/atelje/ |
| Privacy Policy URL | https://laganinii.github.io/atelje/privacy.html |
| Copyright | 2026 laganinii |
| Price | Free, no in-app purchases |

Category rationale: Atelje is a note/idea board (capturing notes, photos and links and connecting them), which fits Productivity best; Graphics & Design as secondary reflects the moodboard use. If the name "Atelje" is already taken on the store, fall back to e.g. "Atelje — kreativni stol".

## Promotional text

**hr** (131/170): Ostavi trag: bilješku, polaroid ili link. Odgovaraj papirićima, poveži ideje s [[vezama]]. Bez računa — sve ostaje na tvom uređaju.

**en-US** (148/170): Leave a trace: a note, a polaroid or a link. Reply with sticky notes and connect ideas with [[links]]. No account — everything stays on your device.

## Keywords

**hr** (95/100): `moodboard,bilješke,kreativno,ideje,polaroid,inspiracija,skice,umjetnost,dizajn,glazba,film,moda`

**en-US** (94/100): `moodboard,notes,creative,ideas,polaroid,inspiration,sketchbook,art,design,journal,canvas,board`

## Description

### hr (1223/4000)

Atelje je tvoj kreativni stol. Umjesto beskrajnih chatova, ideje ostavljaš kao tragove na velikom stolu koji možeš slobodno pomicati i zumirati.

ŠTO MOŽEŠ OSTAVITI
• Bilješke — misli, pitanja, rečenice koje ne želiš izgubiti
• Polaroide — fotografiju s kamere ili iz galerije, s natpisom rukom
• Linkove — reference iz glazbe, mode, filma; automatske oznake

KAKO RADI
• Tapni prazno mjesto na stolu i odaberi vrstu traga; dvostruki tap otvara fotografije
• Pomiči stol prstom, stisni s dva prsta za zum
• Odgovaraj na trag papirićima — svi odgovori skupljeni su u Nitima
• Poveži tragove pisanjem [[naziva]] — Atelje pokazuje veze i povratne poveznice
• Inbox čuva linkove dok ih ne staviš na stol
• Ti prikazuje samo tvoje tragove; pretraga filtrira po nazivu i sadržaju
• Na početku odabereš ime i jednu ili dvije uloge (glazbenik, slikar, filmaš, modni, filozof…)

PRIVATNOST NA PRVOM MJESTU
Nema računa, nema servera, nema oglasa ni praćenja. Sve što ostaviš sprema se samo na tvom uređaju i radi bez interneta. Stol možeš izvesti kao datoteku preko iOS izbornika za dijeljenje ili jednim dodirom obrisati sve.

Stol se otvara s primjerom — tragovima izmišljenih suradnika — da odmah vidiš kako Atelje izgleda u radu.

### en-US (1264/4000)

Atelje is your creative desk. Instead of endless chats, you leave ideas as traces on a large desk you can freely pan and zoom.

WHAT YOU CAN LEAVE
• Notes — thoughts, questions, sentences you don't want to lose
• Polaroids — a photo from the camera or your library, with a handwritten caption
• Links — references from music, fashion and film, tagged automatically

HOW IT WORKS
• Tap an empty spot on the desk and choose a trace; double-tap to add a photo
• Drag to move around, pinch with two fingers to zoom
• Reply to any trace with sticky notes — all replies are gathered in Niti (Threads)
• Connect traces by writing [[a title]] — Atelje shows links and backlinks
• Inbox keeps links until you place them on the desk
• Ti (You) shows only your traces; search filters by title and content
• Start by choosing a name and one or two roles (musician, painter, filmmaker, fashion, philosopher…)

PRIVACY FIRST
No account, no server, no ads, no tracking. Everything you leave is stored only on your device and works offline. Export your desk as a file through the iOS share sheet, or erase everything with one tap.

The desk opens with an example — traces from fictional collaborators — so you can see Atelje in action right away. The app interface is in Croatian.

## Age rating questionnaire

Answer **None / No** to everything:

- Cartoon or fantasy violence, realistic violence, prolonged graphic or sadistic violence: None
- Profanity or crude humour, mature/suggestive themes, horror/fear themes: None
- Sexual content or nudity, graphic sexual content: None
- Alcohol, tobacco or drug use or references; simulated gambling; contests: None
- Medical/treatment information: None
- Unrestricted web access: **No** (no browser or web view to websites; links are stored as text only)
- User-generated content: **No** — there is no sharing between users, no accounts, no server; content stays on the device (export only through the user's own share sheet)
- Messaging/chat, social features, location sharing: No
- Gambling, loot boxes, in-app purchases: No
- Expected result: **4+**

## App Privacy ("nutrition label")

- **Data Not Collected.** Select "No, we do not collect data from this app".
- Reasoning: no backend, no analytics/crash SDKs, no ads, no accounts, no network requests at all. Name, roles, notes, photos and links are stored only on the device (Capacitor Preferences / app files) and never transmitted to the developer or third parties. Apple's definition of "collect" is transmitting data off the device, which never happens.
- Tracking: No. `PrivacyInfo.xcprivacy` declares `NSPrivacyTracking = false`, no tracking domains, no collected data types, and the required-reason APIs UserDefaults (CA92.1) and file timestamps (C617.1).

## Export compliance

`ITSAppUsesNonExemptEncryption = false` is set in Info.plist (the app uses no encryption beyond what iOS provides), so App Store Connect won't ask per build.

## Content rights

The app contains no third-party content. Example desk content (names Iva, Noa, Marko, Lena, Dora; film reference to Tarkovsky as text only) is original and fictional. Fonts are bundled under the SIL Open Font License (Instrument Serif, IBM Plex Mono, Caveat). Answer "No, it does not contain, show, or access third-party content".

## App Review notes (paste into App Store Connect → App Review Information → Notes)

```
Atelje is a single-user creative desk ("moodboard") that runs entirely on the device. The UI is in Croatian.
There is NO login, NO account, NO server, NO network access, NO in-app purchases, NO hidden, debug or feature-flagged functionality. No demo account is needed.

How to reach every feature:
1. First launch: tap "Započni — odaberi ulogu", pick 1–2 roles, type a name, tap "Uđi u atelje".
2. Stol (Desk) tab: drag to pan, pinch to zoom; the desk starts with example traces from fictional collaborators.
3. Tap an empty spot → sheet with Foto (photo picker / camera), Link, Bilješka (note). Double-tap an empty spot → photo picker. The + button bottom-right opens the same choices.
4. Tap a card → detail: edit text, delete, export, "Niti" (sticky-note replies, type in the field at the bottom) and "Veze" (links/backlinks created by writing [[title]] in a note).
5. Niti tab: all replies; tap one to jump to its card.
6. Inbox tab: paste a link to save it, "Dodaj na stol" moves it to the desk. Links are stored as text; the app never opens websites.
7. Ti tab: only your own traces. Search field at the top filters cards.
8. Settings (slider icon, top right) → "Postavke": profile, "Uredi uloge" (edit roles), "Izvezi stol" (export JSON via the iOS share sheet), "Vrati primjer" (reset to the example desk), "Odjava — obriši podatke" (erase all local data and return to onboarding).
Camera permission is requested only if the user chooses "Take Photo" in the iOS photo picker.
Haptic feedback is used for interactions. Everything works offline; data persists between launches.
```
