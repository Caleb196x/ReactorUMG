import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { convertToUEMargin } from '../../parsers/css_margin_parser';
import { parseBrush } from '../../parsers/brush_parser';

export class ScrollBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private readonly styleKeyMap: Record<string, string> = {
        'barHorizontalBackground': 'HorizontalBackgroundImage',
        'barVerticalBackground': 'VerticalBackgroundImage',
        'normalThumbBackground': 'NormalThumbImage',
        'hoveredThumbBackground': 'HoveredThumbImage',
        'draggedThumbBackground': 'DraggedThumbImage',
        'verticalTopSlotBackground': 'VerticalTopSlotImage',
        'verticalBottomSlotBackground': 'VerticalBottomSlotImage',
        'horizontalLeftSlotBackground': 'HorizontalTopSlotImage',
        'horizontalRightSlotBackground': 'HorizontalBottomSlotImage',
    };

    private setOrientation(scrollBox: UE.ScrollBox, orientation?: string): boolean {
        if (!orientation) return false;
        switch (orientation) {
            case 'horizontal':
                scrollBox.SetOrientation(UE.EOrientation.Orient_Horizontal);
                break;
            case 'vertical':
                scrollBox.SetOrientation(UE.EOrientation.Orient_Vertical);
                break;
            default:
                scrollBox.SetOrientation(UE.EOrientation.Orient_Vertical);
                break;
        }
        return true;
    }

    private setNavigationDestination(scrollBox: UE.ScrollBox, destination?: string): boolean {
        if (!destination) return false;
        switch (destination) {
            case 'into-view':
                scrollBox.SetNavigationDestination(UE.EDescendantScrollDestination.IntoView);
                break;
            case 'center':
                scrollBox.SetNavigationDestination(UE.EDescendantScrollDestination.Center);
                break;
            case 'top-left':
                scrollBox.SetNavigationDestination(UE.EDescendantScrollDestination.TopOrLeft);
                break;
            case 'bottom-right':
                scrollBox.SetNavigationDestination(UE.EDescendantScrollDestination.BottomOrRight);
                break;
            default:
                scrollBox.SetNavigationDestination(UE.EDescendantScrollDestination.IntoView);
                break;
        }
        return true;
    }

    private setVisibility(scrollBox: UE.ScrollBox, visibility?: string): boolean {
        if (!visibility) return false;
        switch (visibility) {
            case 'hidden':
                scrollBox.SetScrollBarVisibility(UE.ESlateVisibility.Hidden);
                break;
            case 'collapse':
            case 'collapsed':
                scrollBox.SetScrollBarVisibility(UE.ESlateVisibility.Collapsed);
                break;
            case 'hit-test-invisible':
                scrollBox.SetScrollBarVisibility(UE.ESlateVisibility.HitTestInvisible);
                break;
            case 'self-hit-test-invisible':
                scrollBox.SetScrollBarVisibility(UE.ESlateVisibility.SelfHitTestInvisible);
                break;
            default:
                scrollBox.SetScrollBarVisibility(UE.ESlateVisibility.Visible);
                break;
        }
        return true;
    }

    private setStyle(scrollBox: UE.ScrollBox, props: any): boolean {
        if (!props) return false;
        let updated = false;

        for (const key of Object.keys(props)) {
            if (this.styleKeyMap[key]) {
                scrollBox.WidgetBarStyle[this.styleKeyMap[key]] = parseBrush(props[key]);
                updated = true;
            }
        }

        if (typeof props.barThickness === 'number') {
            const thickness = props.barThickness as number;
            scrollBox.SetScrollbarThickness(new UE.Vector2D(thickness, thickness));
            scrollBox.WidgetBarStyle.Thickness = thickness;
            updated = true;
        }

        if (props.barPadding !== undefined) {
            scrollBox.SetScrollbarPadding(convertToUEMargin(props, props.barPadding, '', '', '', ''));
            updated = true;
        }

        return updated;
    }

    private initProps(scrollBox: UE.ScrollBox, props: any): boolean {
        if (!scrollBox || !props) return false;
        let updated = false;

        updated = this.setOrientation(scrollBox, props.orientation) || updated;
        updated = this.setNavigationDestination(scrollBox, props.navigationDestination) || updated;
        updated = this.setVisibility(scrollBox, props.visibility) || updated;
        updated = this.setStyle(scrollBox, props) || updated;

        if (typeof props.alwaysShowBars === 'boolean') {
            scrollBox.SetAlwaysShowScrollbar(props.alwaysShowBars);
            updated = true;
        }

        if (typeof props.alwaysShowBarTrack === 'boolean') {
            scrollBox.AlwaysShowScrollbarTrack = props.alwaysShowBarTrack;
            updated = true;
        }

        if (typeof props.allowDragging === 'boolean') {
            scrollBox.bAllowRightClickDragScrolling = props.allowDragging;
            updated = true;
        }

        if (typeof props.allowOverscroll === 'boolean') {
            scrollBox.SetAllowOverscroll(props.allowOverscroll);
            updated = true;
        }

        return updated;
    }

    createNativeWidget(): UE.Widget {
        const scrollBox = new UE.ScrollBox(this.outer);
        const propsInit = this.initProps(scrollBox, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(scrollBox);
        }
        return scrollBox;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const scrollBox = widget as UE.ScrollBox;
        const propsInit = this.initProps(scrollBox, changedProps);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(scrollBox);
        }
    }
}
