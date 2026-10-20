// Reproducible extraction of the Atelje app from the single-file React artifact
// in source/atelje-artifact.html, plus the patches that turn it into a native,
// App-Store-ready app. Every patch must match exactly once (or the declared
// count), otherwise the script fails, so a changed artifact can't silently
// produce a half-patched build.
//
//   node scripts/extract-artifact.mjs
//
// Outputs (committed): src/app/atelje-bundle.js, src/styles/artifact.css
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "source/atelje-artifact.html"), "utf8");

// 1. Scripts: keep only the app bundle (the first type=module script). The
//    other inline scripts are injected by the artifact host (external-link
//    rewriting, product-id tracking, focus/close postMessage, media manifest)
//    and are dropped.
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const appScript = scripts.find((m) => /type="module"/.test(m[1]));
if (!appScript) throw new Error("app bundle <script type=module> not found");
let js = appScript[2];

// 2. CSS: all inline <style> blocks, minus remote/unavailable fonts.
let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

function patch(src, label, from, to, count = 1) {
  const n = src.split(from).length - 1;
  if (n !== count) throw new Error(`patch "${label}": expected ${count} match(es), found ${n}`);
  return src.split(from).join(to);
}

const cssPatches = [
  // Host fonts that are not shipped with the artifact.
  ["optimistic font-face", /@font-face\s*\{[^}]*Optimistic[^}]*\}\s*/g, ""],
  ["optimistic html font", /:where\(html\)\s*\{[^}]*\}\s*/g, ""],
  ["optimistic mono code font", /:where\(code, pre, kbd, samp\)\s*\{[^}]*\}\s*/g, ""],
  // Google Fonts import: replaced by bundled @fontsource packages (offline).
  ["google fonts import", /@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);?/g, ""],
];
for (const [label, re, to] of cssPatches) {
  if (!re.test(css)) throw new Error(`css patch "${label}" did not match`);
  css = css.replace(re, to);
}
// Bottom sheet padding used the TOP inset; it must clear the home indicator.
css = patch(css, "sheet bottom inset", "padding-bottom:calc(20px + var(--safe-area-inset-top))", "padding-bottom:calc(20px + var(--safe-area-inset-bottom))");

