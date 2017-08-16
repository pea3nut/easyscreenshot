/* global Background, iFrame */

class Selector {
    static async load({image_info}, sender) {
        var {unload} = await Selector.createModel();
        var result = await iFrame.send("init", {image_info});
        unload();
        return result;
    }
}
Selector.createModel = async function() {
    // 创建节点
    var elt = document.createElement("div");
    elt.style.zIndex = "134217720";
    elt.style.width = "100%";
    elt.style.overflow = "hidden";
    elt.style.position = "absolute";
    elt.style.top = 0;
    elt.style.left = 0;
    elt.style.height = document.body.clientHeight + "px";

    var iframe = document.createElement("iframe");
    iframe.src = browser.extension.getURL("/selector/selector.html");
    iframe.style.border = "none";
    iframe.style.width  = "100%";
    iframe.style.height = "100%";

    elt.appendChild(iframe);
    document.body.appendChild(elt);
    // 闭包缓存
    Selector.createModel = async function() {
        document.body.appendChild(elt);
        await iFrame.wait("loaded");
        return {
            elt,
            getWindow() {
                return iframe.contentWindow;
            },
            unload() {
                document.body.removeChild(elt);
            }
        };
    };
    return Selector.createModel.apply(this, arguments);
};
