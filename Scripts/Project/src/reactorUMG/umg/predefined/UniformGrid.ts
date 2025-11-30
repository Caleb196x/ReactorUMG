import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { convertToUEMargin } from '../../parsers/css_margin_parser';
import { getAllStyles } from '../../parsers/cssstyle_parser';
import { parseWidgetSelfAlignment } from '../../parsers/alignment_parser';

export class UniformGridConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private parseIndex(value: any): number | undefined {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return undefined;
    }

    private initProps(grid: UE.UniformGridPanel, props: any): boolean {
        if (!props) return false;
        let updated = false;

        const minCellSize = props.minCellSize;
        if (minCellSize) {
            if (minCellSize.x !== undefined) {
                grid.MinDesiredSlotWidth = minCellSize.x;
                updated = true;
            }
            if (minCellSize.y !== undefined) {
                grid.MinDesiredSlotHeight = minCellSize.y;
                updated = true;
            }
        }

        if (props.cellPadding !== undefined) {
            grid.SlotPadding = convertToUEMargin(props, props.cellPadding, '', '', '', '');
            updated = true;
        }

        return updated;
    }

    createNativeWidget(): UE.Widget {
        const grid = new UE.UniformGridPanel(this.outer);
        const propsInit = this.initProps(grid, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(grid);
        }
        return grid;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const grid = widget as UE.UniformGridPanel;
        const propsInit = this.initProps(grid, changedProps);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(grid);
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        if (parent instanceof UE.UniformGridPanel) {
            const row = this.parseIndex(childProps?.row ?? childProps?.gridRow ?? childProps?.style?.gridRow);
            const column = this.parseIndex(childProps?.column ?? childProps?.gridColumn ?? childProps?.style?.gridColumn);
            const slot = parent.AddChildToUniformGrid(child, row ?? 0, column ?? 0);

            const childStyle = getAllStyles(childTypeName, childProps);
            const alignment = parseWidgetSelfAlignment(childStyle);
            if (typeof slot.SetHorizontalAlignment === 'function') {
                slot.SetHorizontalAlignment(alignment.horizontal);
            }
            if (typeof slot.SetVerticalAlignment === 'function') {
                slot.SetVerticalAlignment(alignment.vertical);
            }
            if (row !== undefined) {
                slot.SetRow(row);
            }
            if (column !== undefined) {
                slot.SetColumn(column);
            }
            return;
        }

        super.appendChild(parent, child, childTypeName, childProps);
    }
}
