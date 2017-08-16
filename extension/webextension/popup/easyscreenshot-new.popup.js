Chaz.init("popup.privileged");
const Background = new Chaz("background");
const Action = {
    select() {
        Background.send("select");
    },
    entire() {
        Background.send("entire");
    },
    visible() {
        Background.send("visible");
    },
    feedback() {
        Background.send("open", {
            url: browser.i18n.getMessage("feedbackUrl"),
        });
    },
};

document.getElementById("run-screenshot").addEventListener("click", function(e) {
    var elt = e.target;
    while (elt && !(elt.dataset && elt.dataset.screenshot)) {
        elt = elt.parentNode;
    }
    if (!elt) return;
    if (!Action[elt.dataset.screenshot]) {
        throw new Error(`${elt.dataset.screenshot} is not in Action`);
    }
    Action[elt.dataset.screenshot]();
    window.close();
});

// 渲染多语言支持菜单
Array.from(
    document.querySelectorAll("[chaz-i18n]")
).forEach(elt => elt.textContent = browser.i18n.getMessage(elt.getAttribute("chaz-i18n")));
