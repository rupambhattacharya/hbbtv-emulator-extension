# Chrome Web Store Listing

## Short Description (132 chars max)
Emulates HbbTV OIPF objects with real DASH, HLS and MP4 video playback. Test HbbTV apps in Chrome with full video support.

## Detailed Description

HbbTV Emulator enables developers to test and debug HbbTV (Hybrid Broadcast Broadband Television) applications directly in Chrome — with real video playback.

Unlike other HbbTV extensions that only provide API stubs, this emulator delivers actual DASH and HLS video playback through dash.js and hls.js, making it the only extension where video.play() actually works with adaptive streaming content.

KEY FEATURES:

★ Real Video Playback
• MPEG-DASH via dash.js
• HLS via hls.js
• MP4/WebM via native HTML5

★ Complete OIPF API Emulation
• Application Manager (getOwnerApplication, show, hide, keyset)
• Video/Broadcast object with full playState lifecycle
• Capabilities XML
• Configuration object

★ User-Agent Spoofing
• Samsung Tizen 2022 (HbbTV 1.6.1)
• LG WebOS 2022 (HbbTV 1.5.1)
• Panasonic 2021 (HbbTV 2.0.3)
• Custom User-Agent string support

★ Content-Type Handling
• Automatically rewrites application/vnd.hbbtv.xhtml+xml responses so Chrome renders HbbTV pages instead of downloading them

★ Remote Control Key Mapping
• R/G/Y/B → Color keys (403-406)
• P/S/Space → Play/Stop/Pause
• Arrow keys → Navigation
• Number keys → 0-9
• Backspace → Back (461)

★ PlayState Mapping
• Full HTML5 video events → OIPF playState (0-6) translation
• onPlayStateChange callback support

IDEAL FOR:
• HbbTV application developers
• QA engineers testing HbbTV apps
• Red Button application development
• DVB/broadcast application testing

PRIVACY:
• No data collection — everything runs locally
• No analytics or tracking
• Open source

---

## Category
Developer Tools

## Language
English

## Tags/Keywords
hbbtv, oipf, dash, hls, video, broadcast, emulator, developer tools, smart tv, dvb
