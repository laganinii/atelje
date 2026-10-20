// Static checks of the committed iOS project (Xcode is not needed).
import { readFileSync, existsSync } from "node:fs";
import xcode from "xcode";

const fail = (m) => { console.error("check:ios FAILED:", m); process.exit(1); };
const proj = xcode.project("ios/App/App.xcodeproj/project.pbxproj").parseSync();
const configs = proj.pbxXCBuildConfigurationSection();
const appCfgs = Object.values(configs).filter((c) => c && c.buildSettings && c.buildSettings.INFOPLIST_FILE);
if (appCfgs.length !== 2) fail(`expected 2 App target configs, found ${appCfgs.length}`);
for (const c of appCfgs) {
  const b = c.buildSettings;
  if (b.PRODUCT_BUNDLE_IDENTIFIER !== "ie.laganinii.atelje") fail(`${c.name}: bundle id ${b.PRODUCT_BUNDLE_IDENTIFIER}`);
  if (String(b.MARKETING_VERSION) !== "1.0.0") fail(`${c.name}: MARKETING_VERSION ${b.MARKETING_VERSION}`);
  if (String(b.CURRENT_PROJECT_VERSION) !== "1") fail(`${c.name}: CURRENT_PROJECT_VERSION ${b.CURRENT_PROJECT_VERSION}`);
}
const resources = JSON.stringify(proj.pbxResourcesBuildPhaseObj(proj.getFirstTarget().uuid) || proj.hash.project.objects.PBXResourcesBuildPhase);
if (!resources.includes("PrivacyInfo.xcprivacy")) fail("PrivacyInfo.xcprivacy is not in the Resources build phase");
if (!existsSync("ios/App/App/PrivacyInfo.xcprivacy")) fail("PrivacyInfo.xcprivacy missing");
const plist = readFileSync("ios/App/App/Info.plist", "utf8");
for (const k of ["NSCameraUsageDescription", "ITSAppUsesNonExemptEncryption", "CFBundleShortVersionString"]) if (!plist.includes(k)) fail(`Info.plist missing ${k}`);
for (const k of ["NSMicrophoneUsageDescription", "NSLocation", "NSContactsUsageDescription", "NSUserTrackingUsageDescription", "NSPhotoLibraryAddUsageDescription"]) if (plist.includes(k)) fail(`Info.plist has unused permission ${k}`);
if (!existsSync("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")) fail("app icon missing");
console.log("check:ios OK — bundle ie.laganinii.atelje, 1.0.0 (1), privacy manifest in resources, Info.plist permissions minimal");
