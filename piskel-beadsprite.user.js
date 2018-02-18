// ==UserScript==
// @name         Piskel Beadsprite Export
// @namespace    https://github.com/sopelt
// @version      1.0.5
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
    // var includeAllFrames = $('#beadspriteExportIncludeAllFrames').is(":checked");
    var includeColorCount = $('#beadspriteExportIncludeColorCount').is(":checked");
    var flipMirror = $('#beadspriteExportFlipMirror').is(":checked");

    var frameIndex = pskl.app.piskelController.getCurrentFrameIndex();
    var frameCount = pskl.app.piskelController.getFrameCount();
    var name = $('span.piskel-name')[0].textContent;
    var fileName = `${name}.pdf`;
    if (frameCount > 1) {
        fileName = `${name}.${frameIndex}.pdf`;
    }

    var mergedImage = pskl.app.piskelController.renderFrameAt(frameIndex, true);
    var mergedFrame = pskl.utils.FrameUtils.createFromImage(mergedImage);

    if (flipMirror) {
        pskl.tools.transform.TransformUtils.flip(mergedFrame, pskl.tools.transform.TransformUtils.VERTICAL);
    }

    var doc = new jsPDF();

    if (frameCount > 1) {
        doc.text(`${name} ${frameIndex}`, 15, 15);
    } else {
        doc.text(name, 15, 15);
    }

    var d = 5;
    var offsetX = 25;
    var offsetY = 35;
    var pegR = 0.5;
    var pearlR = 1.5;

    doc.setDrawColor(220);
    doc.setFillColor(220);

    var margin = 10;
    var borderWidth = (mergedFrame.width - 1) * d + 2 * margin;
    var borderHeight = (mergedFrame.height - 1) * d + 2 * margin;

    doc.lines([[borderWidth, 0], [0, borderHeight], [-borderWidth, 0], [0, -borderHeight]], offsetX - margin, offsetY - margin);

    for (var i = 0; i < mergedFrame.width; i++)
    for (var j = 0; j < mergedFrame.height; j++)
    {
        doc.circle(offsetX + i * d, offsetY + j * d, pegR, 'F');
    }

    for (var k = 0; k < mergedFrame.width; k++)
    for (var l = 0; l < mergedFrame.height; l++)
    {
        var pixel = mergedFrame.getPixel(k, l);
        if (pixel) {
            doc.setLineWidth(0.8);
            var r = pixel & 0xff;
            var g = pixel >> 8 & 0xff;
            var b = pixel >> 16 & 0xff;
            doc.setDrawColor(r, g, b);
            doc.circle(offsetX + k * d, offsetY + l * d, pearlR, 'S');

            doc.setDrawColor(230);
            doc.setLineWidth(0.1);
            doc.circle(offsetX + k * d, offsetY + l * d, pearlR + 0.35, 'S');

            doc.circle(offsetX + k * d, offsetY + l * d, pearlR - 0.35, 'S');
        }
    }

    if (includeColorCount) {
        doc.addPage();
        var offset = 15; //offsetX + mergedFrame.height * d + 3 * margin;
        doc.text("Colors", 15, offset);

        var count = {};
        for (var px of mergedFrame.pixels) {
            if (px === 0) {
              continue;
            } else if (count[px]) {
                count[px]++;
            } else {
                count[px] = 1;
            }
        }

        var currentColors = window.pskl.app.currentColorsService.getCurrentColors();
        for (var c in count) {
            count[window.pskl.utils.intToHex(c)] = count[c];
        }

        doc.setFontSize(11);
        var n = 0;
        for (var c in currentColors) {
            doc.text(`${currentColors[c]}: ${count[currentColors[c]]}`, 15, offset + 15 + 10 * n);
            n++;
        }
    }

    doc.save(fileName);
}

function beadspriteSetupUI() {
    var panel = $('div.export-panel-misc');
    var section = `
<div class="export-panel-section" style="padding-bottom: 5px">
    <span class="highlight">Export as beadsprite PDF: </span>

    <!--<div class="checkbox-container" style="margin: 5px 0;">
        <input id="beadspriteExportIncludeAllFrames" class="zip-split-layers-checkbox checkbox-fix" type="checkbox">
        <label for="beadspriteExportIncludeAllFrames">Export all frames</label>
    </div>-->

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
