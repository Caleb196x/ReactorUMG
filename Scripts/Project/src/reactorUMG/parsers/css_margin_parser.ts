import * as UE from "ue";
import { convertLengthUnitToSlateUnit } from "./css_length_parser";

/**
 * Expands padding values into umg padding values from css padding values
 * @param paddingValues 
 * @returns umg padding values
 */
export function expandPaddingValues(paddingValues: number[]): number[] {
    if (paddingValues.length === 2) {
        return [paddingValues[0], paddingValues[1], paddingValues[0], paddingValues[1]];
    } else if (paddingValues.length === 1) {
        return [paddingValues[0], paddingValues[0], paddingValues[0], paddingValues[0]];
    } else if (paddingValues.length === 3) {
        // padding: top right bottom
        return [paddingValues[0], paddingValues[1], paddingValues[2], paddingValues[1]];
    } else if (paddingValues.length === 4) {
        return paddingValues;
    } else if (paddingValues.length === 0) {
        return [0, 0, 0, 0];
    }

    return paddingValues;
}

export function convertToUEMargin(style: any, margin: string, top: string, right: string, bottom: string, left: string): UE.Margin {

    if (!margin && !top && 
        !right && !bottom && !left) {
        return null;
    }

    // make sure margin is not a undefined
    if (!margin) {
        margin = "";
    }

    const marginValues = margin.split(' ').map(v => {
        // todo@Caleb196x: 处理margin的单位
        return convertLengthUnitToSlateUnit(v.trim(), style);
    });

    let expandedMarginValues = expandPaddingValues(marginValues);

    if (top) {
        expandedMarginValues[0] = convertLengthUnitToSlateUnit(top.trim(), style);
    }
    if (right) {
        expandedMarginValues[1] = convertLengthUnitToSlateUnit(right.trim(), style);
    }
    if (bottom) {
        expandedMarginValues[2] = convertLengthUnitToSlateUnit(bottom.trim(), style);
    }
    if (left) {
        expandedMarginValues[3] = convertLengthUnitToSlateUnit(left.trim(), style);
    }

    // React Padding: top right bottom left
    // UMG Padding: Left, Top, Right, Bottom
    return new UE.Margin(expandedMarginValues[3], expandedMarginValues[0], expandedMarginValues[1], expandedMarginValues[2]);
}

export function convertPadding(style: any): UE.Margin {
    const padding = style?.padding;
    const paddingLeft = style?.paddingLeft;
    const paddingRight = style?.paddingRight;
    const paddingTop = style?.paddingTop;
    const paddingBottom = style?.paddingBottom;
    
    return convertToUEMargin(style, padding, paddingTop, paddingRight, paddingBottom, paddingLeft);
}

export function convertMargin(style: any): UE.Margin {
    const margin = style?.margin;
    const marginLeft = style?.marginLeft;
    const marginRight = style?.marginRight;
    const marginTop = style?.marginTop;
    const marginBottom = style?.marginBottom;

    return convertToUEMargin(style, margin, marginTop, marginRight, marginBottom, marginLeft);
}

export function convertGap(gap: string, style: any): UE.Vector2D {
    if (!gap) {
        return new UE.Vector2D(0, 0);
    }
    const gapValues = gap.split(' ').map(v => {
        // todo@Caleb196x: 处理react的单位
        v = v.trim();
        return convertLengthUnitToSlateUnit(v, style);
    });

    if (gapValues.length === 2) {
        // gap: row column
        // innerSlotPadding: x(column) y(row)
        return new UE.Vector2D(gapValues[1], gapValues[0]);
    }

    return new UE.Vector2D(gapValues[0], gapValues[0]);
}
