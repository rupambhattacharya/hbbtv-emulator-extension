/******/ (() => { // webpackBootstrap
/**
 * HbbTV Emulator - Service Worker
 * Handles UA spoofing, content-type rewriting, and extension state.
 */

const DEFAULT_STATE = {
  enabled: true,
  userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.5) AppleWebKit/537.36 (KHTML, like Gecko) 85.0.4183.93/6.5 TV Safari/537.36 HbbTV/1.6.1 (+DRM+DL+PVR;Samsung;SmartTV2022;T-KTM2DEUC-1490.3;;)',
  userAgentPreset: 'samsung-tizen-2022',
  debugOverlay: false
};

let state = { ...DEFAULT_STATE };

// Load state from storage on startup
chrome.storage.local.get('hbbtvEmulatorState', (result) => {
  if (result.hbbtvEmulatorState) {
    state = { ...DEFAULT_STATE, ...result.hbbtvEmulatorState };
  }
  updateRules();
});

// Listen for state changes from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATE') {
    sendResponse(state);
    return true;
  }

  if (message.type === 'SET_STATE') {
    state = { ...state, ...message.payload };
    chrome.storage.local.set({ hbbtvEmulatorState: state });
    updateRules();
    sendResponse(state);
    return true;
  }

  if (message.type === 'GET_ENABLED') {
    sendResponse({ enabled: state.enabled });
    return true;
  }
});

/**
 * Update declarativeNetRequest rules for UA spoofing and content-type rewriting.
 */
function updateRules() {
  // Remove all existing dynamic rules first
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const existingIds = existingRules.map(r => r.id);

    const rules = [];

    if (state.enabled) {
      // Rule 1: User-Agent header modification
      rules.push({
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'User-Agent',
              operation: 'set',
              value: state.userAgent
            }
          ]
        },
        condition: {
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'other']
        }
      });

      // Rule 2: Rewrite application/vnd.hbbtv.xhtml+xml to application/xhtml+xml
      rules.push({
        id: 2,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {
              header: 'Content-Type',
              operation: 'set',
              value: 'application/xhtml+xml'
            }
          ]
        },
        condition: {
          resourceTypes: ['main_frame', 'sub_frame'],
          responseHeaders: [
            {
              header: 'content-type',
              values: ['*hbbtv*']
            }
          ]
        }
      });

      // Rule 3: Add Accept header for HbbTV content
      rules.push({
        id: 3,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'Accept',
              operation: 'set',
              value: 'application/vnd.hbbtv.xhtml+xml, application/xhtml+xml, text/html, */*'
            }
          ]
        },
        condition: {
          resourceTypes: ['main_frame', 'sub_frame']
        }
      });
    }

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: rules
    });
  });
}

/******/ })()
;