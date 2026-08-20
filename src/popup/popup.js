/**
 * HbbTV Emulator - Popup UI
 */

// UA strings are shaped so vendor feature detectors (e.g. example
// hbbtv-feature-detection) can parse vendor/model/year out of them.
var UA_PRESETS = {
  'samsung-tizen-2022': 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.5) AppleWebKit/537.36 (KHTML, like Gecko) HbbTV/1.6.1 (+DRM+DL+PVR;Samsung;SmartTV2022;T-KTM2DEUC-1490.3;;) 85.0.4183.93/6.5 TV Safari/537.36 Chrome/85.0.4183.93',
  'lg-webos-2022': 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 HbbTV/1.5.1 (+DRM; LGE; OLED55C24LA; WEBOS6.3.2 03.34.95; W6_O22; DTV_W22O;)',
  'panasonic-2021': 'Mozilla/5.0 (FreeBSD; Viera/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36 HbbTV/2.0.3 (+DRM; Panasonic; VIERA 2021; 6.710; am-v3.910 mid-4.0; )'
};

var enableToggle = document.getElementById('enableToggle');
var uaPreset = document.getElementById('uaPreset');
var customUaWrap = document.getElementById('customUaWrap');
var customUa = document.getElementById('customUa');
var debugToggle = document.getElementById('debugToggle');
var statusText = document.getElementById('statusText');

// Load current state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, function (state) {
  if (!state) return;
  enableToggle.checked = state.enabled;
  uaPreset.value = state.userAgentPreset || 'samsung-tizen-2022';
  debugToggle.checked = state.debugOverlay || false;

  if (state.userAgentPreset === 'custom') {
    customUaWrap.classList.add('visible');
    customUa.value = state.userAgent || '';
  }

  updateStatus(state.enabled);
});

// Enable/Disable toggle
enableToggle.addEventListener('change', function () {
  var enabled = enableToggle.checked;
  chrome.runtime.sendMessage({
    type: 'SET_STATE',
    payload: { enabled: enabled }
  });
  updateStatus(enabled);
});

// UA Preset selector
uaPreset.addEventListener('change', function () {
  var preset = uaPreset.value;
  if (preset === 'custom') {
    customUaWrap.classList.add('visible');
    return;
  }

  customUaWrap.classList.remove('visible');
  chrome.runtime.sendMessage({
    type: 'SET_STATE',
    payload: {
      userAgent: UA_PRESETS[preset],
      userAgentPreset: preset
    }
  });
});

// Custom UA input
customUa.addEventListener('change', function () {
  var value = customUa.value.trim();
  if (value) {
    chrome.runtime.sendMessage({
      type: 'SET_STATE',
      payload: {
        userAgent: value,
        userAgentPreset: 'custom'
      }
    });
  }
});

// Debug overlay toggle
debugToggle.addEventListener('change', function () {
  chrome.runtime.sendMessage({
    type: 'SET_STATE',
    payload: { debugOverlay: debugToggle.checked }
  });
});

function updateStatus(enabled) {
  statusText.textContent = enabled ? 'Active' : 'Inactive';
  statusText.className = 'status ' + (enabled ? 'active' : 'inactive');
}
