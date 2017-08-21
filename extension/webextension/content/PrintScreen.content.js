/**
 * get screen shot
 * */
class PrintScreen {
    /** capture entire*/
    static entire() {
        return PrintScreen.printScreen();
    }
    /** capture visible*/
    static visible() {
        return PrintScreen.printScreen(window.innerWidth, window.innerHeight);
    }
    /**
     * get capture image
     * the entire page by default
     * @private
     * @param {number} width
     * @param {number} height
     * */
    static printScreen(
        width = Math.max(document.documentElement.scrollWidth, window.innerWidth),
        height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
    ) {
        width *= window.devicePixelRatio;
        height *= window.devicePixelRatio;

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        if (window.devicePixelRatio !== 1) {
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        ctx.drawWindow(
            window,
            0, 0,
            width,
            height,
            "rgba(0,0,0,0)"
        );
        return {
            width,
            height,
            dataUrl: canvas.toDataURL(),
        };
    }

}
