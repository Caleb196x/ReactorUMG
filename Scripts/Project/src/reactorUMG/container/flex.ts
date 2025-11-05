import * as UE from "ue";
import { ContainerConverter } from "./container_converter";
import { parseFlexHorizontalAlignmentActions, parseFlexVerticalAlignmentActions } from "../parsers/alignment_parser";
import { getAllStyles } from "../parsers/cssstyle_parser";
import { convertGap } from "../parsers/css_margin_parser";
import { convertLengthUnitToSlateUnit } from "../parsers/css_length_parser";
import { safeParseFloat } from "../misc/utils";

export class FlexConverter extends ContainerConverter {

    private isRow: boolean;
    private isReverse: boolean;
    private isWrap: boolean;
    private mainAxisGap: number;
    private crossAxisGap: number;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        [this.isRow, this.isReverse] = this.parseFlexDirection();
        this.resolveFlexWrap();
        this.computeGapValues();
    }

    private parseFlexDirection(): boolean[] {
        const style = this.containerStyle || {};
        let flexDirection = style?.flexDirection;
        const flexFlow = style?.flexFlow;
        const display = style?.display;

        if (flexFlow) {
            const flexFlowArray = flexFlow.trim().split(' ');
            if (flexFlowArray.length >= 1) {
                flexDirection = flexFlowArray[0];
            }
        }

        if (display && display === 'flex' && !flexDirection) {
            flexDirection = 'row'; // Default to row if display is flex
        } else {
            flexDirection = 'column'; // Default to column if not specified
        }

        const normalized = flexDirection.trim().toLowerCase();

        return [
            normalized.startsWith('row'),
            normalized.endsWith('-reverse')
        ];
    }

    private resolveFlexWrap(): void {
        const style = this.containerStyle || {};
        let flexWrap = style.flexWrap;

        if (!flexWrap && style.flexFlow) {
            const flexFlowArray = style.flexFlow.trim().split(' ');
            if (flexFlowArray.length >= 2) {
                flexWrap = flexFlowArray[1];
            }
        }

        const normalized = (flexWrap || '').toString().trim().toLowerCase();
        this.isWrap = normalized === 'wrap' || normalized === 'wrap-reverse';
    }

    private convertLengthValue(value: any): number {
        if (value === undefined || value === null) {
            return 0;
        }

        if (typeof value === 'number') {
            return value;
        }

        const stringValue = value.toString().trim();
        if (!stringValue || stringValue === 'normal') {
            return 0;
        }

        return convertLengthUnitToSlateUnit(stringValue, this.containerStyle);
    }

    private computeGapValues(): void {
        const style = this.containerStyle || {};
        let columnGap = 0;
        let rowGap = 0;

        if (style.gap) {
            const gapVector = convertGap(style.gap, style);
            columnGap = gapVector.X;
            rowGap = gapVector.Y;
        }

        if (style.columnGap) {
            columnGap = this.convertLengthValue(style.columnGap);
        }

        if (style.rowGap) {
            rowGap = this.convertLengthValue(style.rowGap);
        }

        columnGap = isNaN(columnGap) ? 0 : columnGap;
        rowGap = isNaN(rowGap) ? 0 : rowGap;

        if (this.isRow) {
            this.mainAxisGap = columnGap;
            this.crossAxisGap = rowGap;
        } else {
            this.mainAxisGap = rowGap;
            this.crossAxisGap = columnGap;
        }
    }

    private getFlexGrowValue(style: any): number | null {
        if (!style) {
            return null;
        }

        if (style.flexGrow !== undefined) {
            const value = safeParseFloat(style.flexGrow);
            return isNaN(value) ? null : value;
        }

        if (style.flex !== undefined) {
            if (typeof style.flex === 'number') {
                return style.flex;
            }

            if (typeof style.flex === 'string') {
                const tokens = style.flex.trim().split(/\s+/);
                for (const token of tokens) {
                    const value = safeParseFloat(token);
                    if (!isNaN(value)) {
                        return value;
                    }
                }

                if (style.flex === 'auto') {
                    return 1;
                }

                if (style.flex === 'none') {
                    return 0;
                }
            }
        }

        return null;
    }

    private setAlignmentUsingActions(slot: UE.PanelSlot, alignmentActions: any, childStyle: any) {
        const justifyContent = this.containerStyle?.justifyContent || '';
        const alignItems = this.containerStyle?.alignItems || '';
        const childJustifySelf = childStyle?.justifySelf || '';
        const childAlignSelf = childStyle?.alignSelf || '';

        if (justifyContent === 'space-between' &&
            typeof alignmentActions.spaceBetween === 'function' &&
            typeof (slot as any).SetSize === 'function') {
            const flexGrow = this.getFlexGrowValue(childStyle) ?? 1;
            alignmentActions.spaceBetween(slot, flexGrow);
        }

        const alignSelfValue = childAlignSelf?.split(' ').find((v: string) => alignmentActions.alignSelf[v]);
        if (alignSelfValue) {
            alignmentActions.alignSelf[alignSelfValue](slot);
        } else {
            const alignItemsValue = alignItems.split(' ').find((v: string) => alignmentActions.alignSelf[v]);
            if (alignItemsValue) {
                alignmentActions.alignSelf[alignItemsValue](slot);
            }
        }

        const justifySelfValue = childJustifySelf?.split(' ').find((v: string) => alignmentActions.justifySelf[v]);
        if (justifySelfValue) {
            alignmentActions.justifySelf[justifySelfValue](slot);
        } else {
            const justifyContentValue = justifyContent.split(' ').find((v: string) => alignmentActions.justifySelf[v]);
            if (justifyContentValue) {
                alignmentActions.justifySelf[justifyContentValue](slot);
            }
        }
    }

    private initHorizontalBoxSlot(horizontalBoxSlot: UE.HorizontalBoxSlot, childStyle: any): void {
        const alignmentActions = parseFlexHorizontalAlignmentActions();
        this.setAlignmentUsingActions(horizontalBoxSlot, alignmentActions, childStyle);
    }

    private initVerticalBoxSlot(verticalBoxSlot: UE.VerticalBoxSlot, childStyle: any): void {
        const alignmentActions = parseFlexVerticalAlignmentActions();
        this.setAlignmentUsingActions(verticalBoxSlot, alignmentActions, childStyle);
    }

    private initWrapBoxSlot(wrapBoxSlot: UE.WrapBoxSlot, childStyle: any): void {
        const alignmentActions = this.isRow
            ? parseFlexHorizontalAlignmentActions()
            : parseFlexVerticalAlignmentActions();
        this.setAlignmentUsingActions(wrapBoxSlot, alignmentActions, childStyle);
    }

    private applyFlexSizingToSlot(slot: UE.PanelSlot, childStyle: any): void {
        const flexGrowValue = this.getFlexGrowValue(childStyle);
        if (flexGrowValue === null || isNaN(flexGrowValue)) {
            return;
        }

        if (slot instanceof UE.HorizontalBoxSlot || slot instanceof UE.VerticalBoxSlot) {
            slot.SetSize(new UE.SlateChildSize(flexGrowValue, UE.ESlateSizeRule.Fill));
        } else if (slot instanceof UE.WrapBoxSlot) {
            slot.SetFillEmptySpace(flexGrowValue > 0);
            if (flexGrowValue > 0) {
                slot.SetFillSpanWhenLessThan(0);
            }
        }
    }

    private applyGapToSlot(slot: UE.HorizontalBoxSlot | UE.VerticalBoxSlot, isFirstChild: boolean): void {
        if (!this.mainAxisGap || this.mainAxisGap <= 0) {
            return;
        }

        const currentPadding = slot.Padding
            ? new UE.Margin(slot.Padding.Left, slot.Padding.Top, slot.Padding.Right, slot.Padding.Bottom)
            : new UE.Margin(0, 0, 0, 0);

        if (!isFirstChild) {
            if (this.isRow) {
                if (this.isReverse) {
                    currentPadding.Right += this.mainAxisGap;
                } else {
                    currentPadding.Left += this.mainAxisGap;
                }
            } else {
                if (this.isReverse) {
                    currentPadding.Bottom += this.mainAxisGap;
                } else {
                    currentPadding.Top += this.mainAxisGap;
                }
            }
        }

        slot.SetPadding(currentPadding);
    }

    private configureWrapBox(wrapBox: UE.WrapBox): void {
        wrapBox.Orientation = this.isRow
            ? UE.EOrientation.Orient_Horizontal
            : UE.EOrientation.Orient_Vertical;

        const paddingX = this.isRow ? (this.mainAxisGap || 0) : (this.crossAxisGap || 0);
        const paddingY = this.isRow ? (this.crossAxisGap || 0) : (this.mainAxisGap || 0);
        wrapBox.SetInnerSlotPadding(new UE.Vector2D(paddingX, paddingY));

        if (this.isRow) {
            wrapBox.FlowDirectionPreference = this.isReverse
                ? UE.EFlowDirectionPreference.RightToLeft
                : UE.EFlowDirectionPreference.LeftToRight;
            UE.UMGManager.SynchronizeWidgetProperties(wrapBox);
        }
    }

    createNativeWidget(): UE.Widget {
        if (this.isWrap) {
            const wrapBox = new UE.WrapBox(this.outer);
            this.configureWrapBox(wrapBox);
            return wrapBox;
        }

        const widget = this.isRow ? new UE.HorizontalBox(this.outer) : new UE.VerticalBox(this.outer);
        if (this.isRow) {
            widget.FlowDirectionPreference = this.isReverse
                ? UE.EFlowDirectionPreference.RightToLeft
                : UE.EFlowDirectionPreference.LeftToRight;
            UE.UMGManager.SynchronizeWidgetProperties(widget);
        } else if (this.isReverse) {
            // todo: column-reverse requires manual child order adjustments when appending/removing children
        }

        return widget;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const mergedProps = { ...oldProps, ...changedProps };
        this.props = mergedProps;
        this.containerStyle = getAllStyles(this.typeName, mergedProps);
        [this.isRow, this.isReverse] = this.parseFlexDirection();
        this.resolveFlexWrap();
        this.computeGapValues();

        if (widget instanceof UE.WrapBox) {
            this.configureWrapBox(widget as UE.WrapBox);
        } else if (widget instanceof UE.HorizontalBox) {
            widget.FlowDirectionPreference = this.isReverse
                ? UE.EFlowDirectionPreference.RightToLeft
                : UE.EFlowDirectionPreference.LeftToRight;
            UE.UMGManager.SynchronizeWidgetProperties(widget);
        } else if (widget instanceof UE.VerticalBox) {
            // Left intentionally blank: reversing vertical flow requires reordering slots which is handled during append/remove.
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        const childStyle = getAllStyles(childTypeName, childProps);
        const panelParent = parent as UE.PanelWidget;
        const existingCount = panelParent ? panelParent.GetChildrenCount() : 0;

        if (parent instanceof UE.WrapBox) {
            const wrapBox = parent as UE.WrapBox;
            const wrapSlot = wrapBox.AddChildToWrapBox(child);
            this.initWrapBoxSlot(wrapSlot, childStyle);
            super.initChildPadding(wrapSlot, childStyle);
            this.applyFlexSizingToSlot(wrapSlot, childStyle);
            return;
        }

        if (parent instanceof UE.HorizontalBox) {
            const horizontalBox = parent as UE.HorizontalBox;
            const horizontalBoxSlot = horizontalBox.AddChildToHorizontalBox(child);
            this.initHorizontalBoxSlot(horizontalBoxSlot, childStyle);
            super.initChildPadding(horizontalBoxSlot, childStyle);
            this.applyFlexSizingToSlot(horizontalBoxSlot, childStyle);
            this.applyGapToSlot(horizontalBoxSlot, existingCount === 0);
            return;
        }

        if (parent instanceof UE.VerticalBox) {
            const verticalBox = parent as UE.VerticalBox;
            const verticalBoxSlot = verticalBox.AddChildToVerticalBox(child);
            this.initVerticalBoxSlot(verticalBoxSlot, childStyle);
            super.initChildPadding(verticalBoxSlot, childStyle);
            this.applyFlexSizingToSlot(verticalBoxSlot, childStyle);
            this.applyGapToSlot(verticalBoxSlot, existingCount === 0);
        }
    }
}
