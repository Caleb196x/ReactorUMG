import * as UE from "ue";
import { ElementConverter } from "../converter";
import { getAllStyles } from "../parsers/cssstyle_parser";
import { convertMargin, convertPadding } from "../parsers/css_margin_parser";
import { parseBackgroundProps } from "../parsers/css_background_parser";
import { parseToLinearColor } from "../parsers/css_color_parser";
import { convertLengthUnitToSlateUnit, parseScale, parseAspectRatio } from "../parsers/css_length_parser";
import { safeParseFloat } from "../misc/utils";
import { parseWidgetSelfAlignment } from "../parsers/alignment_parser";

/**
 * 将容器参数以及布局参数转换中通用的功能实现在这个类中
 */
export class ContainerConverter extends ElementConverter {
    containerType: string;
    containerStyle: any;
    proxy: ElementConverter;
    originalWidget: UE.Widget;
    externalSlot: UE.PanelSlot; // 保存外部添加的容器slot
    sizeBoxWidget: UE.Widget; // 保存sizebox容器
    scaleBoxWidget: UE.Widget; // 保存scalebox容器
    borderWidget: UE.Widget; // 保存border容器

    private childConverters: Record<string, string>;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.containerStyle = getAllStyles(this.typeName, this.props);
        this.containerType = this.parseContainerType(this.typeName);
        this.externalSlot = null;

