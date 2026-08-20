/**
 * HbbTV Emulator - Page-Context Injection Script
 * Runs in the page's JavaScript context (not isolated world).
 *
 * Strategy: Override document.getElementById, querySelector, etc. to intercept
 * access to <object> elements. MutationObserver alone is too late because pages
 * call .play() synchronously after creating/finding the element.
 */

import { createApplicationManager } from '../emulators/application-manager.js';
import { createVideoBroadcast } from '../emulators/video-broadcast.js';
import { createCapabilities } from '../emulators/capabilities.js';
import { createConfiguration } from '../emulators/configuration.js';
import { installKeyConstants } from '../emulators/keyset.js';

(function () {
  'use strict';

  console.log('[HbbTV Emulator] Initializing OIPF emulation layer');

  // Install VK_ key constants globally
  installKeyConstants();

  // MIME types we handle
  var HBBTV_VIDEO_TYPES = [
    'video/broadcast',
    'video/mpeg',
    'video/mp4',
    'video/webm',
    'application/dash+xml',
    'application/vnd.apple.mpegurl'
  ];

  var HBBTV_ALL_TYPES = HBBTV_VIDEO_TYPES.concat([
    'application/oipfapplicationmanager',
    'application/oipfconfiguration',
    'application/oipfcapabilities'
  ]);

  // Track emulated objects (DOM element → emulator instance)
  var emulatedObjects = new WeakMap();

  /**
   * Check if a MIME type should be emulated.
   */
  function isHbbtvType(type) {
    if (!type) return false;
    return HBBTV_ALL_TYPES.indexOf(type.toLowerCase()) !== -1;
  }

  function isVideoType(type) {
    if (!type) return false;
    return HBBTV_VIDEO_TYPES.indexOf(type.toLowerCase()) !== -1;
  }

  /**
   * Process an <object> element and attach the appropriate emulator.
   */
  function processObjectElement(obj) {
    if (emulatedObjects.has(obj)) {
      // Already emulated: the object may have been processed while detached
      // (type set before appendChild) — attach its video now that it's in the DOM.
      var existing = emulatedObjects.get(obj);
      if (existing && typeof existing.__ensureAttached === 'function') {
        existing.__ensureAttached();
      }
      return obj;
    }

    var type = (obj.getAttribute('type') || '').toLowerCase();
    if (!isHbbtvType(type)) return obj;

    console.log('[HbbTV Emulator] Intercepting <object> type:', type);

    var emulator = null;

    if (type === 'application/oipfapplicationmanager') {
      emulator = createApplicationManager();
    } else if (isVideoType(type)) {
      emulator = createVideoBroadcast(obj);
    } else if (type === 'application/oipfcapabilities') {
      emulator = createCapabilities();
    } else if (type === 'application/oipfconfiguration') {
      emulator = createConfiguration();
    }

    if (emulator) {
      emulatedObjects.set(obj, emulator);
      applyEmulatorToElement(obj, emulator);
    }

    return obj;
  }

  /**
   * Apply emulator properties to the DOM element.
   * Uses direct property assignment which works on <object> elements.
   */
  function applyEmulatorToElement(obj, emulator) {
    var descriptors = Object.getOwnPropertyDescriptors(emulator);
    var keys = Object.keys(descriptors);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var desc = descriptors[key];
      applyProperty(obj, emulator, key, desc);
    }

    // Setup data attribute watching
    setupDataAttribute(obj, emulator);

    console.log('[HbbTV Emulator] Applied emulator. play =', typeof obj.play,
      ', stop =', typeof obj.stop, ', data =', typeof obj.data);
  }

  function applyProperty(obj, emulator, key, desc) {
    try {
      if (desc.get || desc.set) {
        Object.defineProperty(obj, key, {
          get: desc.get ? desc.get.bind(emulator) : undefined,
          set: desc.set ? desc.set.bind(emulator) : undefined,
          configurable: true,
          enumerable: true
        });
      } else if (typeof desc.value === 'function') {
        obj[key] = function () {
          return desc.value.apply(emulator, arguments);
        };
      } else {
        // For simple values, create forwarding getter/setter
        Object.defineProperty(obj, key, {
          get: function () { return emulator[key]; },
          set: function (v) { emulator[key] = v; },
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {
      // Direct assignment fallback
      try {
        obj[key] = typeof desc.value === 'function'
          ? desc.value.bind(emulator)
          : desc.value;
      } catch (e2) {
        console.warn('[HbbTV Emulator] Failed to set:', key);
      }
    }
  }

  function setupDataAttribute(obj, emulator) {
    if (!emulator.play) return;

    // Get original data descriptor - try HTMLObjectElement first, then the element itself
    var originalDataDesc = null;
    if (typeof HTMLObjectElement !== 'undefined') {
      originalDataDesc = Object.getOwnPropertyDescriptor(HTMLObjectElement.prototype, 'data');
    }
    if (!originalDataDesc) {
      originalDataDesc = Object.getOwnPropertyDescriptor(obj, 'data');
    }

    Object.defineProperty(obj, 'data', {
      get: function () {
        return emulator.data || obj.getAttribute('data') || '';
      },
      set: function (url) {
        console.log('[HbbTV Emulator] data set to:', url);
        // Feed to emulator only. Do NOT mirror onto the real data attribute:
        // Chrome would try to load the media into the <object> natively.
        emulator.data = url;
      },
      configurable: true,
      enumerable: true
    });

    // Check if data attribute is already set
    var existingData = obj.getAttribute('data');
    if (existingData) {
      console.log('[HbbTV Emulator] data attribute already present:', existingData);
      emulator.data = existingData;
    }
  }

  /**
   * Try to process an element if it's an <object> with an HbbTV type.
   */
  function maybeProcess(el) {
    if (el && el.tagName && el.tagName.toUpperCase() === 'OBJECT' &&
        (emulatedObjects.has(el) || isHbbtvType(el.getAttribute('type')))) {
      processObjectElement(el);
    }
    return el;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INTERCEPTION: Override DOM access methods so we can process elements
  // BEFORE the page calls .play() on them.
  // ─────────────────────────────────────────────────────────────────────────

  var origGetElementById = document.getElementById.bind(document);
  document.getElementById = function (id) {
    var el = origGetElementById(id);
    if (el) maybeProcess(el);
    return el;
  };

  var origQuerySelector = document.querySelector.bind(document);
  document.querySelector = function (selector) {
    var el = origQuerySelector(selector);
    if (el) maybeProcess(el);
    return el;
  };

  var origQuerySelectorAll = document.querySelectorAll.bind(document);
  document.querySelectorAll = function (selector) {
    var els = origQuerySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
      maybeProcess(els[i]);
    }
    return els;
  };

  var origGetElementsByTagName = document.getElementsByTagName.bind(document);
  document.getElementsByTagName = function (tag) {
    var els = origGetElementsByTagName(tag);
    if (tag.toLowerCase() === 'object') {
      for (var i = 0; i < els.length; i++) {
        maybeProcess(els[i]);
      }
    }
    return els;
  };

  // Also override getElementsByName (some HbbTV apps use name attributes)
  var origGetElementsByName = document.getElementsByName ? document.getElementsByName.bind(document) : null;
  if (origGetElementsByName) {
    document.getElementsByName = function (name) {
      var els = origGetElementsByName(name);
      for (var i = 0; i < els.length; i++) {
        maybeProcess(els[i]);
      }
      return els;
    };
  }

  // Also intercept innerHTML/insertAdjacentHTML to catch dynamically created objects
  var origInnerHTMLSet = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function (html) {
      origInnerHTMLSet.call(this, html);
      // Process any <object> elements that were just created
      var objects = this.querySelectorAll('object');
      for (var i = 0; i < objects.length; i++) {
        maybeProcess(objects[i]);
      }
    },
    get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get,
    configurable: true
  });

  // Intercept appendChild/insertBefore to catch programmatically added objects
  var origAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function (child) {
    var result = origAppendChild.call(this, child);
    if (child && child.nodeType === 1) {
      maybeProcess(child);
      if (child.querySelectorAll) {
        var objects = child.querySelectorAll('object');
        for (var i = 0; i < objects.length; i++) {
          maybeProcess(objects[i]);
        }
      }
    }
    return result;
  };

  var origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, refNode) {
    var result = origInsertBefore.call(this, newNode, refNode);
    if (newNode && newNode.nodeType === 1) {
      maybeProcess(newNode);
    }
    return result;
  };

  // Intercept setAttribute to catch type being set after creation
  var origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    origSetAttribute.call(this, name, value);
    if (name === 'type' && this.tagName.toUpperCase() === 'OBJECT' && isHbbtvType(value)) {
      processObjectElement(this);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FALLBACK: MutationObserver for anything we might have missed
  // ─────────────────────────────────────────────────────────────────────────

  function setupObserver() {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName.toUpperCase() === 'OBJECT') {
              maybeProcess(node);
            }
            if (node.querySelectorAll) {
              var objects = node.querySelectorAll('object');
              for (var k = 0; k < objects.length; k++) {
                maybeProcess(objects[k]);
              }
            }
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  setupObserver();

  // Process any existing objects
  if (document.readyState !== 'loading') {
    var objects = origQuerySelectorAll('object');
    for (var i = 0; i < objects.length; i++) {
      maybeProcess(objects[i]);
    }
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      var objects = origQuerySelectorAll('object');
      for (var i = 0; i < objects.length; i++) {
        maybeProcess(objects[i]);
      }
    });
  }

  // Expose for debugging
  window.__hbbtvEmulator = {
    version: '1.0.0',
    getEmulatedObjects: function () { return emulatedObjects; },
    processElement: processObjectElement,
    PLAY_STATE: { STOPPED: 0, PLAYING: 1, PAUSED: 2, CONNECTING: 3, BUFFERING: 4, FINISHED: 5, ERROR: 6 }
  };

  console.log('[HbbTV Emulator] OIPF emulation layer ready');
})();
