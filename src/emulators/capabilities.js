/**
 * HbbTV Emulator - Capabilities
 * Emulates the OIPF oipfCapabilities object.
 */

var CAPABILITIES_XML = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<profilelist>',
  '  <ui_profile name="OITF_HD_UIPROF+TRICKMODE+DVB_T+DVB_T2+DVB_S+DVB_S2+DVB_C"',
  '    xmlns="urn:hbbtv:config:oitf:oitfCapabilities:2017-1">',
  '    <ext>',
  '      <parentalcontrol>true</parentalcontrol>',
  '      <clientMetadata>true</clientMetadata>',
  '      <temporalClipping>true</temporalClipping>',
  '    </ext>',
  '    <drm>',
  '      <drm DRMSystemID="urn:dvb:casystemid:19219">',
  '        <format>CI_Plus_1.3</format>',
  '      </drm>',
  '    </drm>',
  '    <video_profile name="MP4_AVC_SD_25_HEAAC" type="video/mp4"',
  '      transport="DASH" DRMSystemID="" />',
  '    <video_profile name="MP4_AVC_HD_25_HEAAC" type="video/mp4"',
  '      transport="DASH" DRMSystemID="" />',
  '    <video_profile name="MP4_AVC_SD_25_HEAAC_EBUTTD" type="video/mp4"',
  '      transport="DASH" DRMSystemID="" />',
  '    <video_profile name="MP4_AVC_HD_25_HEAAC_EBUTTD" type="video/mp4"',
  '      transport="DASH" DRMSystemID="" />',
  '    <video_profile name="TS_AVC_SD_25_HEAAC" type="video/mpeg"',
  '      transport="MPEG2_TS" DRMSystemID="" />',
  '    <video_profile name="TS_AVC_HD_25_HEAAC" type="video/mpeg"',
  '      transport="MPEG2_TS" DRMSystemID="" />',
  '    <audio_profile name="MP4_HEAAC" type="audio/mp4" transport="DASH" DRMSystemID="" />',
  '    <audio_profile name="MP3" type="audio/mpeg" transport="" DRMSystemID="" />',
  '  </ui_profile>',
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
