/**
 * HbbTV Emulator - Native Player
 * Handles MP4/WebM playback via native HTML5 video.
 */

export function createNativePlayer(videoElement, url) {
  videoElement.src = url;

  var playPromise = videoElement.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(function (e) {
      console.warn('[HbbTV Emulator] Native player autoplay blocked:', e.message);
    });
  }

  console.log('[HbbTV Emulator] Native player initialized for:', url);

  return {
    destroy: function () {
      videoElement.pause();
      videoElement.removeAttribute('src');
      videoElement.load();
    },

    getPlayer: function () {
      return videoElement;
    }
  };
}
