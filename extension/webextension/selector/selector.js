/* global App */

~async function() {
    await Chaz.init("iframe.content");
    const Content = new Chaz("page.content");
    Content.send("loaded");

    Content.on("init", function({image_info: data}, sender) {
        var app = new App("#app");
        app.init({
            width: data.width,
            height: data.height,
            imageSrc: data.dataUrl,
        });
        return new Promise(function(resolve, reject) {
            app.onsuccess = function() {
                resolve({
                    type: "ok",
                    ...this.cut()
                });
            };
            app.onabort = function() {
                resolve({
                    type: "abort",
                });
            };
        });
    });
}();
