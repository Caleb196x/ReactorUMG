import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { getAllStyles } from '../../parsers/cssstyle_parser';
import { parseBrush } from '../../parsers/brush_parser';
import { parseToLinearColor } from '../../parsers/css_color_parser';
import { convertToUEMargin } from '../../parsers/css_margin_parser';

export class BorderConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private setupProps(border: UE.Border, props: any): void {
        const backgroundColor = props?.backgroundColor;
        if (backgroundColor) {
            const color = parseToLinearColor(backgroundColor);
            border.SetBrushColor(new UE.LinearColor(color.r, color.g, color.b, color.a));
        }

        const backgroundImage = props?.backgroundImage;
        if (backgroundImage) {
            const image = parseBrush(backgroundImage);
            border.SetBrush(image);
        }

        const contentColor = props?.contentColor;
        if (contentColor) {
            const color = parseToLinearColor(contentColor);
            border.SetContentColorAndOpacity(new UE.LinearColor(color.r, color.g, color.b, color.a));
        }

        const contentHorizontalAlign = props?.contentHorizontalAlign;
        if (contentHorizontalAlign) {
            switch (contentHorizontalAlign) {
                case 'left':
                    border.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
                    break;
                case 'center':
                    border.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center);
                    break;
                case 'right':
                    border.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
                    break;
                case 'fill':
                    border.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill);
                    break;
                default:
                    console.warn(`Invalid content horizontal align: ${contentHorizontalAlign}`);
                    border.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill);
                    break;
            }
        }

        const contentVerticalAlign = props?.contentVerticalAlign;
        if (contentVerticalAlign) {
            switch (contentVerticalAlign) {
                case 'top':
                    border.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
                    break;
                case 'center':
                    border.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center);
                    break;
                case 'bottom':
                    border.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom);
                    break;
                case 'fill':
                    border.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill);
                    break;
                default:
                    console.warn(`Invalid content vertical align: ${contentVerticalAlign}`);
                    border.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill);
                    break;
            }
        }

        const padding = props?.contentPadding || props?.contentMargin;
        if (padding) {
            const style = getAllStyles(this.typeName, props);
            const pdd = convertToUEMargin(style, padding, '', '', '', '')
            if (pdd) {
                border.SetPadding(pdd);
            }
        }
    }

    private bindEvent(border: UE.Border, props: any): boolean {
        let bindEvent = false;
        const onMouseButtonDown = props?.onMouseButtonDown;
        if (onMouseButtonDown && typeof onMouseButtonDown === 'function') {
            border.OnMouseButtonDownEvent.Bind(
                (MyGeometry: UE.Geometry, MouseEvent: UE.PointerEvent) => {
                onMouseButtonDown();
                return new UE.EventReply();
            });
            bindEvent = true;
        }

        const onMouseButtonUp = props?.onMouseButtonUp;
        if (onMouseButtonUp && typeof onMouseButtonUp === 'function') {
            border.OnMouseButtonUpEvent.Bind(
                (MyGeometry: UE.Geometry, MouseEvent: UE.PointerEvent) => {
                onMouseButtonUp();
                return new UE.EventReply();
            });
            bindEvent = true;
        }

        const onMouseMove = props?.onMouseMove;
        if (onMouseMove && typeof onMouseMove === 'function') {
            border.OnMouseMoveEvent.Bind(
                (MyGeometry: UE.Geometry, MouseEvent: UE.PointerEvent) => {
                onMouseMove();
                return new UE.EventReply();
            });
            bindEvent = true;
        }

        const onMouseDoubleClick = props?.onMouseDoubleClick;
        if (onMouseDoubleClick && typeof onMouseDoubleClick === 'function') {
            border.OnMouseDoubleClickEvent.Bind(
                (MyGeometry: UE.Geometry, MouseEvent: UE.PointerEvent) => {
                onMouseDoubleClick();
                return new UE.EventReply();
            });
            bindEvent = true;
        }

        return bindEvent;
    }

    createNativeWidget(): UE.Widget {
        const border = new UE.Border(this.outer);
        this.setupProps(border, this.props);
        const bindEvent = this.bindEvent(border, this.props);
        if (bindEvent) {
            UE.UMGManager.SynchronizeWidgetProperties(border);
        }
        return border;
    }
    
    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const border = widget as UE.Border;
        this.setupProps(border, changedProps);
        const bindEvent = this.bindEvent(border, changedProps);
        if (bindEvent) {
            UE.UMGManager.SynchronizeWidgetProperties(border);
        }
    }
}
