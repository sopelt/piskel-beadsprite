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

function beadspriteExport() {
    var includeAllFrames = $('#beadspriteExportIncludeAllFrames').is(":checked");
    var includeColorCount = $('#beadspriteExportIncludeColorCount').is(":checked");
    var flipMirror = $('#beadspriteExportFlipMirror').is(":checked");
}

function beadspriteSetupUI() {
    var panel = $('div.export-panel-misc');
    var section = `
<div class="export-panel-section" style="padding-bottom: 5px">
    <span class="highlight">Export as beadsprite PDF: </span>

    <div class="checkbox-container" style="margin: 5px 0;">
        <input id="beadspriteExportIncludeAllFrames" class="zip-split-layers-checkbox checkbox-fix" type="checkbox">
        <label for="beadspriteExportIncludeAllFrames">Export all frames</label>
    </div>

    <div class="checkbox-container" style="margin: 5px 0;">
        <input id="beadspriteExportIncludeColorCount" class="zip-split-layers-checkbox checkbox-fix" type="checkbox">
        <label for="beadspriteExportIncludeColorCount">Include color count</label>
    </div>

    <div class="checkbox-container" style="margin: 5px 0;">
        <input id="beadspriteExportFlipMirror" class="zip-split-layers-checkbox checkbox-fix" type="checkbox">
        <label for="beadspriteExportFlipMirror">Mirror/flip</label>
    </div>

    <button type="button" class="button button-primary selected-frame-download-button" id="beadspritePDFExport">Download</button>
</div>`;

    panel.append($.parseHTML(section));

    $('#beadspritePDFExport').on("click", beadspriteExport);
}


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

		$.subscribe("MISC-PANEL-INITIALIZED", beadspriteSetupUI);
    }
}
