/**
 * HbbTV Emulator - Keyset
 * Handles HbbTV key code constants and keyset management.
 */

export var VK_CODES = {
  VK_RED: 403,
  VK_GREEN: 404,
  VK_YELLOW: 405,
  VK_BLUE: 406,
  VK_UP: 38,
  VK_DOWN: 40,
  VK_LEFT: 37,
  VK_RIGHT: 39,
  VK_ENTER: 13,
  VK_BACK: 461,
  VK_PLAY: 415,
  VK_PAUSE: 19,
  VK_STOP: 413,
  VK_FAST_FWD: 417,
  VK_REWIND: 412,
  VK_0: 48,
  VK_1: 49,
  VK_2: 50,
  VK_3: 51,
  VK_4: 52,
  VK_5: 53,
  VK_6: 54,
  VK_7: 55,
  VK_8: 56,
  VK_9: 57
};

/**
 * Install VK_ constants on the global window object.
 */
export function installKeyConstants() {
  for (var key in VK_CODES) {
    if (VK_CODES.hasOwnProperty(key)) {
      window[key] = VK_CODES[key];
    }
  }
}

/**
 * Keyset mask constants (bitfield).
 */
export var KEYSET_MASKS = {
  RED: 0x1,
  GREEN: 0x2,
  YELLOW: 0x4,
  BLUE: 0x8,
  NAVIGATION: 0x10,
  VCR: 0x20,
  SCROLL: 0x40,
  INFO: 0x80,
  NUMERIC: 0x100,
  ALPHA: 0x200,
  OTHER: 0x400
};
