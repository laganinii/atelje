// Renders the Atelje app icon and splash sources into assets/, then
// `npx @capacitor/assets generate --ios` turns them into the Xcode asset catalogs.
//   npm run assets
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("assets", { recursive: true });

// Polaroid with washi tape and a serif "a" (drawn in a 1024 box).
const motif = (paper = "#FFFEFB", ink = "#11100F") => `
  <g transform="translate(512 540) rotate(-4) translate(-300 -340)">
    <rect x="10" y="22" width="600" height="700" rx="22" fill="#000" opacity="0.10"/>
    <rect x="0" y="0" width="600" height="700" rx="22" fill="${paper}"/>
    <rect x="40" y="40" width="520" height="500" rx="8" fill="#EDE5D6"/>
    <text x="300" y="455" text-anchor="middle" font-family="Instrument Serif, Noto Serif, serif" font-style="italic" font-size="440" fill="${ink}">a</text>
    <rect x="120" y="610" width="300" height="10" rx="5" fill="${ink}" opacity="0.18"/>
    <g transform="translate(300 -6) rotate(6)">
      <rect x="-130" y="-34" width="260" height="68" fill="#D9B75F" opacity="0.88"/>
    </g>
  </g>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#F5F1E8"/>${motif()}</svg>`;
const splash = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="${bg}"/>
  <g transform="translate(1366 1366) scale(0.62) translate(-512 -512)">${motif()}</g></svg>`;

await sharp(Buffer.from(icon)).flatten({ background: "#F5F1E8" }).removeAlpha().png().toFile("assets/icon-only.png");
await sharp(Buffer.from(splash("#F5F1E8"))).flatten({ background: "#F5F1E8" }).removeAlpha().png().toFile("assets/splash.png");
await sharp(Buffer.from(splash("#11100F"))).flatten({ background: "#11100F" }).removeAlpha().png().toFile("assets/splash-dark.png");
console.log("assets/icon-only.png, assets/splash.png, assets/splash-dark.png written");
