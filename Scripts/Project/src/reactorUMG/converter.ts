import * as UE from 'ue';
import { findChangedProps, isEmpty, isKeyOfRecord, safeParseFloat } from './misc/utils';
import { getAllStyles } from './parsers/cssstyle_parser';
import { parseCursor, parseTransform, parseTransformPivot, parseTranslate, parseVisibility } from './parsers/common_props_parser';
import * as puerts from 'puerts';
export abstract class ElementConverter {
    typeName: string;
    props: any;
    outer: any;
    readonly PropMaps : Record<string, string>
    readonly translators: Record<string, (styles: any, changeProps: any)=>any>

    constructor(typeName: string, props: any, outer: any) {
        this.typeName = typeName;
        this.props = props;
        this.outer = outer;

        
        this.PropMaps = {
            "Cursor": "cursor",
            "RenderTransform": "transform",
            "RenderTransformPivot": "transformOrigin",
            "Translate": "translate",
            "RenderOpacity": "opacity",
            "Visibility": "visibility",
            "ToolTipText": "toolTip",
            "bIsEnabled": "disable",
            "bIsVolatile": "volatil",
            "PixelSnapping": "pixelSnapping",
            "bIsEnabledDelegate": "disableBinding",
            "ToolTipTextDelegate": "toolTipBinding",
            "VisibilityDelegate": "visibilityBinding",
        }

        this.translators = {
            "Cursor": (styles: any, changeProps: any) => {return parseCursor(styles?.cursor)},
            "RenderTransform": (styles: any, changeProps: any) => {return parseTransform(styles?.transform)},
            "RenderTransformPivot": (styles: any, changeProps: any) => {return parseTransformPivot(styles?.transformOrigin)},
            "Translate": (styles: any, changeProps: any) => {return parseTranslate(styles?.translate)},
            "RenderOpacity": (styles: any, changeProps: any) => {
                if (styles && styles.opacity !== undefined && styles.opacity !== null) {
                    return safeParseFloat(styles.opacity);
                }
                if (isKeyOfRecord("opacity", changeProps)) {
                    return safeParseFloat(changeProps.opacity);
                }
                return null;
            },
            "Visibility": (styles: any, changeProps: any) => {return parseVisibility(styles?.visible || styles?.visibility, changeProps?.hitTest)},
            "ToolTipText": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("toolTip", changeProps)) {
                    return changeProps.toolTip ?? "";
                }
                if (changeProps && isKeyOfRecord("title", changeProps)) {
                    return changeProps.title ?? "";
                }
                return null;
            },
            "bIsEnabled": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("disable", changeProps)) {
                    return changeProps.disable ? false : true;
                }
                return null;
            },
            "bIsVolatile": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("volatil", changeProps)) {
                    return !!changeProps.volatil;
                }
                return null;
            },
            "PixelSnapping": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("pixelSnapping", changeProps)) {
                    return changeProps.pixelSnapping ? UE.EWidgetPixelSnapping.SnapToPixel : UE.EWidgetPixelSnapping.Disabled;
                }
                return null;
            },
            "bIsEnabledDelegate": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("disableBinding", changeProps) && changeProps.disableBinding) {
                    return () => {return !changeProps.disableBinding();};
                }
                return null;
            },
            "ToolTipTextDelegate": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("toolTipBinding", changeProps)) {
                    return changeProps.toolTipBinding ?? null;
                }
                if (changeProps && isKeyOfRecord("titleBinding", changeProps)) {
                    return changeProps.titleBinding ?? null;
                }
                return null;
            },
            "VisibilityDelegate": (_styles: any, changeProps: any) => {
                if (changeProps && isKeyOfRecord("visibilityBinding", changeProps) && changeProps.visibilityBinding) {
                    return () => {return parseVisibility(changeProps.visibilityBinding());};
                }
                return null;
            },
        }
    }

    abstract createNativeWidget(): UE.Widget;
    abstract update(widget: UE.Widget, oldProps: any, changedProps: any): void;
    abstract appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void;
    abstract removeChild(parent: UE.Widget, child: UE.Widget): void;
    canUpdateWithoutNative(): boolean { return false; }
    dispose(): void {}
    createWidget(): UE.Widget {
        let widget = this.createNativeWidget();
        this.initOrUpdateCommonProperties(widget, this.props);
        return widget;
    }

    updateWidget(widget: UE.Widget, oldProps: any, newProps: any) {
        // Find changed properties between oldProps and newProps
        const changedProps = findChangedProps(oldProps, newProps);
        // Update common properties
        this.initOrUpdateCommonProperties(widget, changedProps);
        // Update the widget with changed properties
        this.update(widget, oldProps, changedProps);
    }

    private initOrUpdateCommonProperties(widget: UE.Widget, changeProps: any) {
        const styles = getAllStyles(this.typeName, changeProps);

        const widgetProps = {};
        for (const key in this.translators) {
            const propName = this.PropMaps[key];
            if (isKeyOfRecord(propName, styles) || isKeyOfRecord(propName, changeProps)) {
                const value = this.translators[key](styles, changeProps);
                if (value !== null) {
                    widgetProps[key] = value;
                }
            }
        }

        if (!isEmpty(widgetProps)) {
            puerts.merge(widget, widgetProps);
            UE.UMGManager.SynchronizeWidgetProperties(widget);
        }
    }
}

const containerKeywords = ['div', 'Grid', 'grid', 'Overlay', 'overlay', 'Canvas', 'canvas', 'form', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside'];
const jsxComponentsKeywords = [
    'button', 'input', 'textarea', 'select', 'label', 'span', 'p', 'text',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'audio', 'progress'
];

export function createElementConverter(typeName: string, props: any, outer: any): ElementConverter {
    const lowerType = typeName?.toLowerCase?.() ?? typeName;
    const ignoredElements = new Set(['option', 'script', 'link', 'meta', 'title']);
    const shouldBeAppendedElements = new Set(['option']);
    if (lowerType === 'style') {
        const Module = require(`./jsx/style`);
        if (Module) {
            return new Module["StyleTagConverter"](typeName, props, outer);
        }
    }
    if (ignoredElements.has(lowerType)) {
        class NullConverter extends ElementConverter {
            public readonly ignore = true;
            public forceAppend = false;
            constructor(typeName: string, props: any, outer: any, shouldBeAppend: boolean = false) { super(typeName, props, outer); this.forceAppend = shouldBeAppend; }
            createNativeWidget(): UE.Widget { return null; }
            creatWidget(): UE.Widget { return null; }
            updateWidget(_widget: UE.Widget, _oldProps: any, _newProps: any): void {}
            update(_widget: UE.Widget, _oldProps: any, _changedProps: any): void {}
            appendChild(_parent: UE.Widget, _child: UE.Widget, _childTypeName: string, _childProps: any): void {}
            removeChild(_parent: UE.Widget, _child: UE.Widget): void {}
        }

        if (shouldBeAppendedElements.has(lowerType)) {
            return new NullConverter(typeName, props, outer, true);
        }

        return new NullConverter(typeName, props, outer);
    }

    if (containerKeywords.includes(typeName) || containerKeywords.includes(lowerType)) {
        const Module = require(`./container/container_converter`);
        if (Module) {
            return new Module["ContainerConverter"](typeName, props, outer);
        }
    }

    if (jsxComponentsKeywords.includes(typeName)) {
        const Module = require(`./jsx/jsx_converter`);
        if (Module) {
            return new Module["JSXConverter"](typeName, props, outer);
        }
    }

    const Module = require(`./umg/umg_converter`);
    if (Module) {
        return new Module["UMGConverter"](typeName, props, outer);
    }
}