// 3. JS patches.
const S = "window.AteljeStore";
const jsPatches = [
  // --- Persistence (cards, inbox, session) on the device -------------------
  ["persist session + skip onboarding when a profile exists",
    "let[e,n]=z.useState(null),[t,r]=z.useState(!0)",
    `let[e,n]=${S}.useStored(z,"session",null),[t,r]=z.useState(()=>!${S}.peek("session"))`],
  ["persist cards", "[g,w]=z.useState(jp)", `[g,w]=${S}.useStored(z,"cards",jp)`],
  ["persist inbox", "[E,P]=z.useState(bp)", `[E,P]=${S}.useStored(z,"inbox",bp)`],

  // --- Native share sheet export instead of clipboard ----------------------
  ["export via share sheet",
    'navigator.clipboard?.writeText(i),xe("Kopirano u clipboard — visibly local export"),O(10)',
    'window.AteljeNative.shareExport(i).then((ok)=>xe(ok?"Izvoz spreman — podijeli ili spremi":"Izvoz kopiran u međuspremnik")),O(10)'],
  ["export button (detail)", '"Export local"', '"Izvezi"'],
  ["export button (settings)", '"Copy export • local"', '"Izvezi stol"'],

  // --- Remove the fake "Sign in with Apple" (it never signed in) ----------
  ["remove fake Apple ID copy",
    'v("p",{className:"mono text-[11px] leading-[1.5] mt-3 text-[#6B6660]",children:["Apple ID ostaje skriven • private relay • nitko ne vidi email",a("br",{}),a("span",{className:"text-[9px] bg-black/5 px-1.5 py-0.5 rounded-full mt-2 inline-block",children:"in-memory only — no backend • preview mode"})]})',
    'a("p",{className:"mono text-[11px] leading-[1.5] mt-3 text-[#6B6660]",children:"Bez računa i bez prijave. Sve što ostaviš ostaje samo na ovom uređaju."})'],
  ["remove fake Apple ID button",
    'v("button",{onClick:()=>ia("apple"),className:"w-full h-[48px] rounded-full bg-black text-white flex items-center justify-center gap-2 mono text-[13px] active:scale-[0.98] transition-transform",children:[a("span",{className:"text-[18px]",children:"\uf8ff"})," Nastavi s Apple ID — email skriven"]}),',
    ""],
  ["primary start button",
    'a("button",{onClick:()=>ia("anon"),className:"w-full h-[44px] rounded-full border border-black/10 mono text-[11px] uppercase hover:bg-black/5 transition-colors",children:"Nastavi bez logina — samo odaberi ulogu"})',
    'a("button",{onClick:()=>ia("anon"),className:"w-full h-[48px] rounded-full bg-black text-white mono text-[12px] uppercase active:scale-[0.98] transition-transform",children:"Započni — odaberi ulogu"})'],
  ["apple id generator (dead code)", 'id:i==="apple"?`apple_${Math.random().toString(36).slice(2,8)}`:`anon_${Date.now()}`', "id:`local_${Date.now()}`"],
  ["onboarding social proof", '"5 na stolu • 60 max tragova"', '"primjer stola • do 60 tragova"'],

  // --- Logout also wipes the on-device data -------------------------------
  ["logout wipes local data",
    'onClick:()=>{n(null),r(!0),or(!1),f([]),d(""),O(10)},className:"h-9 px-4 rounded-full bg-black text-white mono text-[10px] uppercase",children:"Logout • clear in-memory"}',
    `onClick:()=>{${S}.clear(),w(jp),P(bp),n(null),r(!0),or(!1),f([]),d(""),O(10)},className:"h-9 px-4 rounded-full bg-black text-white mono text-[10px] uppercase",children:"Odjava — obriši podatke"}`],
  ["edit roles label", '"Edit roles"', '"Uredi uloge"'],
  ["reset desk", 'xe("Reset to initial • local draft")},className:"flex-1 h-11 rounded-full border border-black/10 mono text-[11px] uppercase",children:"Reset desk"}',
    'xe("Stol vraćen na primjer")},className:"flex-1 h-11 rounded-full border border-black/10 mono text-[11px] uppercase",children:"Vrati primjer"}'],

  // --- Fake voice memo: no recording exists, so remove the feature --------
  ["seed audio card -> text", 'color:ve.mustard,private:!1,type:"audio",time:"6h"', 'color:ve.mustard,private:!1,type:"text",time:"6h"'],
  ["remove Glas from tap sheet",
    '{k:"audio",label:"Glas",sub:"12s memo — sirovi zvuk • local draft",icon:"\\uD83C\\uDFA4",color:"#D9B75F",action:()=>{Cl("audio",{x:he.canvasX,y:he.canvasY})}},', ""],
  ["remove Glas from + menu", '{k:"audio",label:"Glas",sub:"12s memo",icon:dl,color:"#D9B75F"},', ""],
  ["audio card renderer unreachable", 'i.type==="audio"?v("div",{className:"mt-3 flex items-center gap-3', '!1?v("div",{className:"mt-3 flex items-center gap-3'],
  ["audio card label", '"04:12 • local draft"', '"04:12"'],
  ["audio detail label", '"04:12 • local"', '"04:12"'],
  ["audio detail renderer unreachable", 'W.type==="audio"&&v("div",{className:"bg-black text-white rounded-[14px]', '!1&&v("div",{className:"bg-black text-white rounded-[14px]'],

  // --- Developer notes visible in the UI -> user-facing copy --------------
  ["login label", '"atelje • session preview"', '"atelje"'],
  ["role picker hint", '"max 2 • treći zamjenjuje prvi • haptic 10ms • in-memory draft"', '"najviše 2 • treća zamjenjuje prvu"'],
  ["role picker footer", 'a("div",{className:"mono text-[9px] text-center mt-2 text-[#8B857C]",children:"visibly local • no persistence • preview"})', 'a("div",{className:"mono text-[9px] text-center mt-2 text-[#8B857C]",children:"sve ostaje na tvom uređaju"})'],
  ["welcome toast", '} • in-memory preview`', "}`"],
  ["header title", '"atelje — eksperiment 01"', '"atelje"'],
  ["header live counter", 'children:["live • ",Math.min(g.length,60)]', 'children:[Math.min(g.length,60)," tragova"]'],
  ["desk limit toast", '"Stol pun — max 60 tragova (in-memory limit)"', '"Stol pun — najviše 60 tragova"'],
  ["file too big toast", '"Datoteka prevelika — max 8MB (in-memory)"', '"Datoteka prevelika — najviše 8 MB"'],
  ["canvas hint", '"tap empty • double-tap foto • drop file • in-memory 60 max"', '"tapni prazno • dvostruki tap za foto"'],
  ["gesture hint", '"Tap prazno za Foto • Pinch 2 prsta • double-tap reset • drop image"', '"Tapni prazno za novi trag • stisni s 2 prsta za zum • dvostruki tap za foto"'],
  ["empty desk hint", '"Tap empty • double-tap foto • drag drop • max 60 in-memory"', '"Tapni prazno mjesto ili dvaput tapni za fotografiju"'],
  ["no search results", '"Pokušaj drugi pojam ili ostavi svoj trag — visibly local draft."', '"Pokušaj drugi pojam ili ostavi svoj trag."'],
  ["tap sheet coords", 'v("div",{className:"mono text-[10px] uppercase text-[#8B857C] mt-1",children:["tap @ ",Math.round(he.canvasX),", ",Math.round(he.canvasY)," • spring 0.32,0.72,0,1 • in-memory"]})', 'a("div",{className:"mono text-[10px] uppercase text-[#8B857C] mt-1",children:"odaberi vrstu traga"})'],
  ["tap sheet foto sub", '"Polaroid 12px bottom 36px • rukom natpis"', '"Polaroid s natpisom"'],
  ["tap sheet link sub", '"Zalijepi referencu s tagovima #zvuk #tkanina"', '"Zalijepi referencu — automatske oznake"'],
  ["niti header", 'children:["Niti — svi odgovori • ",Fl.length," • in-memory"]', 'children:["Niti — svi odgovori • ",Fl.length]'],
  ["niti jump", '"skoči na stol • fly animation"', '"skoči na stol"'],
  ["inbox header", 'children:["Inbox • ",E.length," saved • local draft"]', 'children:["Inbox • ",E.length," spremljeno"]'],
  ["inbox sheet header", 'children:["Inbox • ",E.length," saved — ",vt?"swipe down 80px":"swipe up"," • local"]', 'children:["Inbox • ",E.length," spremljeno — ",vt?"povuci dolje":"povuci gore"]'],
  ["inbox empty", '"Inbox prazan — local draft"', '"Inbox je prazan"'],
  ["inbox empty 2", '"Nema spremljenih referenci — local draft."', '"Nema spremljenih referenci."'],
  ["link dialog hint", '"Auto tag: glazba, moda, film • local draft • no backend"', '"Automatske oznake: glazba, moda, film"'],
  ["new note title", '"Nova bilješka • local draft"', '"Nova bilješka"'],
  ["prompt label", '"prompt • facilitator • local draft"', '"zadatak • facilitator"'],
  ["detail meta", 'children:[W.author," • ",W.time," • local draft"]', 'children:[W.author," • ",W.time]'],
  ["link preview box", 'children:["preview • ",i.title," • visibly local"]', 'children:[i.title]'],
  ["image size badge", 'a("span",{className:"mono text-[9px] bg-black/5 px-2 py-1 rounded-full",children:"max 400px • object-cover • lazy"})', ""],
  ["editor placeholder", '"Uredi sadržaj... visibly local draft"', '"Uredi sadržaj..."'],
  ["private note", '"privatni trag — samo ti vidiš • striped overlay + blur + lock • moves to Ti tab only • in-memory"', '"privatni trag — vidiš ga samo ti"'],
  ["threads header", '"Odgovori kao papirići • SVG curved line draw 400ms + pop 300ms"', '"Odgovori kao papirići"'],
  ["threads empty", '"Još nema replika. Ostavi prvi papirić ispod — random offset 20-60px."', '"Još nema replika. Ostavi prvi papirić ispod."'],
  ["backlinks header", '"Spomenuto u • backlinks • fly animation pan + scale 1.1→1 + border flash 600ms"', '"Spomenuto u"'],
  ["outgoing header", '"Outgoing • spominješ"', '"Spominješ"'],
  ["reply placeholder", '"Odgovori kao sticky... Enter creates sticky at random offset 20-60px"', '"Odgovori papirićem..."'],
  ["settings title", '"Atelje — settings • local"', '"Postavke"'],
  ["settings profile label", '"Session • in-memory preview • no backend"', '"Profil"'],
  ["settings no session", '"Nema sesije — login je in-memory draft"', '"Nema profila"'],
  ["settings profile line", 'children:["Ime: ",e.name," • Uloge: ",e.roles.map((i)=>i.name).join(", ")," • Provider: ",e.provider]', 'children:["Ime: ",e.name," • Uloge: ",e.roles.map((i)=>i.name).join(", ")]'],
  ["settings footer", '"No localStorage, no Supabase, no backend — visibly local • preview mode • production perfect"', '"Bez računa, bez servera. Tvoji tragovi ostaju na ovom uređaju."'],

  // --- Safe areas: header was offset twice; tab bar used the top inset ----
  ["header double inset", 'shrink-0 relative",style:{top:"var(--safe-area-inset-top)"}', 'shrink-0 relative",style:{}'],
  ["tab bar height", 'h-[84px] bg-[#FFFEFB]/92', 'bg-[#FFFEFB]/92'],
  ["tab bar bottom inset", 'style:{paddingBottom:"calc(10px + var(--safe-area-inset-top))"}', 'style:{minHeight:"calc(74px + var(--safe-area-inset-bottom))",paddingBottom:"calc(10px + var(--safe-area-inset-bottom))"}'],
];
for (const [label, from, to, count] of jsPatches) js = patch(js, label, from, to, count);

