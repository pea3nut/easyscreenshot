class App {
    constructor(el) {
        el = el instanceof Element ? el : document.querySelector(el);

        this.image  = document.createElement("img");
        this.canvas = document.createElement("canvas");
        this.el = el;

        this.el.appendChild(this.image);
        this.el.appendChild(this.canvas);


        this.ctx = this.canvas.getContext("2d");

        this.data = {
            startX: null,
            startY: null,
            endX: null,
            endY: null,
        };

        this.state_1 = null;// null|selecting|selected|resizing|moving
        this.state_2 = null;// null|resize-box|move-box

        this.onsuccess = function() {};
        this.onabort   = function() {};

    }
    cut() {
        var width = Math.abs(this.data.startX - this.data.endX);
        var height = Math.abs(this.data.startY - this.data.endY);
        var x = Math.min(this.data.startX, this.data.endX);
        var y = Math.min(this.data.startY, this.data.endY);

        var imgWidthZoom = this.image.width / this.image.naturalWidth;
        var imgHeightZoom = this.image.height / this.image.naturalHeight;

        var otherCanvas = document.createElement("canvas");
        otherCanvas.width = width;
        otherCanvas.height = height;
        var otherCtx = otherCanvas.getContext("2d");
        otherCtx.drawImage(
            this.image,
            x / imgWidthZoom, y / imgHeightZoom, width / imgWidthZoom, height / imgHeightZoom,
            0, 0, width, height
        );

        return {
            width, height,
            dataUrl: otherCanvas.toDataURL("png"),
        };
    }
    bindBoxResize() {
        const ResizeCursor = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"];
        var overPoint = null;// 鼠标驻留在的resize点
        this.canvas.addEventListener("mousemove", e => {
            if (this.state_1 !== "selected") return;
            this.state_2 = null;
            var nowX = e.layerX;
            var nowY = e.layerY;
            // 检测是否位于边框调整点上
            for (
                let point
                of
                App.borderPoint(
                    [this.data.startX, this.data.startY],
                    [this.data.endX, this.data.endY],
                )
                ) {
                let [x, y, type] = point;
                if (
                    Math.abs(nowX - x) < App.borderPointTriggerRadius
                    && Math.abs(nowY - y) < App.borderPointTriggerRadius
                ) {
                    this.state_2 = "resize-box";
                    overPoint = point;
                    document.body.style.cursor = ResizeCursor[type];
                    break;
                }
            }
            // 检测是否位于图像内部
            if (this.state_2 !== "resize-box") {
                if (this.state_2 === "move-box") { // 上次的收尾
                    this.state_2 = null;
                    document.body.style.cursor = null;
                }
                if (
                    nowX < Math.max(this.data.startX, this.data.endX)
                    && nowX > Math.min(this.data.startX, this.data.endX)
                    && nowY < Math.max(this.data.startY, this.data.endY)
                    && nowY > Math.min(this.data.startY, this.data.endY)
                ) {
                    this.state_2 = "move-box";
                    document.body.style.cursor = "move";
                }
            }
            if (this.state_2 === null) {
                document.body.style.cursor = null;
            }
        });
        this.canvas.addEventListener("mousedown", e => {
            if (this.state_2 !== "resize-box") return;

            var downX = e.layerX;
            var downY = e.layerY;
            var moveX = null;
            var moveY = null;

            var newBox = null;

            var moveListener = null;
            document.addEventListener("mousemove", moveListener = e => {
                this.state_1 = "resizing";
                moveX = e.layerX;
                moveY = e.layerY;
                newBox = App.getResizeComputedFunction(
                    overPoint, this.data, [moveX - downX, moveY - downY]
                );
                this.drawBox(
                    [newBox.startX, newBox.startY],
                    [newBox.endX, newBox.endY],
                );
            });
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", moveListener);
                if (this.state_1 !== "resizing") return;// 也就是说，根本没move
                this.state_1 = "selected";
                this.data = newBox;
            }, {once: true});

        });
    }
    bindBoxMove() {
        this.canvas.addEventListener("mousedown", e => {
            if (this.state_2 !== "move-box") return;

            var downX = e.layerX;
            var downY = e.layerY;
            var moveX = null;
            var moveY = null;

            var moveListener = null;
            document.addEventListener("mousemove", moveListener = e => {
                this.state_1 = "moving";
                moveX = e.layerX;
                moveY = e.layerY;
                this.drawBox(
                    [this.data.startX + (moveX - downX), this.data.startY + (moveY - downY)],
                    [this.data.endX + (moveX - downX), this.data.endY + (moveY - downY)]
                );
            });
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", moveListener);
                if (this.state_1 !== "moving") return;// 也就是说，根本没move
                this.state_1 = "selected";
                this.data.startX += (moveX - downX);
                this.data.startY += (moveY - downY);
                this.data.endX   += (moveX - downX);
                this.data.endY   += (moveY - downY);
            }, {once: true});

        });
    }
    bindBoxSelect() {
        var downX = null;
        var downY = null;
        var moveX = null;
        var moveY = null;

        this.canvas.addEventListener("mousedown", e => {
            if (this.state_2) return;

            downX = e.layerX;
            downY = e.layerY;

            var moveListener = null;
            document.addEventListener("mousemove", moveListener = e => {
                this.state_1 = "selecting";
                moveX = e.layerX;
                moveY = e.layerY;

                this.drawBox([downX, downY], [moveX, moveY]);

            });
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", moveListener);
                if (this.state_1 !== "selecting") return;// 也就是说，根本没move
                this.state_1 = "selected";
                this.data.startX = downX;
                this.data.startY = downY;
                this.data.endX   = moveX;
                this.data.endY   = moveY;
            }, {once: true});
        });
    }
    bindResolve() {
        this.canvas.addEventListener("dblclick", () => {
            if (this.state_1 !== "selected") return;
            this.onsuccess(this.data);
        });
        document.addEventListener("keypress", e => {
            if (e.keyCode === 13) { // Enter key
                if (this.state_1 !== "selected") return;
                this.onsuccess(this.data);
            } else if (e.keyCode === 27) { // Esc key
                this.onabort();
            }
        });
    }
    bindEvent() {
        this.bindBoxResize();
        this.bindBoxMove();
        this.bindBoxSelect();
        this.bindResolve();
    }
    drawBox([x1, y1], [x2, y2]) {
        this.fill();// 遮罩全部
        this.ctx.clearRect(x1, y1, x2 - x1, y2 - y1);// 清除部分遮罩，使其透明
        // 画边框附近的8个点
        for (let [x, y] of App.borderPoint([x1, y1], [x2, y2])) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, App.borderPointDrawRadius, 0, Math.PI * 4);
            this.ctx.fillStyle = App.borderPointColor;
            this.ctx.fill();
        }
    }
    init({width, height, imageSrc}) {
        width = width || this.canvas.clientWidth;
        height = height || this.canvas.clientHeight;
        this.canvas.width = width;
        this.canvas.height = height;
        this.image.width = width;
        this.image.height = height;
        this.image.src = imageSrc;
        this.fill();
        this.bindEvent();
    }
    fill(color) {
        this.ctx.clearRect(
            0, 0,
            this.canvas.width,
            this.canvas.height
        );
        this.ctx.fillStyle = color || App.fillColor;
        this.ctx.fillRect(
            0, 0,
            this.canvas.width,
            this.canvas.height
        );
    }
}

