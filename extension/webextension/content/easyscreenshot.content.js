/* global PrintScreen, Selector */

Chaz.init("page.content");

const Background = new Chaz("background");
const iFrame = new Chaz("iframe.content");

// response image for background script's needs
Background.on("entire", PrintScreen.entire);
Background.on("visible", PrintScreen.visible);

// open image in selector, let user check
Background.on("select", Selector.load);

// let background script know, content script loaded
Background.send("loaded");
