// ==UserScript==
// @name         Piskel Beadsprite Export
// @namespace    https://github.com/sopelt
// @version      1.0.1
// @description  Add an export option for beadsprite use-cases.
// @author       Simon Opelt
// @license      MIT
// @copyright    2018, Simon Opelt
// @homepageURL  https://github.com/sopelt/piskel-beadsprite
// @match        https://www.piskelapp.com/p/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.min.js#sha256=YHd/E8OX5o5GcqyHHas3xH3i7aP8z8KmMrL3WLMJfIY=
// @grant        none
// ==/UserScript==

var beadspriteSetupInterval = setInterval(beadspriteSetup, 200);

function beadspriteSetup() {
    if (window.pskl &&
        window.pskl.controller &&
        window.pskl.controller.settings &&
        window.pskl.controller.settings.exportimage &&
        window.pskl.controller.settings.exportimage.MiscExportController &&
        window.pskl.controller.settings.exportimage.MiscExportController.prototype) {

        clearInterval(beadspriteSetupInterval);
        var miscProto = window.pskl.controller.settings.exportimage.MiscExportController.prototype;
        var bkpInit = miscProto.init;
        miscProto.init = function () {
            bkpInit.apply(this, arguments);
            $.publish("MISC-PANEL-INITIALIZED");
        };
    }
}
