import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { getAllStyles } from '../../parsers/cssstyle_parser';
import { convertToUEMargin } from '../../parsers/css_margin_parser';
import { parseBrush } from '../../parsers/brush_parser';
import { parseToLinearColor } from '../../parsers/css_color_parser';

export class ExpandableAreaConverter extends UMGConverter {
    private headerWidget?: UE.Widget | null;
    private areaWidget?: UE.Widget | null;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private resolveWidget(content: any): UE.Widget | null {
        if (!content) {
            return null;
        }
        if (content instanceof UE.Widget) {
            return content;
        }
        const native = (content as any)?.native;
        if (native instanceof UE.Widget) {
            return native;
        }
        return null;
    }

    private setHeaderContent(area: UE.ExpandableArea, content: any): boolean {
        const widget = this.resolveWidget(content);
        if (this.headerWidget === widget) {
            return false;
        }
        if (this.headerWidget && this.headerWidget !== widget) {
            (this.headerWidget as any)?.RemoveFromParent?.();
        }
        const setter = (area as any).SetHeaderContent;
        if (typeof setter === 'function') {
            setter.call(area, widget);
        } else {
            (area as any).HeaderContent = widget;
        }
        this.headerWidget = widget;
        return true;
    }

    private setAreaContent(area: UE.ExpandableArea, content: any): boolean {
        const widget = this.resolveWidget(content);
        if (this.areaWidget === widget) {
            return false;
        }
        if (this.areaWidget && this.areaWidget !== widget) {
            (this.areaWidget as any)?.RemoveFromParent?.();
        }
        const setter = (area as any).SetAreaContent ?? (area as any).SetBodyContent;
        if (typeof setter === 'function') {
            setter.call(area, widget);
        } else {
            (area as any).BodyContent = widget;
        }
        this.areaWidget = widget;
        return true;
    }

    private applyProps(area: UE.ExpandableArea, props: any): boolean {
        let updated = false;
        const styles = getAllStyles(this.typeName, props);

        if (props?.expanded !== undefined) {
            area.SetIsExpanded(!!props.expanded);
            updated = true;
        }

        if (props?.maxHeight !== undefined) {
            area.MaxHeight = props.maxHeight;
            updated = true;
        }

        if (props?.rolloutAnimationLasts !== undefined) {
            area.Style.RolloutAnimationSeconds = props.rolloutAnimationLasts;
            updated = true;
        }

        if (props?.headerPadding !== undefined) {
            const margin = convertToUEMargin(styles, props.headerPadding, '', '', '', '');
            if (margin) {
                area.HeaderPadding = margin;
                updated = true;
            }
        }

        if (props?.areaPadding !== undefined) {
            const margin = convertToUEMargin(styles, props.areaPadding, '', '', '', '');
            if (margin) {
                area.AreaPadding = margin;
                updated = true;
            }
        }

        if (props?.collapsedIcon) {
            area.Style.CollapsedImage = parseBrush(props.collapsedIcon);
            updated = true;
        }

        if (props?.expandedIcon) {
            area.Style.ExpandedImage = parseBrush(props.expandedIcon);
            updated = true;
        }

        if (props?.borderImage) {
            area.BorderBrush = parseBrush(props.borderImage);
            updated = true;
        }

        if (props?.borderColor) {
            const rgba = parseToLinearColor(props.borderColor);
            area.BorderColor = new UE.SlateColor(
                new UE.LinearColor(rgba.r, rgba.g, rgba.b, rgba.a),
                UE.ESlateColorStylingMode.UseColor_Specified
            );
            updated = true;
        }

        if (props?.onExpansionChanged) {
            area.OnExpansionChanged.Add(props.onExpansionChanged);
        }

        return updated;
    }

    private applyContent(area: UE.ExpandableArea, props: any, applyAll: boolean): boolean {
        let changed = false;
        if (applyAll || (props && Object.prototype.hasOwnProperty.call(props, 'header'))) {
            changed = this.setHeaderContent(area, props?.header) || changed;
        }
        if (applyAll || (props && Object.prototype.hasOwnProperty.call(props, 'area'))) {
            changed = this.setAreaContent(area, props?.area) || changed;
        }
        return changed;
    }

    createNativeWidget(): UE.Widget {
        const area = new UE.ExpandableArea(this.outer);
        const propsUpdated = this.applyProps(area, this.props);
        const contentUpdated = this.applyContent(area, this.props, true);
        if (propsUpdated || contentUpdated) {
            UE.UMGManager.SynchronizeWidgetProperties(area);
        }
        return area;
    }

    update(widget: UE.Widget, _oldProps: any, changedProps: any): void {
        const area = widget as UE.ExpandableArea;
        const propsUpdated = this.applyProps(area, changedProps);
        const contentUpdated = this.applyContent(area, changedProps, false);
        if (propsUpdated || contentUpdated) {
            UE.UMGManager.SynchronizeWidgetProperties(area);
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget): void {
        const area = parent as UE.ExpandableArea;
        if (!this.headerWidget) {
            this.setHeaderContent(area, child);
        } else {
            this.setAreaContent(area, child);
        }
    }

    removeChild(parent: UE.Widget, child: UE.Widget): void {
        const area = parent as UE.ExpandableArea;
        if (child === this.headerWidget) {
            this.setHeaderContent(area, null);
            return;
        }
        if (child === this.areaWidget) {
            this.setAreaContent(area, null);
            return;
        }
        child?.RemoveFromParent?.();
    }
}
