/**
 * HbbTV Emulator - Configuration
 * Emulates the OIPF oipfConfiguration object.
 */

export function createConfiguration() {
  return {
    configuration: {
      preferredAudioLanguage: 'eng,deu',
      preferredSubtitleLanguage: 'eng,deu',
      preferredUILanguage: 'eng',
      countryId: 'DEU',

      get localSystem() {
        return {
          vendorName: 'HbbTV Emulator',
          modelName: 'Chrome Extension',
          softwareVersion: '1.0.0',
          hardwareVersion: '1.0.0',
          serialNumber: 'EMU-001'
        };
      }
    },

    get localSystem() {
      return this.configuration.localSystem;
    },

    get preferredAudioLanguage() {
      return this.configuration.preferredAudioLanguage;
    },

    get preferredSubtitleLanguage() {
      return this.configuration.preferredSubtitleLanguage;
    },

    get preferredUILanguage() {
      return this.configuration.preferredUILanguage;
    },

    get countryId() {
      return this.configuration.countryId;
    },

    getText: function (key) {
      return '';
    }
  };
}
