/**
 * HbbTV Emulator - HLS Player
 * Wraps hls.js for HLS playback.
 */

import Hls from 'hls.js';

export function createHlsPlayer(videoElement, url) {
  var hls = null;

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 30,
      maxMaxBufferLength: 60
    });

    hls.loadSource(url);
    hls.attachMedia(videoElement);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      console.log('[HbbTV Emulator] HLS manifest parsed, starting playback');
      videoElement.play().catch(function (e) {
        console.warn('[HbbTV Emulator] HLS autoplay blocked:', e.message);
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data.fatal) {
        console.error('[HbbTV Emulator] HLS fatal error:', data.type, data.details);
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      }
    });

    console.log('[HbbTV Emulator] HLS player initialized for:', url);
  } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    videoElement.src = url;
    videoElement.play().catch(function () {});
    console.log('[HbbTV Emulator] Using native HLS for:', url);
  }

  return {
    destroy: function () {
      if (hls) {
        try {
          hls.destroy();
        } catch (e) {
          console.warn('[HbbTV Emulator] HLS player destroy error:', e);
        }
        hls = null;
      }
    },

    getPlayer: function () {
      return hls;
    }
  };
}