// The Settings "Performance audit • fixed" box is a developer checklist: drop it.
{
  const start = js.indexOf('v("div",{className:"p-3 rounded-[12px] bg-white border border-black/5",children:[a("div",{className:"mono text-[10px] uppercase text-[#6B6660] mb-2",children:"Performance audit • fixed"})');
  const endMarker = 'a("li",{children:"memory limit 60 max • virtualize >600px display:none"})]})]}),';
  const end = js.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('patch "performance audit box" not found');
  js = js.slice(0, start) + js.slice(end + endMarker.length);
}

// Final guard: none of the developer notes may survive.
const forbidden = ["in-memory", "visibly local", "local draft", "preview mode", "production perfect", "no backend", "No localStorage", "Performance audit", "Nastavi s Apple ID", "Apple ID", "spring 0.32", "Glas\"", "Provider: "];
for (const f of forbidden) if (js.includes(f)) throw new Error(`forbidden string still present: ${f}`);

mkdirSync(join(root, "src/app"), { recursive: true });
mkdirSync(join(root, "src/styles"), { recursive: true });
writeFileSync(join(root, "src/app/atelje-bundle.js"), "// GENERATED by scripts/extract-artifact.mjs from source/atelje-artifact.html. Do not edit by hand.\n" + js);
writeFileSync(join(root, "src/styles/artifact.css"), "/* GENERATED by scripts/extract-artifact.mjs from source/atelje-artifact.html. */\n" + css);
console.log(`extracted: bundle ${js.length} bytes, css ${css.length} bytes, ${jsPatches.length + 1} js patches applied`);
