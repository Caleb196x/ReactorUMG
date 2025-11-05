import * as UE from "ue";
import { safeParseFloat } from "../misc/utils";

/**
 * Converts CSS length values to SU (Slate Units) for Unreal Engine UMG
 * Supported units: px, %, em, rem (relative to parent font size)
 * @param length - CSS length string or number to convert (e.g., "16px", "2em", 12)
 * @param style - React style object containing font size reference
 * @returns Converted value in SU units
 */
export function convertLengthUnitToSlateUnit(length: string | number | undefined, style: any, referenceSize?: number, canvasSize?: UE.Vector2D/*目前无法在非运行时下获取到画布大小*/): number {
    if (length === undefined || length === null) {
        return 0;
    }

    if (typeof length === "number") {
        return length;
    }

    const normalized = String(length).trim();

    let fontSize = style?.fontSize ?? "16px";
    if (typeof fontSize === "number") {
        fontSize = `${fontSize}px`;
    } else if (typeof fontSize === "string") {
        fontSize = fontSize.trim();
    } else {
        fontSize = "16px";
    }

    if (!fontSize.endsWith("px")) {
        fontSize = "16px";
    }

    const parseViewSize = (input, isVertical) => {
        if (!canvasSize) return 0;
        
        let match;
        if (isVertical) {
            match = input.match(/([+-]?\d+(?:\.\d+)?)vh/);
        } else {
            match = input.match(/([+-]?\d+(?:\.\d+)?)vw/);
        }

        if (!match) {
            return 0;
        }
        const value = parseFloat(match[1]) ?? 0;
        if (isNaN(value)) {
            return 0;
        }

        if (isVertical) {
            const viewportHeight =
                typeof canvasSize.Y === "number"
                    ? canvasSize.Y
                    : typeof (canvasSize as any).y === "number"
                    ? (canvasSize as any).y
                    : 0;
            return (viewportHeight * value) / 100;
        } else {
            const viewportWidth =
                typeof canvasSize.X === "number"
                    ? canvasSize.X
                    : typeof (canvasSize as any).x === "number"
                    ? (canvasSize as any).x
                    : 0;
            return (viewportWidth * value) / 100;
        }
    }

    const numSize = parseFloat(fontSize.replace("px", "")) || 16;

    if (normalized.endsWith("px")) {
        const match = normalized.match(/([+-]?\d+(?:\.\d+)?)px/);
        if (match) {
            return parseFloat(match[1]);
        }
    } else if (normalized.endsWith("%")) {
        const percent = parseFloat(normalized.substring(0, normalized.length - 1));
        if (isNaN(percent)) {
            return 0;
        }
        if (referenceSize) return (referenceSize * percent) / 100;
        else return 0;
    } else if (normalized.endsWith("em")) {
        const match = normalized.match(/([+-]?\d+(?:\.\d+)?)em/);
        if (match) {
            return parseFloat(match[1]) * numSize;
        }
    } else if (normalized.endsWith("rem")) {
        const match = normalized.match(/([+-]?\d+(?:\.\d+)?)rem/);
        if (match) {
            return parseFloat(match[1]) * numSize;
        }
    } else if (normalized.endsWith("vh")) {
        return parseViewSize(normalized, true);
    }else if (normalized.endsWith("vw")) {
        return parseViewSize(normalized, false);
    } else if (normalized === "thin") {
        return 12;
    } else if (normalized === "medium" || normalized === "normal") {
        return 16;
    } else if (normalized === "thick") {
        return 20;
    }else if (!isNaN(parseFloat(normalized))) {
        return parseFloat(normalized);
    }

    return 0;
}

export function convertLUToSUWithUnitType(length: string, fontSize?: number): { type: string; value: number } {
    if (!fontSize) {
        fontSize = 16;
    }

    let result = { type: "auto", value: 0 };
    if (length === "auto") {
        return result;
    }

    if (length === "thin") {
        return { type: "px", value: 12 };
    } else if (length === "medium") {
        return { type: "px", value: 16 };
    } else if (length === "normal") {
        return { type: "px", value: 16 };
    } else if (length === "thick") {
        return { type: "px", value: 20 };
    } else if (!isNaN(parseFloat(length))) {
        // If it's just a number without units, return it directly
        return { type: "px", value: parseFloat(length) };
    }

    // Match numeric value and unit
    const match = length.match(/^(\d*\.?\d+)([a-z%]*)$/);
    if (match) {
        let numValue = safeParseFloat(match[1]);
        const unit = match[2] || "px";

        if (unit === "em" || unit === "rem") {
            numValue = numValue * fontSize; // todo@Caleb196x: 读取font size，如果没有font size，则使用默认值16px
        }

        // todo@Caleb196x: 需要知道父控件的宽度和长度所占像素值，然后根据px值转换成占比值fr
        return { type: unit, value: numValue };
    }

    // Default fallback
    return { type: "fr", value: 1 };
}

export function parseScale(scale: string): UE.Vector2D {
    if (!scale || scale === "none") {
        return new UE.Vector2D(1, 1);
    }

    const scaleValues = scale.split(" ").map(Number);
    if (scaleValues.length === 1) {
        return new UE.Vector2D(scaleValues[0], scaleValues[0]);
    } else if (scaleValues.length === 2) {
        return new UE.Vector2D(scaleValues[0], scaleValues[1]);
    }

    return new UE.Vector2D(1, 1);
}

/**
 * Parses a string representing an aspect ratio and returns a number
 * @param aspectRatio - String representing aspect ratio (e.g., "16/9", "0.5", "1/1")
 * @returns Number representing aspect ratio (e.g., 1.7777777777777777)
 */
export function parseAspectRatio(aspectRatio: string) {
    if (!aspectRatio) {
        return 1.0;
    }

    // Handle decimal format like '0.5'
    if (!isNaN(Number(aspectRatio))) {
        return Number(aspectRatio);
    }

    // Handle ratio format like '16/9' or '1/1'
    const parts = aspectRatio.split("/");
    if (parts.length === 2) {
        const numerator = Number(parts[0]);
        const denominator = Number(parts[1]);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            return numerator / denominator;
        }
    }

    return 1.0;
}


