// Native bridge for the extracted Atelje bundle.
// Runs BEFORE the app bundle (see src/main.js) and exposes:
//   window.AteljeStore  - on-device persistence used by the patched useState calls
//   window.AteljeNative - native share sheet export
// and maps navigator.vibrate() (used by the app for feedback) to iOS haptics.
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from "idb-keyval";

const native = Capacitor.isNativePlatform();
const PREFIX = "atelje:";
const KEYS = ["session", "cards", "inbox"];
const cache = new Map(); // key -> parsed JSON value
const images = new Map(); // card id -> data URL
const IMG_DIR = "images";

// ---------- image storage (Filesystem on iOS, IndexedDB on web) ----------
const imageStore = native
  ? {
      async list() {
        try {
          const r = await Filesystem.readdir({ path: IMG_DIR, directory: Directory.Data });
          return r.files.map((f) => (typeof f === "string" ? f : f.name)).filter((n) => n.endsWith(".txt")).map((n) => n.slice(0, -4));
        } catch {
          return [];
        }
      },
      async get(id) {
        const r = await Filesystem.readFile({ path: `${IMG_DIR}/${id}.txt`, directory: Directory.Data, encoding: Encoding.UTF8 });
        return r.data;
      },
      async set(id, dataUrl) {
        await Filesystem.writeFile({ path: `${IMG_DIR}/${id}.txt`, data: dataUrl, directory: Directory.Data, encoding: Encoding.UTF8, recursive: true });
      },
      async del(id) {
        await Filesystem.deleteFile({ path: `${IMG_DIR}/${id}.txt`, directory: Directory.Data }).catch(() => {});
      },
    }
  : {
      async list() {
        return (await idbKeys()).filter((k) => typeof k === "string" && k.startsWith("img:")).map((k) => k.slice(4));
      },
      get: (id) => idbGet("img:" + id),
      set: (id, v) => idbSet("img:" + id, v),
      del: (id) => idbDel("img:" + id),
    };

// Downscale a picked photo to max 1280px JPEG so it can be stored on device.
const converted = new Map(); // blob URL -> Promise<dataURL>
function toDataUrl(blobUrl) {
  if (!converted.has(blobUrl)) {
    converted.set(
      blobUrl,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const max = 1280;
          const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(img.naturalWidth * scale));
          c.height = Math.max(1, Math.round(img.naturalHeight * scale));
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = blobUrl;
      })
    );
  }
  return converted.get(blobUrl);
}

// ---------- key/value persistence ----------
async function readKey(key) {
  if (native) {
    const { value } = await Preferences.get({ key: PREFIX + key });
    return value;
  }
  return localStorage.getItem(PREFIX + key);
}
async function writeKey(key, json) {
  if (native) await Preferences.set({ key: PREFIX + key, value: json });
  else localStorage.setItem(PREFIX + key, json);
}
async function removeKey(key) {
  if (native) await Preferences.remove({ key: PREFIX + key });
  else localStorage.removeItem(PREFIX + key);
}

async function saveCards(cards) {
  const out = [];
  const live = new Set();
  for (const c of cards) {
    if (c && c.imageUrl) {
      live.add(c.id);
      let url = c.imageUrl;
      if (url.startsWith("blob:")) {
        try {
          url = await toDataUrl(url);
        } catch {
          url = null;
        }
      }
      if (url && images.get(c.id) !== url) {
        images.set(c.id, url);
        await imageStore.set(c.id, url);
      }
      const { imageUrl, ...rest } = c;
      out.push({ ...rest, imageStored: !!url });
    } else out.push(c);
  }
  for (const id of [...images.keys()]) if (!live.has(id)) {
    images.delete(id);
    await imageStore.del(id);
  }
  return out;
}

const timers = {};
const queue = {};
function scheduleSave(key, value) {
  cache.set(key, value);
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    queue[key] = (queue[key] || Promise.resolve()).then(async () => {
      try {
        const v = key === "cards" && Array.isArray(value) ? await saveCards(value) : value;
        await writeKey(key, JSON.stringify(v));
      } catch (err) {
        console.warn("atelje: save failed", key, err);
      }
    });
  }, 300);
}

function load(key, fallback) {
  if (!cache.has(key)) return fallback;
  const v = cache.get(key);
  if (key === "cards" && Array.isArray(v)) {
    return v.map((c) => (c && c.imageStored && images.has(c.id) ? { ...c, imageUrl: images.get(c.id), fly: false } : { ...c, fly: false }));
  }
  return v;
}

window.AteljeStore = {
  peek(key) {
    return cache.has(key) ? cache.get(key) : null;
  },
  // Drop-in replacement for React.useState(initial) that persists on device.
  useStored(React, key, initial) {
    const [value, setValue] = React.useState(() => load(key, initial));
    const first = React.useRef(true);
    React.useEffect(() => {
      if (first.current && !cache.has(key)) {
        first.current = false;
        return; // nothing saved yet: don't write the defaults on first mount
      }
      first.current = false;
      scheduleSave(key, value);
    }, [value]);
    return [value, setValue];
  },
  // Wipe everything Atelje stored on this device (used by "Odjava").
  clear() {
    for (const k of KEYS) {
      clearTimeout(timers[k]);
      cache.delete(k);
      removeKey(k);
    }
    for (const id of [...images.keys()]) imageStore.del(id);
    images.clear();
  },
};

// ---------- export via the iOS share sheet ----------
window.AteljeNative = {
  async shareExport(json) {
    try {
      if (native) {
        const name = `atelje-izvoz-${new Date().toISOString().slice(0, 10)}.json`;
        const { uri } = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: "Atelje — izvoz stola", files: [uri], dialogTitle: "Izvoz stola" });
        return true;
      }
      if (navigator.share) {
        await navigator.share({ title: "Atelje — izvoz stola", text: json });
        return true;
      }
    } catch (err) {
      if (err && /cancel/i.test(String(err.message || err))) return true;
      console.warn("atelje: share failed", err);
    }
    try {
      await navigator.clipboard?.writeText(json);
    } catch {}
    return false;
  },
};

// ---------- haptics: the app calls navigator.vibrate(ms) ----------
if (native) {
  const vibrate = (ms) => {
    const d = Array.isArray(ms) ? ms[0] : Number(ms) || 0;
    if (d >= 20) Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
    else if (d >= 15) Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    else Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    return true;
  };
  try {
    Object.defineProperty(Navigator.prototype, "vibrate", { value: vibrate, configurable: true, writable: true });
  } catch {
    navigator.vibrate = vibrate;
  }
}

// The canvas has its own pinch-zoom; stop iOS from zooming the whole page.
for (const ev of ["gesturestart", "gesturechange", "gestureend"]) {
  document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
}

async function hydrate() {
  for (const key of KEYS) {
    try {
      const raw = await readKey(key);
      if (raw != null) cache.set(key, JSON.parse(raw));
    } catch (err) {
      console.warn("atelje: could not read", key, err);
    }
  }
  try {
    for (const id of await imageStore.list()) {
      const v = await imageStore.get(id);
      if (v) images.set(id, v);
    }
  } catch (err) {
    console.warn("atelje: could not read images", err);
  }
}

async function nativeChrome() {
  if (!native) return;
  await StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  await Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(() => {});
}

export const ready = Promise.all([hydrate(), nativeChrome()]);

export function hideSplash() {
  if (native) SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {});
}
