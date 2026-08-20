# HbbTV Emulator Chrome Extension

A Chrome extension that emulates HbbTV OIPF objects with real DASH/HLS/MP4 video playback powered by dash.js and hls.js.

## Features

- **OIPF Object Emulation**: Application Manager, Video/Broadcast, Capabilities, Configuration
- **Real Video Playback**: DASH (via dash.js), HLS (via hls.js), MP4/WebM (native HTML5)
- **User-Agent Spoofing**: Preset profiles for Samsung, LG, Panasonic + custom strings
- **Content-Type Handling**: Rewrites `application/vnd.hbbtv.xhtml+xml` so Chrome renders HbbTV pages
- **Remote Control Keys**: Keyboard → HbbTV key code mapping (R/G/Y/B = color keys, etc.)
- **PlayState Mapping**: HTML5 video events → OIPF playState (0-6)

## Installation

### Development (unpacked)

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select this directory
```

### Development with watch

```bash
npm run dev
```

## Usage

1. Click the extension icon to open the popup
2. Toggle emulation on/off
3. Select a User-Agent preset (or use custom)
4. Navigate to any HbbTV application URL
5. The extension automatically intercepts `<object>` elements and provides OIPF APIs

## Key Mappings

| Keyboard | Remote Key | Code |
|----------|-----------|------|
| R | VK_RED | 403 |
| G | VK_GREEN | 404 |
| Y | VK_YELLOW | 405 |
| B | VK_BLUE | 406 |
| P | VK_PLAY | 415 |
| S | VK_STOP | 413 |
| Space | VK_PAUSE | 19 |
| Backspace | VK_BACK | 461 |
| Enter | VK_ENTER | 13 |
| Arrows | Navigation | 37-40 |
| 0-9 | VK_0-VK_9 | 48-57 |

## Architecture

- **Service Worker** (`src/background/`): UA spoofing via declarativeNetRequest, content-type rewriting
- **Content Script** (`src/content/main.js`): Injects page script, handles key interception
- **Inject Script** (`src/content/inject.js`): Page-context OIPF emulation via MutationObserver
- **Emulators** (`src/emulators/`): Individual OIPF object implementations
- **Players** (`src/players/`): dash.js, hls.js, and native HTML5 wrappers

## Testing

1. Load the extension in Chrome
2. Navigate to: `http://hbbtv-test.example.com/index.php?p=videoplayer&d=1&u=<dash-url>`
3. Verify video plays and playState transitions are logged in console
4. Check `window.__hbbtvEmulator` for debugging info
