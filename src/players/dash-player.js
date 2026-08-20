/**
 * HbbTV Emulator - DASH Player
 * Wraps dash.js for MPEG-DASH playback.
 */

import dashjs from 'dashjs';

export function createDashPlayer(videoElement, url) {
  var player = dashjs.MediaPlayer().create();

  player.initialize(videoElement, url, true);

  // Configure for HbbTV-like behavior
  player.updateSettings({
    streaming: {
      buffer: {
        fastSwitchEnabled: true,
        stableBufferTime: 12,
        bufferTimeAtTopQuality: 20
      },
      abr: {
        autoSwitchBitrate: { video: true, audio: true }
      }
    }
  });

  console.log('[HbbTV Emulator] DASH player initialized for:', url);

  return {
    destroy: function () {
      try {
        player.reset();
      } catch (e) {
        console.warn('[HbbTV Emulator] DASH player reset error:', e);
      }
    },

    getPlayer: function () {
      return player;
    }
  };
}
