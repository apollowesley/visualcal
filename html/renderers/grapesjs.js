"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
exports.__esModule = true;
var grapesjs_1 = __importDefault(require("grapesjs"));
var toastr_1 = __importDefault(require("toastr"));
var grapesjs_custom_code_1 = __importDefault(require("grapesjs-custom-code"));
var grapesjs_lory_slider_1 = __importDefault(require("grapesjs-lory-slider"));
var grapesjs_parser_postcss_1 = __importDefault(require("grapesjs-parser-postcss"));
var grapesjs_preset_webpage_1 = __importDefault(require("grapesjs-preset-webpage"));
var grapesjs_style_bg_1 = __importDefault(require("grapesjs-style-bg"));
var grapesjs_tabs_1 = __importDefault(require("grapesjs-tabs"));
var grapesjs_tooltip_1 = __importDefault(require("grapesjs-tooltip"));
var grapesjs_touch_1 = __importDefault(require("grapesjs-touch"));
var grapesjs_tui_image_editor_1 = __importDefault(require("grapesjs-tui-image-editor"));
var grapesjs_typed_1 = __importDefault(require("grapesjs-typed"));
// console.info(grapesjs);
// const editor = grapesjs.init({
//   container: '#gjs',
//   fromElement: true,
//   height: '300px',
//   width: 'auto',
//   storageManager: false,
//   panels: { defaults: [] }
// });
// editor.BlockManager.add('my-block-id', {
//   label: 'MyBlock',
//   category: 'MyCategory'
// });
var lp = './img/';
var plp = '//placehold.it/350x250/';
var images = [
    lp + 'team1.jpg', lp + 'team2.jpg', lp + 'team3.jpg', plp + '78c5d6/fff/image1.jpg', plp + '459ba8/fff/image2.jpg', plp + '79c267/fff/image3.jpg',
    plp + 'c5d647/fff/image4.jpg', plp + 'f28c33/fff/image5.jpg', plp + 'e868a2/fff/image6.jpg', plp + 'cc4360/fff/image7.jpg',
    lp + 'work-desk.jpg', lp + 'phone-app.png', lp + 'bg-gr-v.png'
];
var editor = grapesjs_1["default"].init({
    avoidInlineStyle: true,
    height: '100%',
    container: '#gjs',
    fromElement: true,
    showOffsets: true,
    assetManager: {
        embedAsBase64: true,
        assets: images
    },
    selectorManager: { componentFirst: true },
    styleManager: { clearProperties: true },
    plugins: [
        grapesjs_lory_slider_1["default"],
        grapesjs_tabs_1["default"],
        grapesjs_custom_code_1["default"],
        grapesjs_touch_1["default"],
        grapesjs_parser_postcss_1["default"],
        grapesjs_tooltip_1["default"],
        grapesjs_tui_image_editor_1["default"],
        grapesjs_typed_1["default"],
        grapesjs_style_bg_1["default"],
        grapesjs_preset_webpage_1["default"],
    ],
    pluginsOpts: (_a = {},
        _a[grapesjs_lory_slider_1["default"]] = {
            sliderBlock: {
                category: 'Extra'
            }
        },
        _a[grapesjs_tabs_1["default"]] = {
            tabsBlock: {
                category: 'Extra'
            }
        },
        _a[grapesjs_typed_1["default"]] = {
            block: {
                category: 'Extra',
                content: {
                    type: 'typed',
                    'type-speed': 40,
                    strings: [
                        'Text row one',
                        'Text row two',
                        'Text row three',
                    ]
                }
            }
        },
        _a['gjs-preset-webpage'] = {
            modalImportTitle: 'Import Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: function (editor) {
                return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
            },
            filestackOpts: null,
            aviaryOpts: false,
            blocksBasicOpts: { flexGrid: 1 },
            customStyleManager: [{
                    name: 'General',
                    buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
                    properties: [{
                            name: 'Alignment',
                            property: 'float',
                            type: 'radio',
                            defaults: 'none',
                            list: [
                                { value: 'none', className: 'fa fa-times' },
                                { value: 'left', className: 'fa fa-align-left' },
                                { value: 'right', className: 'fa fa-align-right' }
                            ]
                        },
                        { property: 'position', type: 'select' }
                    ]
                }, {
                    name: 'Dimension',
                    open: false,
                    buildProps: ['width', 'flex-width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
                    properties: [{
                            id: 'flex-width',
                            type: 'integer',
                            name: 'Width',
                            units: ['px', '%'],
                            property: 'flex-basis',
                            toRequire: 1
                        }, {
                            property: 'margin',
                            properties: [
                                { name: 'Top', property: 'margin-top' },
                                { name: 'Right', property: 'margin-right' },
                                { name: 'Bottom', property: 'margin-bottom' },
                                { name: 'Left', property: 'margin-left' }
                            ]
                        }, {
                            property: 'padding',
                            properties: [
                                { name: 'Top', property: 'padding-top' },
                                { name: 'Right', property: 'padding-right' },
                                { name: 'Bottom', property: 'padding-bottom' },
                                { name: 'Left', property: 'padding-left' }
                            ]
                        }]
                }, {
                    name: 'Typography',
                    open: false,
                    buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
                    properties: [
                        { name: 'Font', property: 'font-family' },
                        { name: 'Weight', property: 'font-weight' },
                        { name: 'Font color', property: 'color' },
                        {
                            property: 'text-align',
                            type: 'radio',
                            defaults: 'left',
                            list: [
                                { value: 'left', name: 'Left', className: 'fa fa-align-left' },
                                { value: 'center', name: 'Center', className: 'fa fa-align-center' },
                                { value: 'right', name: 'Right', className: 'fa fa-align-right' },
                                { value: 'justify', name: 'Justify', className: 'fa fa-align-justify' }
                            ]
                        }, {
                            property: 'text-decoration',
                            type: 'radio',
                            defaults: 'none',
                            list: [
                                { value: 'none', name: 'None', className: 'fa fa-times' },
                                { value: 'underline', name: 'underline', className: 'fa fa-underline' },
                                { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough' }
                            ]
                        }, {
                            property: 'text-shadow',
                            properties: [
                                { name: 'X position', property: 'text-shadow-h' },
                                { name: 'Y position', property: 'text-shadow-v' },
                                { name: 'Blur', property: 'text-shadow-blur' },
                                { name: 'Color', property: 'text-shadow-color' }
                            ]
                        }
                    ]
                }, {
                    name: 'Decorations',
                    open: false,
                    buildProps: ['opacity', 'border-radius', 'border', 'box-shadow', 'background-bg'],
                    properties: [{
                            type: 'slider',
                            property: 'opacity',
                            defaults: 1,
                            step: 0.01,
                            max: 1,
                            min: 0
                        }, {
                            property: 'border-radius',
                            properties: [
                                { name: 'Top', property: 'border-top-left-radius' },
                                { name: 'Right', property: 'border-top-right-radius' },
                                { name: 'Bottom', property: 'border-bottom-left-radius' },
                                { name: 'Left', property: 'border-bottom-right-radius' }
                            ]
                        }, {
                            property: 'box-shadow',
                            properties: [
                                { name: 'X position', property: 'box-shadow-h' },
                                { name: 'Y position', property: 'box-shadow-v' },
                                { name: 'Blur', property: 'box-shadow-blur' },
                                { name: 'Spread', property: 'box-shadow-spread' },
                                { name: 'Color', property: 'box-shadow-color' },
                                { name: 'Shadow type', property: 'box-shadow-type' }
                            ]
                        }, {
                            id: 'background-bg',
                            property: 'background',
                            type: 'bg'
                        },]
                }, {
                    name: 'Extra',
                    open: false,
                    buildProps: ['transition', 'perspective', 'transform'],
                    properties: [{
                            property: 'transition',
                            properties: [
                                { name: 'Property', property: 'transition-property' },
                                { name: 'Duration', property: 'transition-duration' },
                                { name: 'Easing', property: 'transition-timing-function' }
                            ]
                        }, {
                            property: 'transform',
                            properties: [
                                { name: 'Rotate X', property: 'transform-rotate-x' },
                                { name: 'Rotate Y', property: 'transform-rotate-y' },
                                { name: 'Rotate Z', property: 'transform-rotate-z' },
                                { name: 'Scale X', property: 'transform-scale-x' },
                                { name: 'Scale Y', property: 'transform-scale-y' },
                                { name: 'Scale Z', property: 'transform-scale-z' }
                            ]
                        }]
                }, {
                    name: 'Flex',
                    open: false,
                    properties: [{
                            name: 'Flex Container',
                            property: 'display',
                            type: 'select',
                            defaults: 'block',
                            list: [
                                { value: 'block', name: 'Disable' },
                                { value: 'flex', name: 'Enable' }
                            ]
                        }, {
                            name: 'Flex Parent',
                            property: 'label-parent-flex',
                            type: 'integer'
                        }, {
                            name: 'Direction',
                            property: 'flex-direction',
                            type: 'radio',
                            defaults: 'row',
                            list: [{
                                    value: 'row',
                                    name: 'Row',
                                    className: 'icons-flex icon-dir-row',
                                    title: 'Row'
                                }, {
                                    value: 'row-reverse',
                                    name: 'Row reverse',
                                    className: 'icons-flex icon-dir-row-rev',
                                    title: 'Row reverse'
                                }, {
                                    value: 'column',
                                    name: 'Column',
                                    title: 'Column',
                                    className: 'icons-flex icon-dir-col'
                                }, {
                                    value: 'column-reverse',
                                    name: 'Column reverse',
                                    title: 'Column reverse',
                                    className: 'icons-flex icon-dir-col-rev'
                                }]
                        }, {
                            name: 'Justify',
                            property: 'justify-content',
                            type: 'radio',
                            defaults: 'flex-start',
                            list: [{
                                    value: 'flex-start',
                                    className: 'icons-flex icon-just-start',
                                    title: 'Start'
                                }, {
                                    value: 'flex-end',
                                    title: 'End',
                                    className: 'icons-flex icon-just-end'
                                }, {
                                    value: 'space-between',
                                    title: 'Space between',
                                    className: 'icons-flex icon-just-sp-bet'
                                }, {
                                    value: 'space-around',
                                    title: 'Space around',
                                    className: 'icons-flex icon-just-sp-ar'
                                }, {
                                    value: 'center',
                                    title: 'Center',
                                    className: 'icons-flex icon-just-sp-cent'
                                }]
                        }, {
                            name: 'Align',
                            property: 'align-items',
                            type: 'radio',
                            defaults: 'center',
                            list: [{
                                    value: 'flex-start',
                                    title: 'Start',
                                    className: 'icons-flex icon-al-start'
                                }, {
                                    value: 'flex-end',
                                    title: 'End',
                                    className: 'icons-flex icon-al-end'
                                }, {
                                    value: 'stretch',
                                    title: 'Stretch',
                                    className: 'icons-flex icon-al-str'
                                }, {
                                    value: 'center',
                                    title: 'Center',
                                    className: 'icons-flex icon-al-center'
                                }]
                        }, {
                            name: 'Flex Children',
                            property: 'label-parent-flex',
                            type: 'integer'
                        }, {
                            name: 'Order',
                            property: 'order',
                            type: 'integer',
                            defaults: 0,
                            min: 0
                        }, {
                            name: 'Flex',
                            property: 'flex',
                            type: 'composite',
                            properties: [{
                                    name: 'Grow',
                                    property: 'flex-grow',
                                    type: 'integer',
                                    defaults: 0,
                                    min: 0
                                }, {
                                    name: 'Shrink',
                                    property: 'flex-shrink',
                                    type: 'integer',
                                    defaults: 0,
                                    min: 0
                                }, {
                                    name: 'Basis',
                                    property: 'flex-basis',
                                    type: 'integer',
                                    units: ['px', '%', ''],
                                    unit: '',
                                    defaults: 'auto'
                                }]
                        }, {
                            name: 'Align',
                            property: 'align-self',
                            type: 'radio',
                            defaults: 'auto',
                            list: [{
                                    value: 'auto',
                                    name: 'Auto'
                                }, {
                                    value: 'flex-start',
                                    title: 'Start',
                                    className: 'icons-flex icon-al-start'
                                }, {
                                    value: 'flex-end',
                                    title: 'End',
                                    className: 'icons-flex icon-al-end'
                                }, {
                                    value: 'stretch',
                                    title: 'Stretch',
                                    className: 'icons-flex icon-al-str'
                                }, {
                                    value: 'center',
                                    title: 'Center',
                                    className: 'icons-flex icon-al-center'
                                }]
                        }]
                }
            ]
        },
        _a)
});
editor.I18n.addMessages({
    en: {
        styleManager: {
            properties: {
                'background-repeat': 'Repeat',
                'background-position': 'Position',
                'background-attachment': 'Attachment',
                'background-size': 'Size'
            }
        }
    }
});
var pn = editor.Panels;
var modal = editor.Modal;
var cmdm = editor.Commands;
cmdm.add('canvas-clear', function () {
    if (confirm('Areeee you sure to clean the canvas?')) {
        // const comps = editor.DomComponents.clear();
        setTimeout(function () { localStorage.clear(); }, 0);
    }
});
cmdm.add('set-device-desktop', {
    run: function (ed) { ed.setDevice('Desktop'); },
    stop: function () { }
});
cmdm.add('set-device-tablet', {
    run: function (ed) { ed.setDevice('Tablet'); },
    stop: function () { }
});
cmdm.add('set-device-mobile', {
    run: function (ed) { ed.setDevice('Mobile portrait'); },
    stop: function () { }
});
// Add info command
var mdlClass = 'gjs-mdl-dialog-sm';
var infoContainer = document.getElementById('info-panel');
cmdm.add('open-info', function () {
    var mdlDialog = document.querySelector('.gjs-mdl-dialog');
    if (mdlDialog)
        mdlDialog.className += ' ' + mdlClass;
    if (infoContainer)
        infoContainer.style.display = 'block';
    modal.setTitle('About this demo');
    modal.setContent(infoContainer);
    modal.open();
    modal.getModel().once('change:open', function () {
        if (mdlDialog)
            mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
    });
});
pn.addButton('options', {
    id: 'open-info',
    className: 'fa fa-question-circle',
    command: function () { editor.runCommand('open-info'); },
    attributes: {
        'title': 'About',
        'data-tooltip-pos': 'bottom'
    }
});
// Simple warn notifier
var origWarn = console.warn;
toastr_1["default"].options = {
    closeButton: true,
    preventDuplicates: true,
    showDuration: 250,
    hideDuration: 150
};
console.warn = function (msg) {
    if (msg.indexOf('[undefined]') == -1) {
        toastr_1["default"].warning(msg);
    }
    origWarn(msg);
};
// Add and beautify tooltips
[['sw-visibility', 'Show Borders'], ['preview', 'Preview'], ['fullscreen', 'Fullscreen'],
    ['export-template', 'Export'], ['undo', 'Undo'], ['redo', 'Redo'],
    ['gjs-open-import-webpage', 'Import'], ['canvas-clear', 'Clear canvas']]
    .forEach(function (item) {
    pn.getButton('options', item[0]).set('attributes', { title: item[1], 'data-tooltip-pos': 'bottom' });
});
[['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']]
    .forEach(function (item) {
    pn.getButton('views', item[0]).set('attributes', { title: item[1], 'data-tooltip-pos': 'bottom' });
});
var titles = document.querySelectorAll('*[title]');
for (var i = 0; i < titles.length; i++) {
    var el = titles[i];
    var title = el.getAttribute('title');
    title = title ? title.trim() : '';
    if (!title)
        break;
    el.setAttribute('data-tooltip', title);
    el.setAttribute('title', '');
}
// Show borders by default
pn.getButton('options', 'sw-visibility').set('active', 1);
// Store and load events
editor.on('storage:load', function (e) { console.log('Loaded ', e); });
editor.on('storage:store', function (e) { console.log('Stored ', e); });
// Do stuff on load
editor.on('load', function () {
    var $ = grapesjs_1["default"].$;
    // Show logo with the version
    var logoCont = document.querySelector('.gjs-logo-cont');
    var gjsLogoVesionElement = document.querySelector('.gjs-logo-version');
    if (gjsLogoVesionElement)
        gjsLogoVesionElement.innerHTML = 'v' + grapesjs_1["default"].version;
    var logoPanel = document.querySelector('.gjs-pn-commands');
    if (logoPanel && logoCont)
        logoPanel.appendChild(logoCont);
    // Load and show settings and style manager
    var openTmBtn = pn.getButton('views', 'open-tm');
    openTmBtn && openTmBtn.set('active', 1);
    var openSm = pn.getButton('views', 'open-sm');
    openSm && openSm.set('active', 1);
    // Add Settings Sector
    var traitsSector = $('<div class="gjs-sm-sector no-select">' +
        '<div class="gjs-sm-title"><span class="icon-settings fa fa-cog"></span> Settings</div>' +
        '<div class="gjs-sm-properties" style="display: none;"></div></div>');
    var traitsProps = traitsSector.find('.gjs-sm-properties');
    traitsProps.append($('.gjs-trt-traits'));
    $('.gjs-sm-sectors').before(traitsSector);
    traitsSector.find('.gjs-sm-title').on('click', function () {
        var traitStyle = traitsProps.get(0).style;
        var hidden = traitStyle.display == 'none';
        if (hidden) {
            traitStyle.display = 'block';
        }
        else {
            traitStyle.display = 'none';
        }
    });
    // Open block manager
    var openBlocksBtn = editor.Panels.getButton('views', 'open-blocks');
    openBlocksBtn && openBlocksBtn.set('active', 1);
    // Move Ad
    $('#gjs').append($('.ad-cont'));
});
//# sourceMappingURL=grapesjs.js.map