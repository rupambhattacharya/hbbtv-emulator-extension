/**
 * HbbTV Emulator - Application Manager
 * Emulates the OIPF Application Manager object.
 */

export function createApplicationManager() {
  var appInstance = null;

  function getOrCreateApp() {
    if (!appInstance) {
      appInstance = createApplication();
    }
    return appInstance;
  }

  function createApplication() {
    var visible = true;

    var keyset = {
      _value: 0,
      setValue: function (mask) {
        this._value = mask;
        return mask;
      },
      getValue: function () {
        return this._value;
      },
      // Common keyset constants
      RED: 0x1,
      GREEN: 0x2,
      YELLOW: 0x4,
      BLUE: 0x8,
      NAVIGATION: 0x10,
      VCR: 0x20,
      SCROLL: 0x40,
      INFO: 0x80,
      NUMERIC: 0x100,
      ALPHA: 0x200,
      OTHER: 0x400
    };

    var privateData = {
      keyset: keyset,
      currentChannel: {
        channelType: 0,
        ccid: '',
        dsd: '',
        name: 'Mock Channel',
        onid: 0,
        tsid: 0,
        sid: 0
      }
    };

    var app = {
      privateData: privateData,
      visible: visible,

      show: function () {
        visible = true;
        app.visible = true;
        document.body.style.visibility = 'visible';
        return true;
      },

      hide: function () {
        visible = false;
        app.visible = false;
        document.body.style.visibility = 'hidden';
        return true;
      },

      activate: function () {
        return true;
      },

      destroyApplication: function () {
        try {
          window.close();
        } catch (e) {
          window.location.href = 'about:blank';
        }
      },

      createApplication: function (url, createChild) {
        if (url) {
          if (createChild) {
            window.open(url);
          } else {
            window.location.href = url;
          }
        }
        return getOrCreateApp();
      }
    };

    return app;
  }

  return {
    getOwnerApplication: function (doc) {
      return getOrCreateApp();
    },

    // Some HbbTV apps access this directly
    ownerApplication: getOrCreateApp()
  };
}
