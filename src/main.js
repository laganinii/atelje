import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/caveat/500.css";
import "./styles/artifact.css";
import "./styles/native.css";

// Storage must be hydrated before the app bundle mounts (it reads it synchronously).
const bridge = await import("./native/bridge.js");
await bridge.ready;
await import("./app/atelje-bundle.js");
requestAnimationFrame(() => requestAnimationFrame(bridge.hideSplash));