App.getResizeComputedFunction = function(point, box, [addX, addY]) {
    /*
        Start↘
            -0 -1 -2
            -3    +3
            +2 +1 +0
                   End

        End
            +0 +1 +2
            +3    -3
            -2 -1 -0
                  ↖Start
    */
    var [pointX, pointY, pointType] = point;
    var {startX, startY, endX, endY} = box;

    const GetDirectionFunctions = [
        function() {
 return (
            !(Math.abs(startX - pointX) < Math.abs(endX - pointX)) // X接近end为正方向
        )
},
        function() {
return (
            !(Math.abs(startY - pointY) < Math.abs(endY - pointY)) // Y接近end为正方向
        )
},
        function() {
 return (
            Math.abs(startX - pointX) < Math.abs(endX - pointX) // X接近end为反方向
        )
},
        function() {
 return (
            !(Math.abs(startX - pointX) < Math.abs(endX - pointX)) // X接近end为正方向
        )
},
    ];
    const ResizeFunctions = [
        function() {
            return direction
                ? {x: "endX", y: "endY"}
                : {x: "startX", y: "startY"}
                ;
        },
        function() {
            return direction
                ? {x: null, y: "endY"}
                : {x: null, y: "startY"}
                ;
        },
        function() {
            return direction
                ? {x: "startX", y: "endY"}
                : {x: "endX", y: "startY"}
                ;
        },
        function() {
            return direction
                ? {x: "endX", y: null}
                : {x: "startX", y: null}
                ;
        },
    ];

    /**
     * 方向，图解见函数头部
     * true表示正向，false表示反向
     * @type {Boolean}
     * */
    var direction = GetDirectionFunctions[pointType]();
    var {x, y} = ResizeFunctions[pointType]();

    box = JSON.parse(JSON.stringify(box));
    if (x)box[x] += addX;
    if (y)box[y] += addY;
    return box;
};
App.borderPointDrawRadius = 4;
App.borderPointTriggerRadius = 6;
App.borderPoint = function([x1, y1], [x2, y2]) {
    /*
        第三个数字表示点的类型，点类型分布如下
        0 1 2
        3   3
        2 1 0
    */
    return [
        [x1, y1, 0], [x2, y2, 0],
        [(x1 + x2) / 2, y1, 1], [(x1 + x2) / 2, y2, 1],
        [x1, y2, 2], [x2, y1, 2],
        [x1, (y1 + y2) / 2, 3], [x2, (y1 + y2) / 2, 3],
    ];
};
App.borderPointColor = "rgba(200,200,200,0.7)";
App.fillColor = "rgba(0,0,0,0.6)";
