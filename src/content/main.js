/**
 * HbbTV Emulator - Content Script (Isolated World)
 * Handles key code interception (runs in content script isolated world).
 * The OIPF emulation (inject.js) runs in MAIN world via manifest declaration.
 */

(function () {
  setupKeyCodeInterception();

  function setupKeyCodeInterception() {
    var KEY_MAP = {
      'KeyR': { keyCode: 403, key: 'ColorF0Red' },
      'KeyG': { keyCode: 404, key: 'ColorF1Green' },
      'KeyY': { keyCode: 405, key: 'ColorF2Yellow' },
      'KeyB': { keyCode: 406, key: 'ColorF3Blue' },
      'KeyP': { keyCode: 415, key: 'MediaPlay' },
      'KeyS': { keyCode: 413, key: 'MediaStop' },
      'Space': { keyCode: 19, key: 'Pause' },
      'Backspace': { keyCode: 461, key: 'BrowserBack' },
      'Enter': { keyCode: 13, key: 'Enter' },
      'ArrowUp': { keyCode: 38, key: 'ArrowUp' },
      'ArrowDown': { keyCode: 40, key: 'ArrowDown' },
      'ArrowLeft': { keyCode: 37, key: 'ArrowLeft' },
      'ArrowRight': { keyCode: 39, key: 'ArrowRight' }
    };

    for (var i = 0; i <= 9; i++) {
      KEY_MAP['Digit' + i] = { keyCode: 48 + i, key: String(i) };
    }

    document.addEventListener('keydown', function (e) {
      // Skip our own synthetic events to prevent infinite recursion
      if (e._hbbtvEmulated) return;

      var mapping = KEY_MAP[e.code];
      if (mapping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        var newEvent = new KeyboardEvent('keydown', {
          keyCode: mapping.keyCode,
          which: mapping.keyCode,
          key: mapping.key,
          code: e.code,
          bubbles: true,
          cancelable: true
        });
        newEvent._hbbtvEmulated = true;
        e.target.dispatchEvent(newEvent);
      }
    }, true);
  }
})();
