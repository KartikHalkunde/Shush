# AdShush
Auto Mute Ads from IPL, Movies or Shows.

## Firefox-first setup

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on**.
3. Select [manifest.json](manifest.json).
4. Open JioHotstar and play a stream.

## Chromium setup

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.

## Notes

- This project uses Manifest V3 content scripts and a `MutationObserver`.
- If ads are not detected for a specific player update, add the latest ad UI selector in [content.js](content.js).
