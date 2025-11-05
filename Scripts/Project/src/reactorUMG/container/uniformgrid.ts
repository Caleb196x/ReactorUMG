import { parseWidgetSelfAlignment } from "../parsers/alignment_parser";
import { convertToUEMargin } from "../parsers/css_margin_parser";
import { getAllStyles } from "../parsers/cssstyle_parser";
import { ContainerConverter } from "./container_converter";
import * as UE from "ue";

export class UniformGridConverter extends ContainerConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private initUniformGridProps(uniformGrid: UE.UniformGridPanel, props: any) {
        const minCellSize = props?.minCellSize;
        if (minCellSize) {
            uniformGrid.SetMinDesiredSlotWidth(minCellSize.x);
            uniformGrid.SetMinDesiredSlotHeight(minCellSize.y);
        }

        const cellPadding = props?.cellPadding;
        if (cellPadding) {
            let padding = null;
            if (typeof cellPadding === 'object') {
                padding = new UE.Margin(cellPadding.top, cellPadding.right, 
                                        cellPadding.bottom, cellPadding.left);

            } else if (typeof cellPadding === 'string') {
                padding = convertToUEMargin(props?.style, cellPadding, '', '', '', '');
            }

            if (padding) {
                uniformGrid.SetSlotPadding(padding);
            }
        }
    }

    private setupUniformGridSlot(slot: UE.UniformGridSlot, childTypeName: string, childProps: any) {
        const childStyle = getAllStyles(childTypeName, childProps);
        const alignment = parseWidgetSelfAlignment(childStyle);
        slot.SetHorizontalAlignment(alignment.horizontal);
        slot.SetVerticalAlignment(alignment.vertical);
        this.initChildPadding(slot, childStyle);

        const row = childStyle?.gridRow || 0;
        const column = childStyle?.gridColumn || 0;
        if (typeof row === 'string') {
            const rowIndex = parseFloat(row);
            if (!isNaN(rowIndex)) {
                slot.SetRow(rowIndex);
            }
        } else if (typeof row === 'number') {
            slot.SetRow(row);
        }

        if (typeof column === 'string') {
            const columnIndex = parseFloat(column);
            if (!isNaN(columnIndex)) {
                slot.SetColumn(columnIndex);
            }
        } else if (typeof column === 'number') {
            slot.SetColumn(column);
        }
    }

    createNativeWidget(): UE.Widget {
        const uniformGrid = new UE.UniformGridPanel(this.outer);
        this.initUniformGridProps(uniformGrid, this.props);
        return uniformGrid;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const uniformGrid = widget as UE.UniformGridPanel;
        this.initUniformGridProps(uniformGrid, changedProps);
    }
    
    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        const uniformGrid = parent as UE.UniformGridPanel;
        const slot = uniformGrid.AddChildToUniformGrid(child);
        this.setupUniformGridSlot(slot, childTypeName, childProps);
    }
    
}