        this.childConverters = {
            "flex": "FlexConverter",
            "grid": "GridConverter",
            "canvas": "CanvasConverter",
            "overlay": "OverlayConverter",
            "uniformgrid": "UniformGridConverter",
        };
    }

    private createProxy(): ElementConverter {
        if (this.childConverters[this.containerType]) {
            const Module = require(`./${this.containerType}`);
            if (Module) {
                const className = this.childConverters[this.containerType];
                return new Module[className](this.typeName, this.props, this.outer);
            }
        }

        return null;
    }

    private parseContainerType(type: string) {
        const normalizedType = (type || '').toLowerCase();
        const semanticDivs = ['form', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside'];
        if (normalizedType === 'div' || semanticDivs.includes(normalizedType)) {
            const display = this.containerStyle?.display || 'flex';
            if (display === 'grid') {
                return 'grid';
            } else {
                const position = this.containerStyle?.position || 'absolute';
                if (position === 'relative') {
                    return 'overlay';
                } else {
                    return 'flex';
                }
            }
        } else {
            return normalizedType;
        }
    }

    private setupBackground(widget: UE.Widget, borderWidget?: UE.Widget, updateProps?: any): UE.Widget {
        let style = this.containerStyle;
        if (updateProps) {
            style = getAllStyles(this.typeName, updateProps);
        }

        const background = style?.background;
        const backgroundColor = style?.backgroundColor;
        const backgroundImage = style?.backgroundImage;
        const backgroundPosition = style?.backgroundPosition;

        const usingBackground = backgroundColor || backgroundImage || backgroundPosition || background;
        
        if (!usingBackground) {
            return widget;
        } else {
            const parsedBackgroundProps = parseBackgroundProps(style);
            
            let useBorder = false;  
            if (!borderWidget) {
                borderWidget = new UE.Border(this.outer);
            }
            const border = borderWidget as UE.Border;
            if (parsedBackgroundProps?.image) {
                border.SetBrush(parsedBackgroundProps.image);
                useBorder = true;
            }
            if (parsedBackgroundProps?.color) {
                border.SetBrushColor(parsedBackgroundProps.color);
                useBorder = true;
            }
            if (parsedBackgroundProps?.alignment) {
                border.SetVerticalAlignment(parsedBackgroundProps.alignment?.vertical);
                border.SetHorizontalAlignment(parsedBackgroundProps.alignment?.horizontal);
                border.SetPadding(parsedBackgroundProps.alignment?.padding);
            }

            const scale = style?.scale;
            border.SetDesiredSizeScale(parseScale(scale));
            
            // color
            const contentColor = style?.color;
            if (contentColor) {
                const color = parseToLinearColor(contentColor);
                border.SetContentColorAndOpacity(
                    new UE.LinearColor(color.r, color.g, color.b, color.a)
                );
            }

            if (useBorder && !updateProps) {
                this.externalSlot = border.AddChild(widget) as UE.BorderSlot;
            } else {
                return widget;
            }

            return border; 
        }
    }

    private setupBoxSize(Widget: UE.Widget, sizeBoxWidget?: UE.Widget, updateProps?: any): UE.Widget {
        let style = this.containerStyle;
        if (updateProps) {
            style = getAllStyles(this.typeName, updateProps);
        }

        const width = style?.width || 'auto';
        const height = style?.height || 'auto';

        if (width === 'auto' && height === 'auto') {
            return Widget;
        } else {
            if (!sizeBoxWidget) {
                sizeBoxWidget = new UE.SizeBox(this.outer);
            }
            const sizeBox = sizeBoxWidget as UE.SizeBox;
            if (width !== 'auto') {
                const widthPx = convertLengthUnitToSlateUnit(width, this.containerStyle, undefined);
                if (widthPx !== 0)
                    sizeBox.SetWidthOverride(widthPx);
            }

            if (height !== 'auto') {
                const heightPx = convertLengthUnitToSlateUnit(height, this.containerStyle, undefined);
                if (heightPx !== 0)
                    sizeBox.SetHeightOverride(heightPx);
            }

            const maxWidth = this.containerStyle?.maxWidth;
            if (maxWidth) {
                sizeBox.SetMaxDesiredWidth(convertLengthUnitToSlateUnit(maxWidth, this.containerStyle));
            }
            
            const maxHeight = this.containerStyle?.maxHeight;
            if (maxHeight) {
                sizeBox.SetMaxDesiredHeight(convertLengthUnitToSlateUnit(maxHeight, this.containerStyle));
            }

            const minWidth = this.containerStyle?.minWidth;
            if (minWidth) {
                sizeBox.SetMinDesiredWidth(convertLengthUnitToSlateUnit(minWidth, this.containerStyle));
            }

            const minHeight = this.containerStyle?.minHeight;
            if (minHeight) {
                sizeBox.SetMinDesiredHeight(convertLengthUnitToSlateUnit(minHeight, this.containerStyle));
            }

            const aspectRatio = this.containerStyle?.aspectRatio;
            if (aspectRatio) {
                sizeBox.SetMaxAspectRatio(parseAspectRatio(aspectRatio));
                sizeBox.SetMinAspectRatio(parseAspectRatio(aspectRatio));
            }

            if (!updateProps) {
                this.externalSlot = sizeBox.AddChild(Widget) as UE.SizeBoxSlot
            }

            return sizeBox;
        }
    }

    private setupBoxScale(widget: UE.Widget, scaleBoxWidget?: UE.Widget, updateProps?: any): UE.Widget {
        let style = this.containerStyle;
        if (updateProps) {
            style = getAllStyles(this.typeName, updateProps);
        }
        
        const objectFit = style?.objectFit;
        if (objectFit) {
            if (!scaleBoxWidget) {
                scaleBoxWidget = new UE.ScaleBox(this.outer);
            }
            const scaleBox = scaleBoxWidget as UE.ScaleBox;
            if (objectFit === 'contain') {
                scaleBox.SetStretch(UE.EStretch.ScaleToFit)
            } else if (objectFit === 'cover') {
                scaleBox.SetStretch(UE.EStretch.ScaleToFill);
            } else if (objectFit === 'fill') {
                scaleBox.SetStretch(UE.EStretch.Fill);
            } else if (objectFit === 'none') {
                scaleBox.SetStretch(UE.EStretch.None);
            } else if (objectFit === 'scale-down') {
                scaleBox.SetStretch(UE.EStretch.UserSpecifiedWithClipping);
                const scale = style?.scale;
                if (scale) {
                    scaleBox.SetUserSpecifiedScale(safeParseFloat(scale));
                }
            }
            
            this.externalSlot = scaleBox.AddChild(widget) as UE.ScaleBoxSlot;

            return scaleBox;
        } else {
            return widget;
        }
    }

    private initClipChildWidget(parentWidget: UE.Widget) {
        const style = this.containerStyle;
        const visibility = style?.visibility;
        if (visibility === 'clip') {
            parentWidget.SetClipping(UE.EWidgetClipping.ClipToBounds);
        }
    }

    private initChildAlignmentForExternalSlot(childProps: any) {
        if (childProps && this.externalSlot ) {
            const Style = getAllStyles(this.typeName, childProps);
            const childAlignment = parseWidgetSelfAlignment(Style);
            if (this.externalSlot instanceof UE.SizeBoxSlot) {
                (this.externalSlot as UE.SizeBoxSlot).SetHorizontalAlignment(childAlignment.horizontal);
                (this.externalSlot as UE.SizeBoxSlot).SetVerticalAlignment(childAlignment.vertical);
                (this.externalSlot as UE.SizeBoxSlot).SetPadding(childAlignment.padding);
            } else if (this.externalSlot instanceof UE.ScaleBoxSlot) {
                (this.externalSlot as UE.ScaleBoxSlot).SetHorizontalAlignment(childAlignment.horizontal);
                (this.externalSlot as UE.ScaleBoxSlot).SetVerticalAlignment(childAlignment.vertical);
                (this.externalSlot as UE.ScaleBoxSlot).SetPadding(childAlignment.padding);
            } else if (this.externalSlot instanceof UE.BorderSlot) {
                (this.externalSlot as UE.BorderSlot).SetHorizontalAlignment(childAlignment.horizontal);
                (this.externalSlot as UE.BorderSlot).SetVerticalAlignment(childAlignment.vertical);
                (this.externalSlot as UE.BorderSlot).SetPadding(childAlignment.padding);
            } else if (this.externalSlot instanceof UE.WrapBoxSlot) {
                (this.externalSlot as UE.WrapBoxSlot).SetHorizontalAlignment(childAlignment.horizontal);
                (this.externalSlot as UE.WrapBoxSlot).SetVerticalAlignment(childAlignment.vertical);
                (this.externalSlot as UE.WrapBoxSlot).SetPadding(childAlignment.padding);
            }
        }
    }

    initChildPadding(panelSlot: UE.PanelSlot, childStyle: any): void {
        if (!panelSlot || typeof (panelSlot as any).SetPadding !== 'function') {
            return;
        }

        const margin = convertMargin(childStyle);
        if (margin) {
            (panelSlot as any).SetPadding(margin);
        }
        
        const padding = convertPadding(childStyle);
        if (padding) {
            (panelSlot as any).SetPadding(padding);
        }
    }

    createNativeWidget(): UE.Widget {
        let widget: UE.Widget = null;
        if (!this.proxy) {
            this.proxy = this.createProxy();
        }

        if (this.proxy) {
            widget = this.proxy.createNativeWidget();
            this.originalWidget = widget;

            if (widget) {
                widget = this.setupBackground(widget);
                this.borderWidget = widget instanceof UE.Border ? widget : null;
            }

            if (widget) {
                widget = this.setupBoxSize(widget);
                this.sizeBoxWidget = widget instanceof UE.SizeBox ? widget : null;
            }

            if (widget) {
                widget = this.setupBoxScale(widget);
                this.scaleBoxWidget = widget instanceof UE.ScaleBox ? widget : null;
            }
        }

        return widget;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        if (this.proxy) {
            this.proxy.update(widget, oldProps, changedProps);
            // update props
            if (this.borderWidget) {
                this.setupBackground(widget, this.borderWidget, changedProps);
            }
            if (this.sizeBoxWidget) {
                this.setupBoxSize(widget, this.sizeBoxWidget, changedProps);
            }
            if (this.scaleBoxWidget) {
                this.setupBoxScale(widget, this.scaleBoxWidget, changedProps);
            }
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        if (this.proxy) {
            this.initClipChildWidget(parent);
            this.initChildAlignmentForExternalSlot(childProps);
            this.proxy.appendChild(this.originalWidget, child, childTypeName, childProps);
        }
    }

    removeChild(parent: UE.Widget, child: UE.Widget): void {
        child.RemoveFromParent();
    }
}
