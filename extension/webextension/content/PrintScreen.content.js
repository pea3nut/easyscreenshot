/**
 * 获取屏幕快照
 * */
class PrintScreen {
    /* !整个网页*/
    static entire() {
        return PrintScreen.printEntire();
    }
    /* !可视区域*/
    static visible() {
        return PrintScreen.printEntire(window.innerWidth, window.innerHeight);
    }
}
/**
 * 取得屏幕快照，默认获取整个网页
 * @param {number} width
 * @param {number} height
 * */
PrintScreen.printEntire = function(
    width = Math.max(document.documentElement.scrollWidth, window.innerWidth),
    height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
) {

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.drawWindow(
        window,
        0, 0,
        width,
        height,
        "rgba(0,0,0,0)"
    );
    return {
        width: document.body.clientWidth,
        height: document.body.clientHeight,
        dataUrl: canvas.toDataURL(),
    };
};
