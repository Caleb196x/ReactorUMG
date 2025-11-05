"use strict";
exports.__esModule = true;
exports.parseFlexVerticalAlignmentActions = exports.parseFlexHorizontalAlignmentActions = exports.parseWidgetSelfAlignment = void 0;
var UE = require("ue");
var css_margin_parser_1 = require("./css_margin_parser");
function parseWidgetSelfAlignment(style) {
    var _a;
    var alignment = {
        horizontal: UE.EHorizontalAlignment.HAlign_Fill,
        vertical: UE.EVerticalAlignment.VAlign_Fill,
        padding: new UE.Margin(0, 0, 0, 0)
    };
    var flexDirection = (_a = style === null || style === void 0 ? void 0 : style.flexDirection) !== null && _a !== void 0 ? _a : 'row';
    var justifySelf = style === null || style === void 0 ? void 0 : style.justifySelf;
    if (justifySelf) {
        switch (justifySelf) {
            case 'start':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Left;
                break;
            case 'end':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Right;
                break;
            case 'center':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Center;
                break;
            case 'stretch':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Fill;
                break;
            case 'left':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Left;
                break;
            case 'right':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Right;
                break;
            default:
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Center;
                break;
        }
    }
    var padding = (0, css_margin_parser_1.convertPadding)(style);
    if (padding) {
        alignment.padding = padding;
    }
    var alignSelf = style === null || style === void 0 ? void 0 : style.alignSelf;
    if (!alignSelf)
        return alignment;
    if (flexDirection === 'row') {
        switch (alignSelf) {
            case 'start':
                alignment.vertical = UE.EVerticalAlignment.VAlign_Top;
                break;
            case 'end':
                alignment.vertical = UE.EVerticalAlignment.VAlign_Bottom;
                break;
            case 'center':
                alignment.vertical = UE.EVerticalAlignment.VAlign_Center;
                break;
            case 'stretch':
                alignment.vertical = UE.EVerticalAlignment.VAlign_Fill;
                break;
            case 'top':
                alignment.vertical = UE.EVerticalAlignment.VAlign_Top;
                break;
            case 'bottom':
                alignment.vertical = UE.EVerticalAlignment.VAlign_Bottom;
                break;
            default:
                alignment.vertical = UE.EVerticalAlignment.VAlign_Center;
                break;
        }
    }
    else {
        switch (alignSelf) {
            case 'start':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Left;
                break;
            case 'end':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Right;
                break;
            case 'center':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Center;
                break;
            case 'stretch':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Fill;
                break;
            case 'left':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Left;
                break;
            case 'right':
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Right;
                break;
            default:
                alignment.horizontal = UE.EHorizontalAlignment.HAlign_Center;
                break;
        }
    }
    return alignment;
}
exports.parseWidgetSelfAlignment = parseWidgetSelfAlignment;
function parseFlexHorizontalAlignmentActions() {
    return {
        justifySelf: {
            'flex-start': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            },
            'flex-end': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            },
            'left': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            },
            'right': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            },
            'start': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            },
            'end': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            },
            'center': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center);
            },
            'stretch': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill);
            }
        },
        alignSelf: {
            'stretch': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill);
            },
            'center': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center);
            },
            'flex-start': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
            },
            'flex-end': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
            },
            'start': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
            },
            'end': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
            },
            'top': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
            },
            'bottom': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
            }
        },
        spaceBetween: function (slot, flex) {
            return slot.SetSize(new UE.SlateChildSize(flex, UE.ESlateSizeRule.Fill));
        }
    };
}
exports.parseFlexHorizontalAlignmentActions = parseFlexHorizontalAlignmentActions;
function parseFlexVerticalAlignmentActions() {
    return {
        justifySelf: {
            'flex-start': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
            },
            'flex-end': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
            },
            'start': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
            },
            'end': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
            },
            'left': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
            },
            'right': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
            },
            'center': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center);
            },
            'stretch': function (slot) {
                return slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill);
            }
        },
        alignSelf: {
            'stretch': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill);
            },
            'center': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center);
            },
            'flex-start': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            },
            'flex-end': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            },
            'start': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            },
            'end': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            },
            'top': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            },
            'bottom': function (slot) {
                return slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            }
        },
        spaceBetween: function (slot, flex) {
            return slot.SetSize(new UE.SlateChildSize(flex, UE.ESlateSizeRule.Fill));
        }
    };
}
exports.parseFlexVerticalAlignmentActions = parseFlexVerticalAlignmentActions;
