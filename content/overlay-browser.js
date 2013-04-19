﻿/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var ceEasyScreenshot = {
  handleEvent: function ce_easyscreenshot__handleEvent(aEvent) {
    switch (aEvent.type) {
      case "load":
        setTimeout(this.init.bind(this), 500);
        break;
    }
  },

  init: function ce_easyscreenshot__init() {
    this.installButton("ce_easyscreenshot", "nav-bar");
  },

  installButton: function ce_easyscreenshot__installButton(buttonId,toolbarId) {
    toolbarId = toolbarId || "addon-bar";
    var key = "extensions.toolbarbutton.installed." + buttonId;
    if (Application.prefs.getValue(key, false))
      return;

    var toolbar = window.document.getElementById(toolbarId);
    let curSet = toolbar.currentSet;
    if (-1 == curSet.indexOf(buttonId)) {
      let newSet = curSet + "," + buttonId;
      toolbar.currentSet = newSet;
      toolbar.setAttribute("currentset", newSet);
      document.persist(toolbar.id, "currentset");
      try {
        BrowserToolboxCustomizeDone(true);
      } catch(e) {}
    }
    if (toolbar.getAttribute("collapsed") == "true") {
      toolbar.setAttribute("collapsed", "false");
    }
    document.persist(toolbar.id, "collapsed");
    Application.prefs.setValue(key, true);
  },

  getScreenShot: function() {
    function runProc(relPath,args) {
      try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(relPath);
        var process=Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
        process.init(file);
        process.runw(false, args, args.length);
      } catch(e) {
        alert(e);
      }
    }

    function printScreen() {
      var mainwin = document.getElementById("main-window");
      if (!mainwin.getAttribute("xmlns:html"))
        mainwin.setAttribute("xmlns:html", "http://www.w3.org/1999/xhtml");

      var content = window.content;
      if (content.document instanceof XULDocument) {
        var insideBrowser = content.document.querySelector('browser');
        content = insideBrowser ? insideBrowser.contentWindow : content;
      }
      var desth = content.innerHeight + content.scrollMaxY;
      var destw = content.innerWidth + content.scrollMaxX;

      // Unfortunately there is a limit:
      if (desth > 16384) desth = 16384;

      var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
      var ctx = canvas.getContext("2d");

      canvas.height = desth;
      canvas.width = destw;
      ctx.clearRect(0, 0, destw, desth);
      ctx.save();
      ctx.drawWindow(content, 0, 0, destw, desth, "rgb(255,255,255)");
      return canvas.toDataURL("image/png", "");
    }

    function iso8601FromDate(date, punctuation) {
      var string = date.getFullYear().toString();
      if (punctuation) {
        string += "-";
      }
      string += (date.getMonth() + 1).toString().replace(/\b(\d)\b/g, '0$1');
      if (punctuation) {
        string += "-";
      }
      string += date.getDate().toString().replace(/\b(\d)\b/g, '0$1');
      if (1 || date.time) {
        string += date.getHours().toString().replace(/\b(\d)\b/g, '0$1');
        if (punctuation) {
          string += ":";
        }
        string += date.getMinutes().toString().replace(/\b(\d)\b/g, '0$1');
        if (punctuation) {
          string += ":";
        }
        string += date.getSeconds().toString().replace(/\b(\d)\b/g, '0$1');
        if (date.getMilliseconds() > 0) {
          if (punctuation) {
            string += ".";
          }
          string += date.getMilliseconds().toString();
        }
      }
      return string;
    }
    var _stringBundle = document.getElementById("easyscreenshot-strings");
    var data = printScreen();
    var file = Components.classes["@mozilla.org/file/directory_service;1"]
                         .getService(Components.interfaces.nsIProperties)
                         .get("Desk", Components.interfaces.nsIFile);
    var filename = _stringBundle.getFormattedString("screentShotFile", [iso8601FromDate(new Date()) + ".png"]);
    file.append(filename);
    file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);

    var io = Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService);
    var source = io.newURI(data, "UTF8", null);
    var target = io.newFileURI(file)
    // prepare to save the canvas data
    var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                            .createInstance(Components.interfaces.nsIWebBrowserPersist);

    persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    persist.persistFlags |= Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
    // save the canvas data to the file
    persist.saveURI(source, null, null, null, null, file, null);
    if (Services.appinfo.OS == "WINNT") {
      var winDir = Components.classes["@mozilla.org/file/directory_service;1"].
        getService(Components.interfaces.nsIProperties).get("WinD", Components.interfaces.nsILocalFile);
      runProc(winDir.path + "\\system32\\mspaint.exe", [file.path]);
    } else if (Services.appinfo.OS == "Darwin") {
      runProc("/usr/bin/open", ['-a', 'Preview', file.path]);
    } else {
      var message = _stringBundle.getFormattedString("screentShotSaved", [file.path]);
      alert(message)
    }
  },
};

window.addEventListener("load", ceEasyScreenshot, false);
