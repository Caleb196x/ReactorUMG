"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ViewportConverter = void 0;
var UE = require("ue");
var umg_converter_1 = require("../umg_converter");
var ViewportConverter = /** @class */ (function (_super) {
    __extends(ViewportConverter, _super);
    function ViewportConverter(typeName, props, outer) {
        return _super.call(this, typeName, props, outer) || this;
    }
    ViewportConverter.prototype.createNativeWidget = function () {
        var viewport = new UE.Viewport(this.outer);
        return viewport;
    };
    ViewportConverter.prototype.update = function (widget, oldProps, changedProps) {
        var viewport = widget;
        UE.UMGManager.SynchronizeWidgetProperties(viewport);
    };
    return ViewportConverter;
}(umg_converter_1.UMGConverter));
exports.ViewportConverter = ViewportConverter;
