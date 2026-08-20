# Privacy Policy - HbbTV Emulator Chrome Extension

**Last updated:** August 2026

## Overview

The HbbTV Emulator Chrome Extension ("the Extension") is a developer tool that emulates HbbTV device APIs in the Chrome browser. This privacy policy explains what data the Extension accesses and how it is used.

## Data Collection

**The Extension does NOT collect, transmit, or store any personal data.**

## Data Usage

The Extension operates entirely locally within your browser. Specifically:

- **No data is sent to external servers** — all processing happens locally in your browser
- **No analytics or tracking** — the Extension does not include any analytics services
- **No user accounts** — no login or registration is required

## Permissions Explained

The Extension requests the following permissions solely for its core functionality:

| Permission | Purpose |
|-----------|---------|
| `storage` | Saves your preferences (enabled/disabled state, selected User-Agent) locally in Chrome's extension storage |
| `declarativeNetRequest` | Modifies HTTP headers (User-Agent, Content-Type) to emulate an HbbTV device |
| `declarativeNetRequestWithHostAccess` | Allows those header modifications to apply on the sites you visit (in combination with host permissions) |
| `host_permissions (<all_urls>)` | Required to inject the OIPF emulation layer and emulate HbbTV objects on any page — HbbTV test pages can be hosted on any domain |

## Local Storage

The Extension stores only your configuration preferences (enabled state, selected User-Agent string, debug overlay preference) using Chrome's `chrome.storage.local` API. This data never leaves your device.

## Third-Party Libraries

The Extension bundles the following open-source libraries for video playback:
- **dash.js** (BSD-3-Clause) — MPEG-DASH player
- **hls.js** (Apache-2.0) — HLS player

These libraries operate entirely within your browser and do not transmit data to any external service beyond fetching the video content URLs you navigate to.

## Changes

If this privacy policy changes, the updated version will be included with the Extension update.

## Contact

For questions about this privacy policy, please open an issue on the Extension's repository.
