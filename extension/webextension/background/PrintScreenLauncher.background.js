/* global Content, Editor */

/* !截图启动器*/
class PrintScreenLauncher {
    static async select() {
        var activeTabId = await Chaz.Utility.getActivatedTabId();
        var imgInfo = await Content.send("entire", null, activeTabId);
        var result = await Content.send("select", {image_info: imgInfo}, activeTabId);
        if (result.type === "ok") {
            await PrintScreenLauncher.openEditor(result);
        }
    }
    static async entire() {
        var activeTabId = await Chaz.Utility.getActivatedTabId();
        var imgInfo = await Content.send("entire", null, activeTabId);
        await PrintScreenLauncher.openEditor(imgInfo);
    }
    static async visible() {
        var activeTabId = await Chaz.Utility.getActivatedTabId();
        var imgInfo = await Content.send("visible", null, activeTabId);
        await PrintScreenLauncher.openEditor(imgInfo);
    }
}
PrintScreenLauncher.openEditor = async function(imgInf) {
    await browser.tabs.create({
        url: browser.extension.getURL("editor/editor.html"),
        active: true,
    });
    Editor.one("fetch", () => imgInf);
};
