/* global PrintScreen, Selector */

Chaz.init("page.content");

const Background = new Chaz("background");
const iFrame = new Chaz("iframe.content");

// 根据background script的需要，返回2种不同截图
Background.on("entire", PrintScreen.entire);
Background.on("visible", PrintScreen.visible);

// background script返回图片，用selector打开让用户选择
Background.on("select", Selector.load);

// 告诉background script自己载入完毕
Background.send("loaded");
