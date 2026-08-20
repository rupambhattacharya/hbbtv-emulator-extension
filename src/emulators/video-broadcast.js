/**
 * HbbTV Emulator - Video/Broadcast Emulator
 * Core component: emulates OIPF video/broadcast and video/* objects
 * with real playback via dash.js, hls.js, or native HTML5.
 */

import { createDashPlayer } from '../players/dash-player.js';
import { createHlsPlayer } from '../players/hls-player.js';
import { createNativePlayer } from '../players/native-player.js';
import { detectPlayerType } from '../players/player-type.js';

// OIPF Play States
var PLAY_STATE = {
  STOPPED: 0,
  PLAYING: 1,
  PAUSED: 2,
  CONNECTING: 3,
  BUFFERING: 4,
  FINISHED: 5,
  ERROR: 6
};

export function createVideoBroadcast(objectElement) {
  var videoEl = document.createElement('video');
  var playState = PLAY_STATE.STOPPED;
  var currentPlayer = null;
  var dataUrl = '';
  var onPlayStateChangeCallback = null;
  var onFullScreenChangeCallback = null;
  var errorState = null;
  var speed = 0;

  /**
   * Determine the size the video should take, matching the object element.
   * Priority: width/height attributes → inline style → computed CSS (pages
   * often size the object via stylesheet rules) → HbbTV default 1280x720.
   */
  function normalizeSize(v) {
    v = String(v);
    if (v.indexOf('%') === -1 && v.indexOf('px') === -1) v += 'px';
    return v;
  }

  function resolveObjectSize() {
    if (!objectElement) return { w: '1280px', h: '720px' };
    var w = objectElement.getAttribute('width') || objectElement.style.width;
    var h = objectElement.getAttribute('height') || objectElement.style.height;
    if (w && h) return { w: normalizeSize(w), h: normalizeSize(h) };
    try {
      var cs = window.getComputedStyle(objectElement);
      if (/^[1-9][0-9.]*px$/.test(cs.width) && /^[1-9][0-9.]*px$/.test(cs.height)) {
        return { w: w ? normalizeSize(w) : cs.width, h: h ? normalizeSize(h) : cs.height };
      }
    } catch (e) {}
    return { w: w ? normalizeSize(w) : '1280px', h: h ? normalizeSize(h) : '720px' };
  }

  videoEl.style.cssText = 'background:#000;display:block;';
  videoEl.setAttribute('playsinline', '');

  // Hide the object to prevent Chrome rendering it natively ("plug-in not
  // supported" box, or a native <object> video player). display:none only —
  // inline width/height:0 would override the stylesheet and break
  // resolveObjectSize(), which reads the object's CSS-specified dimensions.
  if (objectElement) {
    objectElement.style.display = 'none';
    objectElement.style.visibility = 'hidden';
  }

  /**
   * Insert the video next to the object element. Pages often set the object's
   * type while it is still detached (before appendChild), so this may not be
   * possible at creation time — it is retried from the injection layer when
   * the object enters the DOM, and before playback starts.
   */
  function ensureVideoAttached() {
    if (videoEl.parentNode) return true;
    if (!objectElement || !objectElement.parentNode) return false;
    var size = resolveObjectSize();
    videoEl.style.width = size.w;
    videoEl.style.height = size.h;
    objectElement.removeAttribute('type');  // Prevent Chrome plugin error box
    objectElement.parentNode.insertBefore(videoEl, objectElement.nextSibling);
    return true;
  }

  ensureVideoAttached();

  // Map HTML5 video events to OIPF play states
  function setupVideoEvents() {
    videoEl.addEventListener('loadstart', function () {
      setPlayState(PLAY_STATE.CONNECTING);
    });

    videoEl.addEventListener('waiting', function () {
      setPlayState(PLAY_STATE.BUFFERING);
    });

    videoEl.addEventListener('playing', function () {
      speed = 1;
      setPlayState(PLAY_STATE.PLAYING);
    });

    videoEl.addEventListener('pause', function () {
      if (playState !== PLAY_STATE.STOPPED && playState !== PLAY_STATE.FINISHED) {
        setPlayState(PLAY_STATE.PAUSED);
      }
    });

    videoEl.addEventListener('ended', function () {
      speed = 0;
      setPlayState(PLAY_STATE.FINISHED);
    });

    videoEl.addEventListener('error', function () {
      speed = 0;
      errorState = videoEl.error ? videoEl.error.code : 1;
      setPlayState(PLAY_STATE.ERROR);
    });
  }

  setupVideoEvents();

  function setPlayState(newState) {
    var oldState = playState;
    playState = newState;
    if (onPlayStateChangeCallback && oldState !== newState) {
      try {
        onPlayStateChangeCallback(newState);
      } catch (e) {
        console.warn('[HbbTV Emulator] onPlayStateChange callback error:', e);
      }
    }
  }

  function initPlayer(url) {
    destroyCurrentPlayer();
    ensureVideoAttached();

    var type = detectPlayerType(url);
    console.log('[HbbTV Emulator] Initializing ' + type + ' player for:', url);

    switch (type) {
      case 'dash':
        currentPlayer = createDashPlayer(videoEl, url);
        break;
      case 'hls':
        currentPlayer = createHlsPlayer(videoEl, url);
        break;
      default:
        currentPlayer = createNativePlayer(videoEl, url);
        break;
    }
  }

  function destroyCurrentPlayer() {
    if (currentPlayer) {
      currentPlayer.destroy();
      currentPlayer = null;
    }
  }

  // The emulated OIPF video object
  var emulator = {
    // Properties
    get playState() { return playState; },
    get error() { return errorState; },
    get speed() { return speed; },
    get playPosition() {
      return Math.floor((videoEl.currentTime || 0) * 1000);
    },
    get playTime() {
      return Math.floor((videoEl.currentTime || 0) * 1000);
    },
    get duration() {
      var dur = videoEl.duration;
      if (!dur || !isFinite(dur)) return 0;
      return Math.floor(dur * 1000);
    },
    get width() { return videoEl.videoWidth || parseInt(videoEl.style.width) || 1280; },
    get height() { return videoEl.videoHeight || parseInt(videoEl.style.height) || 720; },

    // Data property (URL setter)
    get data() { return dataUrl; },
    set data(url) {
      dataUrl = url;
      if (url) {
        initPlayer(url);
      }
    },

    // Callbacks
    get onPlayStateChange() { return onPlayStateChangeCallback; },
    set onPlayStateChange(fn) { onPlayStateChangeCallback = fn; },

    get onFullScreenChange() { return onFullScreenChangeCallback; },
    set onFullScreenChange(fn) { onFullScreenChangeCallback = fn; },

    // Stubs for event callbacks HbbTV apps may set
    onPlaySpeedChanged: null,
    onPlayPositionChanged: null,
    onDRMRightsError: null,

    // Methods
    play: function (newSpeed) {
      if (typeof newSpeed === 'number') {
        speed = newSpeed;
        if (newSpeed === 0) {
          videoEl.pause();
          return true;
        }
        videoEl.playbackRate = Math.abs(newSpeed);
      }

      if (!dataUrl && !videoEl.src) {
        console.warn('[HbbTV Emulator] play() called with no data URL set');
        return false;
      }

      if (!currentPlayer && dataUrl) {
        initPlayer(dataUrl);
      }
      ensureVideoAttached();

      // Try to play. If autoplay is blocked, mute and retry.
      // Once user interacts with the page, unmute.
      var playPromise = videoEl.play();
      if (playPromise && playPromise.then) {
        playPromise.then(function () {
          console.log('[HbbTV Emulator] Playback started');
        }).catch(function (e) {
          if (e.name === 'NotAllowedError') {
            console.log('[HbbTV Emulator] Autoplay blocked, retrying muted...');
            videoEl.muted = true;
            videoEl.play().then(function () {
              console.log('[HbbTV Emulator] Playing muted. Click page to unmute.');
              // Unmute on first user interaction
              var unmute = function () {
                videoEl.muted = false;
                document.removeEventListener('click', unmute);
                document.removeEventListener('keydown', unmute);
              };
              document.addEventListener('click', unmute, { once: true });
              document.addEventListener('keydown', unmute, { once: true });
            }).catch(function (e2) {
              console.warn('[HbbTV Emulator] play() failed even muted:', e2.message);
            });
          } else {
            console.warn('[HbbTV Emulator] play() rejected:', e.message);
          }
        });
      }
      return true;
    },

    stop: function () {
      speed = 0;
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      destroyCurrentPlayer();
      setPlayState(PLAY_STATE.STOPPED);
      return true;
    },

    seek: function (posMs) {
      if (videoEl.duration && isFinite(videoEl.duration)) {
        videoEl.currentTime = posMs / 1000;
      }
      return true;
    },

    setFullScreen: function (fullscreen) {
      if (fullscreen) {
        if (videoEl.requestFullscreen) {
          videoEl.requestFullscreen();
        } else if (videoEl.webkitRequestFullscreen) {
          videoEl.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      if (onFullScreenChangeCallback) {
        try { onFullScreenChangeCallback(fullscreen); } catch (e) {}
      }
      return true;
    },

    bindToCurrentChannel: function () {
      console.log('[HbbTV Emulator] bindToCurrentChannel() - mock');
      return 0; // success
    },

    release: function () {
      this.stop();
      if (videoEl.parentNode) {
        videoEl.parentNode.removeChild(videoEl);
      }
    },

    // Allow setting width/height
    setWidth: function (w) { videoEl.style.width = w + 'px'; },
    setHeight: function (h) { videoEl.style.height = h + 'px'; },

    // Expose the underlying video element for debugging
    __videoElement: videoEl,

    // Called by the injection layer when the object (re)enters the DOM
    __ensureAttached: ensureVideoAttached,

    // Type identification
    type: 'video/broadcast'
  };

  return emulator;
}
