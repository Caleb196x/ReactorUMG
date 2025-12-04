import * as UE from "ue";
import { ContainerConverter } from "./container_converter";
import { convertLUToSUWithUnitType } from "../parsers/css_length_parser";
import { getAllStyles } from "../parsers/cssstyle_parser";

export class GridConverter extends ContainerConverter {
    private totalColumns: number = 0;
    private totalRows: number = 0;
    private nextAutoColumn: number = 0;
    private nextAutoRow: number = 0;
    private columnGap: number = 0;
    private rowGap: number = 0;
    private defaultJustifyItems: string = 'stretch';
    private defaultAlignItems: string = 'stretch';
    private autoFlow: 'row' | 'column' = 'row';

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }
    // Helper method to parse grid template values
    private parseGridTemplate(template: string): Array<{type: string, value: number}> {
        const result: Array<{type: string, value: number}> = [];
        if (!template || typeof template !== 'string') {
            return result;
        }

        // Tokenize while preserving order, supporting mixed repeat() and individual tokens
        const tokens = template.match(/repeat\(\s*\d+\s*,\s*[^)]+\)|[^ \t\r\n]+/g) || [];
        for (const raw of tokens) {
            const token = raw.trim();
            if (!token) continue;

            const repeatMatch = token.match(/^repeat\(\s*(\d+)\s*,\s*([^)]+)\)$/);
            if (repeatMatch) {
                const count = parseInt(repeatMatch[1], 10);
                const inner = repeatMatch[2].trim();
                for (let i = 0; i < count; i++) {
                    result.push(convertLUToSUWithUnitType(inner));
                }
                continue;
            }

            result.push(convertLUToSUWithUnitType(token));
        }

        return result;
    }


    /**
     * Converts grid template values to fill values based on the following rules:
     * 1. For absolute units (px, em, rem), calculate the proportion relative to total absolute values
     * 2. For fr units, use the fr value directly
     * 3. For auto values, use the previous value
     * 4. For mixed units (fr + absolute), convert absolute units to fr with warning
     */
    private convertGridTemplatesToFills(values: {type: string, value: number}[]): number[] {
        const fills: number[] = [];
        let totalAbsoluteValue = 0;
        let totalFrValue = 0;
        let hasAbsoluteUnits = false;
        let hasFrUnits = false;

        // First pass: calculate totals and detect unit types
        let replacedValues: {type: string, value: number}[] = [];
        for (const value of values) {
            // Replace 'auto' values with the nearest non-auto value
            // If the first element is 'auto', we'll temporarily mark it and handle it after finding the first non-auto value
            if (value.type === 'auto') {
                // Find the next non-auto value if we haven't found one yet
                // Look ahead for the nearest non-auto value; if none, look behind; else default to 1fr
                const currentIndex = replacedValues.length;
                let candidate: {type: string, value: number} | null = null;
                for (let i = currentIndex + 1; i < values.length; i++) {
                    if (values[i].type !== 'auto') { candidate = {...values[i]}; break; }
                }
                if (!candidate) {
                    for (let i = currentIndex - 1; i >= 0; i--) {
                        if (replacedValues[i].type !== 'auto') { candidate = {...replacedValues[i]}; break; }
                    }
                }
                replacedValues.push(candidate ?? {type: 'fr', value: 1});
            } else {
                // For non-auto values, just add them as is
                replacedValues.push({...value});
            }
        }

        for (const value of replacedValues) {
            if (value.type === 'fr') {
                totalFrValue += value.value;
                hasFrUnits = true;
            } else {
                totalAbsoluteValue += value.value;
                hasAbsoluteUnits = true;
            }
        }

        // Mixed units case (fr + absolute)
        if (hasFrUnits && hasAbsoluteUnits) {
            const conversionFactor = totalFrValue / totalAbsoluteValue;
            
            for (const value of replacedValues) {
                if (value.type === 'fr') {
                    fills.push(value.value);
                } else {
                    // Convert absolute to fr equivalent
                    const convertedValue = value.value * conversionFactor;
                    fills.push(convertedValue);
                }
            }
        } 
        // All fr units
        else if (hasFrUnits && !hasAbsoluteUnits) {
            for (const value of replacedValues) {
                fills.push(value.value);
            }
        } 
        // All absolute units
        else if (!hasFrUnits && hasAbsoluteUnits) {
            for (const value of replacedValues) {
                // Calculate proportion of total
                const proportion = (value.value / totalAbsoluteValue) * replacedValues.length;
                fills.push(proportion);
                
            }
        }

        return fills;
    }

    private parseTemplateShorthand(style: any): { cols?: string; rows?: string } {
        const template = style?.gridTemplate;
        if (!template || typeof template !== 'string') { return {}; }
        // Simple support: "<rows> / <columns>"
        const parts = template.split('/');
        if (parts.length === 2) {
            const rows = parts[0].trim();
            const cols = parts[1].trim();
            return { cols, rows };
        }
        return {};
    }

    private initGapsFromStyle(style: any) {
        const gap = style?.gap;
        const rowGap = style?.rowGap;
        const columnGap = style?.columnGap;

        const parseGap = (val: any): { row: number; col: number } => {
            if (!val) return { row: 0, col: 0 };
            if (typeof val === 'number') return { row: val, col: val };
            if (typeof val === 'string') {
                const parts = val.trim().split(/\s+/);
                if (parts.length === 1) {
                    const su = convertLUToSUWithUnitType(parts[0]);
                    return { row: su.value, col: su.value };
                } else {
                    const r = convertLUToSUWithUnitType(parts[0]).value;
                    const c = convertLUToSUWithUnitType(parts[1]).value;
                    return { row: r, col: c };
                }
            }
            return { row: 0, col: 0 };
        };

        let gaps = parseGap(gap);
        if (rowGap) { gaps.row = convertLUToSUWithUnitType(rowGap).value; }
        if (columnGap) { gaps.col = convertLUToSUWithUnitType(columnGap).value; }

        this.rowGap = gaps.row || 0;
        this.columnGap = gaps.col || 0;
    }

    private initGridShape(gridPanel: UE.GridPanel, styleForTemplate?: any) {
        // Reset counters when shape changes
        this.nextAutoColumn = 0;
        this.nextAutoRow = 0;

        const shorthand = this.parseTemplateShorthand(styleForTemplate ?? this.containerStyle);
        const templateColumns = styleForTemplate?.gridTemplateColumns ?? shorthand.cols ?? this.containerStyle?.gridTemplateColumns;
        const templateRows = styleForTemplate?.gridTemplateRows ?? shorthand.rows ?? this.containerStyle?.gridTemplateRows;

        if (templateColumns) {
            const columnDefinitions = this.parseGridTemplate(String(templateColumns));
            this.totalColumns = columnDefinitions.length;
            const columnFill: number[] = this.convertGridTemplatesToFills(columnDefinitions);
            for (let i = 0; i < columnFill.length; i++) {
                gridPanel.SetColumnFill(i, columnFill[i]);
            }
        }

        if (templateRows) {
            const rowDefinitions = this.parseGridTemplate(String(templateRows));
            this.totalRows = rowDefinitions.length;
            const rowFill: number[] = this.convertGridTemplatesToFills(rowDefinitions);
            for (let i = 0; i < rowFill.length; i++) {
                gridPanel.SetRowFill(i, rowFill[i]);
            }
        }
    }

    createNativeWidget(): UE.Widget {
        const widget = new UE.GridPanel(this.outer);
        // Initialize grid settings from container styles
        this.initGapsFromStyle(this.containerStyle);
        this.defaultJustifyItems = this.containerStyle?.justifyItems ?? (this.containerStyle?.placeItems?.split(/\s+/)?.[1] ?? 'center');
        this.defaultAlignItems = this.containerStyle?.alignItems ?? (this.containerStyle?.placeItems?.split(/\s+/)?.[0] ?? 'center');
        const autoFlow = (this.containerStyle?.gridAutoFlow || 'row').toString().toLowerCase();
        this.autoFlow = autoFlow.startsWith('column') ? 'column' : 'row';
        // Support gridTemplate and individual templates
        this.initGridShape(widget);
        return widget;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const style = getAllStyles(this.typeName, changedProps);
        const grid = widget as UE.GridPanel;

        // Update gaps and alignment defaults
        if (style?.gap || style?.rowGap || style?.columnGap) {
            this.initGapsFromStyle(style);
            this.reapplyGapToAllSlots(grid);
        }
        if (style?.justifyItems || style?.alignItems || style?.placeItems) {
            this.defaultJustifyItems = style?.justifyItems ?? (style?.placeItems?.split(/\s+/)?.[1] ?? this.defaultJustifyItems);
            this.defaultAlignItems = style?.alignItems ?? (style?.placeItems?.split(/\s+/)?.[0] ?? this.defaultAlignItems);
            this.reapplyAlignmentToAllSlots(grid);
        }
        if (style?.gridAutoFlow) {
            const flow = (style.gridAutoFlow || 'row').toString().toLowerCase();
            this.autoFlow = flow.startsWith('column') ? 'column' : 'row';
        }

        // Templates (including shorthand)
        if (style?.gridTemplate || style?.gridTemplateColumns || style?.gridTemplateRows) {
            this.initGridShape(grid, style);
        }
    }
    
    // for gridColumn and gridRow
    private parseGridColumnWithRow(value: string, isRow: boolean) {
        let start: number = 0;
        let span: number = 0;
    
        // 处理 "auto"（默认从 1 开始，占 1 行）
        if (value === "auto") {
            return { start: -1, span: 1 };
        }
    
        const parts = value.split("/").map(part => part.trim());
    
        // 处理单个数字格式，例如 "2"
        if (parts.length === 1) {
            if (parts[0].startsWith("span")) {
                span = parseInt(parts[0].replace("span", "").trim(), 10);
            } else {
                start = parseInt(parts[0], 10) - 1; // parts[0] 从 1 开始，所以需要减 1
                span = 1;
            }
        }
        // 处理 "2 / 4" 或 "2 / span 2"
        else if (parts.length === 2) {
            const [left, right] = parts;
    
            // 解析起始行
            let span_left = false;
            if (left.startsWith("span")) {
                span = parseInt(left.replace("span", "").trim(), 10);
                span_left = true;
            } else {
                start = left === "auto" ? -1 : parseInt(left, 10) - 1;
            }
    
            // 解析终止行或者 span
            if (right.startsWith("span")) {
                span = parseInt(right.replace("span", "").trim(), 10);
            } else {
                const num = parseInt(right, 10);
                const limit = isRow ? this.totalRows : this.totalColumns;
                const end = right !== "-1" ? (num < limit ? num : limit) : limit;
                
                if (span_left) {
                    start = end - span;
                } else {
                    span = end - start;
                }
            }
        }
    
        // ensure the number legacy
        if (start < -1) start = -1;
        span = span <= 0 ? 1 : span;
        return { start, span };
    }

    private resolveAutoPlacement(): { row: number; col: number } {
        // Ensure we have at least 1 row/column
        const cols = Math.max(1, this.totalColumns || 1);
        const rows = Math.max(1, this.totalRows || 1);

        let row = 0; let col = 0;
        if (this.autoFlow === 'row') {
            row = this.nextAutoRow;
            col = this.nextAutoColumn;
            this.nextAutoColumn += 1;
            if (this.nextAutoColumn >= cols) {
                this.nextAutoColumn = 0;
                this.nextAutoRow += 1;
            }
        } else { // column flow
            row = this.nextAutoRow;
            col = this.nextAutoColumn;
            this.nextAutoRow += 1;
            if (this.nextAutoRow >= rows) {
                this.nextAutoRow = 0;
                this.nextAutoColumn += 1;
            }
        }
        return { row: Math.max(0, row), col: Math.max(0, col) };
    }

    private initGridItemLoc(GridSlot: UE.GridSlot,  childStyle: any) {
        // 优先解析gridColumn和gridRow
        const gridColumn = childStyle?.gridColumn;
        const gridRow = childStyle?.gridRow;

        let columnStart = 0, columnSpan = 1;
        let rowStart = 0, rowSpan = 1;

        if (gridColumn) {
            const {start, span} = this.parseGridColumnWithRow(gridColumn, false);
            columnStart = start;
            columnSpan = span;
        } else {
            const gridColumnStart = childStyle?.gridColumnStart;
            const gridColumnEnd = childStyle?.gridColumnEnd;
            if (gridColumnStart !== undefined || gridColumnEnd !== undefined) {
                let start = parseInt(gridColumnStart);
                let end = parseInt(gridColumnEnd);
                if (isNaN(start)) start = -1;
                if (isNaN(end)) end = -1;
                if (end >= 0 && start >= 0 && end < start) {
                    columnSpan = 1;
                } else if (end >= 0 && start >= 0) {
                    columnSpan = end - start;
                }
                columnStart = start;
            } else {
                columnStart = -1;
            }
        }

        if (gridRow) {
            const {start, span} = this.parseGridColumnWithRow(gridRow, true);
            rowStart = start;
            rowSpan = span;
        } else {
            const gridRowStart = childStyle?.gridRowStart;
            const gridRowEnd = childStyle?.gridRowEnd;
            if (gridRowStart !== undefined || gridRowEnd !== undefined) {
                let start = parseInt(gridRowStart);
                let end = parseInt(gridRowEnd);
                if (isNaN(start)) start = -1;
                if (isNaN(end)) end = -1;
                if (end >= 0 && start >= 0 && end < start) {
                    rowSpan = 1;
                } else if (end >= 0 && start >= 0) {
                    rowSpan = end - start;
                }
                rowStart = start;
            } else {
                rowStart = -1;
            }
        }

        // Auto placement if needed
        if (rowStart < 0 || columnStart < 0) {
            const auto = this.resolveAutoPlacement();
            if (rowStart < 0) rowStart = auto.row;
            if (columnStart < 0) columnStart = auto.col;
        }

        GridSlot.SetColumn(Math.max(0, columnStart));
        GridSlot.SetColumnSpan(Math.max(1, columnSpan));
        GridSlot.SetRow(Math.max(0, rowStart));
        GridSlot.SetRowSpan(Math.max(1, rowSpan));

        // apply per-slot padding based on gaps
        this.applyGapPadding(GridSlot, rowStart, rowSpan, columnStart, columnSpan);
    }

    private initGridAlignment(GridSlot: UE.GridSlot, childStyle: any) {
        const placeSelf = childStyle?.placeSelf;
        let hAlign = 'stretch', vAlign = 'stretch';
        if (placeSelf) {
            const tokens = placeSelf.split(/\s+/).map(v => v.trim()).filter(Boolean);
            const alignSelf = tokens[0]; // vertical
            const justifySelf = tokens[1] || alignSelf; // horizontal
            vAlign = alignSelf || this.defaultAlignItems || 'stretch';
            hAlign = justifySelf || this.defaultJustifyItems || 'stretch';
        } else {
            const alignSelf = childStyle?.alignSelf;
            const justifySelf = childStyle?.justifySelf;

            vAlign = alignSelf || this.defaultAlignItems || 'stretch';
            hAlign = justifySelf || this.defaultJustifyItems || 'stretch';
        }

        const hAlignActionMap = {
            'start': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'end': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'left': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'right': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'flex-start': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'flex-end': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'center': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center),
            'stretch': () => GridSlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill)
        }

        const vAlignActionMap = {
            'start': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'end': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'top': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'bottom': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'flex-start': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'flex-end': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'center': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center),
            'stretch': () => GridSlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill)
        }

        hAlignActionMap[hAlign]();
        vAlignActionMap[vAlign]();
    }

    private initGridPanelSlot(Slot: UE.GridSlot, childTypeName: string, childProps: any) {
        const childStyle = getAllStyles(childTypeName, childProps);
        this.initGridItemLoc(Slot, childStyle);
        this.initGridAlignment(Slot, childStyle);
        super.initChildPadding(Slot, childStyle);
    }

    private applyGapPadding(slot: UE.GridSlot, rowStart: number, rowSpan: number, colStart: number, colSpan: number) {
        // Only apply internal gaps; avoid outer edges having extra padding
        const top = rowStart > 0 ? this.rowGap / 2 : 0;
        const bottom = (rowStart + rowSpan) < this.totalRows ? this.rowGap / 2 : 0;
        const left = colStart > 0 ? this.columnGap / 2 : 0;
        const right = (colStart + colSpan) < this.totalColumns ? this.columnGap / 2 : 0;
        slot.SetPadding(new UE.Margin(top, right, bottom, left));
    }

    private reapplyGapToAllSlots(grid: UE.GridPanel) {
        const count = grid.GetChildrenCount();
        for (let i = 0; i < count; i++) {
            const child = grid.GetChildAt(i);
            let slot = (child as any)?.Slot as UE.GridSlot;
            if (!(slot instanceof UE.GridSlot)) {
                const slotsArr = (grid as any)?.Slots;
                if (slotsArr && typeof slotsArr.Get === 'function') {
                    slot = slotsArr.Get(i) as UE.GridSlot;
                }
            }
            if (!(slot instanceof UE.GridSlot)) continue;
            const r = (slot as any).Row ?? 0;
            const rs = (slot as any).RowSpan ?? 1;
            const c = (slot as any).Column ?? 0;
            const cs = (slot as any).ColumnSpan ?? 1;
            this.applyGapPadding(slot, r, rs, c, cs);
        }
    }

    private reapplyAlignmentToAllSlots(grid: UE.GridPanel) {
        const count = grid.GetChildrenCount();
        for (let i = 0; i < count; i++) {
            const child = grid.GetChildAt(i);
            let slot = (child as UE.Widget)?.Slot as UE.GridSlot;
            if (!(slot instanceof UE.GridSlot)) {
                const slotsArr = (grid as any)?.Slots;
                if (slotsArr && typeof slotsArr.Get === 'function') {
                    slot = slotsArr.Get(i) as UE.GridSlot;
                }
            }
            if (!(slot instanceof UE.GridSlot)) continue;
            // Apply container defaults; child-specific overrides are not available at this stage
            const h = this.defaultJustifyItems || 'stretch';
            const v = this.defaultAlignItems || 'stretch';
            const hMap = {
                'start': UE.EHorizontalAlignment.HAlign_Left,
                'left': UE.EHorizontalAlignment.HAlign_Left,
                'flex-start': UE.EHorizontalAlignment.HAlign_Left,
                'end': UE.EHorizontalAlignment.HAlign_Right,
                'right': UE.EHorizontalAlignment.HAlign_Right,
                'flex-end': UE.EHorizontalAlignment.HAlign_Right,
                'center': UE.EHorizontalAlignment.HAlign_Center,
                'stretch': UE.EHorizontalAlignment.HAlign_Fill
            } as Record<string, UE.EHorizontalAlignment>;
            const vMap = {
                'start': UE.EVerticalAlignment.VAlign_Top,
                'top': UE.EVerticalAlignment.VAlign_Top,
                'flex-start': UE.EVerticalAlignment.VAlign_Top,
                'end': UE.EVerticalAlignment.VAlign_Bottom,
                'bottom': UE.EVerticalAlignment.VAlign_Bottom,
                'flex-end': UE.EVerticalAlignment.VAlign_Bottom,
                'center': UE.EVerticalAlignment.VAlign_Center,
                'stretch': UE.EVerticalAlignment.VAlign_Fill
            } as Record<string, UE.EVerticalAlignment>;
            slot.SetHorizontalAlignment(hMap[h] ?? UE.EHorizontalAlignment.HAlign_Fill);
            slot.SetVerticalAlignment(vMap[v] ?? UE.EVerticalAlignment.VAlign_Fill);
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        const gridPanel = parent as UE.GridPanel;
        let gridSlot = gridPanel.AddChildToGrid(child);
        this.initGridPanelSlot(gridSlot, childTypeName, childProps);
    }
}   
