/**
 * HbbTV Emulator - Capabilities
 * Emulates the OIPF oipfCapabilities object.
 */

// Mirrors the structure real TVs expose (and what feature detectors query):
// lowercase transport="dash" (attribute selectors are case-sensitive) and
// PlayReady (urn:dvb:casystemid:19219) declared on the DASH video profiles,
// plus the same profiles without DRM.
var CAPABILITIES_XML = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<profilelist>',
  '  <ui_profile name="OITF_HD_UIPROF+TRICKMODE+DVB_T+DVB_T2+DVB_S+DVB_S2+DVB_C">',
  '    <ext>',
  '      <parentalcontrol schemes="dvb-si">true</parentalcontrol>',
  '      <clientMetadata type="dvb-si">true</clientMetadata>',
  '      <temporalClipping>true</temporalClipping>',
  '    </ext>',
  '  </ui_profile>',
  '  <video_profile name="MP4_AVC_SD_25_HEAAC" type="video/mp4"',
  '    transport="dash" DRMSystemID="urn:dvb:casystemid:19219" />',
  '  <video_profile name="MP4_AVC_HD_25_HEAAC" type="video/mp4"',
  '    transport="dash" DRMSystemID="urn:dvb:casystemid:19219" />',
  '  <video_profile name="MP4_AVC_SD_25_HEAAC" type="video/mp4" transport="dash" />',
  '  <video_profile name="MP4_AVC_HD_25_HEAAC" type="video/mp4" transport="dash" />',
  '  <video_profile name="MP4_AVC_SD_25_HEAAC_EBUTTD" type="video/mp4" transport="dash" />',
  '  <video_profile name="MP4_AVC_HD_25_HEAAC_EBUTTD" type="video/mp4" transport="dash" />',
  '  <video_profile name="TS_AVC_SD_25_HEAAC" type="video/mpeg" />',
  '  <video_profile name="TS_AVC_HD_25_HEAAC" type="video/mpeg" />',
  '  <audio_profile name="MPEG1_L3" type="audio/mpeg" />',
  '  <audio_profile name="HEAAC" type="audio/mp4" />',
  '</profilelist>'
].join('\n');

export function createCapabilities() {
  var xmlDoc = null;

  try {
    var parser = new DOMParser();
    xmlDoc = parser.parseFromString(CAPABILITIES_XML, 'text/xml');
  } catch (e) {
    console.warn('[HbbTV Emulator] Failed to parse capabilities XML:', e);
  }

  return {
    get xmlCapabilities() {
      return xmlDoc;
    },

    get extraSDVideoDecodes() {
      return '';
    },

    get extraHDVideoDecodes() {
      return '';
    },

    get extraUHDVideoDecodes() {
      return '';
    },

    hasCapability: function (capability) {
      // Return true for common HbbTV capabilities
      var supported = [
        '+DRM', '+DL', '+PVR', '+TRICKMODE',
        'urn:hbbtv:config:oitf:oitfCapabilities:2017-1'
      ];
      for (var i = 0; i < supported.length; i++) {
        if (capability.indexOf(supported[i]) !== -1) return true;
      }
      return false;
    }
  };
}
