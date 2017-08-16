/* global PrintScreenLauncher */

Chaz.init("background");

const Content = new Chaz("page.content");
const Popup   = new Chaz("popup.privileged");
const Editor  = new Chaz("editor.content");

Popup.on("select", PrintScreenLauncher.select);
Popup.on("entire", PrintScreenLauncher.entire);
Popup.on("visible", PrintScreenLauncher.visible);

Popup.on("open", function(data) {
    browser.tabs.create(data);
});


// 当收到content script发送的loaded事件才enable按钮
// 因此当扩展进入没有content script存在的页面时，按钮将不会被启用
// 比如：about:blank addons.mozilla.org
browser.tabs.onCreated.addListener(function(tab) {
    browser.browserAction.disable(tab.id);
});
browser.tabs.onUpdated.addListener(async function(tabId, info) {
    if (info.status === "loading") {
        browser.browserAction.disable(tabId);
        await Content.wait("loaded", (data, sender) => sender.tab.id === tabId);
        browser.browserAction.enable(tabId);
    }
});
