import { isKeyOfRecord } from "../misc/utils";
import { parseToLinearColor } from "./css_color_parser";
import { convertLengthUnitToSlateUnit } from "./css_length_parser";
import * as UE from 'ue';

export function parseFontSize(fontSize: any, style: any): number {
    if (typeof fontSize === 'string') {
        const fontSizeValue = convertLengthUnitToSlateUnit(fontSize, style);
        return fontSizeValue;
    } else if (typeof fontSize === 'number') {
        return fontSize <= 0 ? 12 : fontSize;
    } else {
        return 16;
    }
}

export function parseTextAlign(textAlign: string): UE.ETextJustify {
    if (textAlign === 'center') {
        return UE.ETextJustify.Center;
    } else if (textAlign === 'right') {
        return UE.ETextJustify.Right;
    } else {
        return UE.ETextJustify.Left;
    }
}

export function parseFontFaceName(fontStyle?: string, fontWeight?: string) {
    let fontFace = 'Default';
    const normalizedWeight = (fontWeight ?? '').toString().toLowerCase();
    const normalizedStyle = (fontStyle ?? '').toString().toLowerCase();

    if (normalizedWeight === 'bold' || normalizedWeight === 'bolder' || parseInt(normalizedWeight, 10) >= 700) {
        fontFace = 'Bold';
    } else if (normalizedWeight === 'light' || normalizedWeight === 'lighter' || parseInt(normalizedWeight, 10) <= 300) {
        fontFace = 'Light';
    } else if (normalizedWeight === 'normal' || normalizedWeight === 'regular') {
        fontFace = 'Default';
    }

    switch (normalizedStyle) {
        case '':
        case 'normal':
            // keep weight-driven face
            break;
        case 'italic':
        case 'oblique':
            fontFace = fontFace === 'Bold' ? 'Bold Italic' : 'Italic';
            break;
        case 'bold italic':
        case 'italic bold':
            fontFace = 'Bold Italic';
            break;
        default:
            fontFace = fontStyle ?? fontFace;
            break;
    }

    return fontFace;
}

export function parseFontSkewAmount(fontStyle?: string): number {
    if (typeof fontStyle !== 'string') {
        return 0;
    }

    if (fontStyle.includes('oblique')) {
        const obliqueMatch = fontStyle.match(/oblique\s+(\d+)deg/);
        if (obliqueMatch && obliqueMatch[1]) {
            const angleDegrees = parseInt(obliqueMatch[1], 10);
            // Convert degrees to radians (UE uses radians for skew)
            const angleRadians = angleDegrees * (Math.PI / 180);
            return angleRadians;
        }
    }

    return 0;
}

export function parseFontFamily(cssText: unknown) {
    if (typeof cssText !== 'string') {
        return [];
    }

    const match = cssText.match(/\s*:\s*([^;]+);?/i);
    const rawValue = (match ? match[1] : cssText).trim();

    if (!rawValue) {
        return [];
    }

    // 使用正则处理带引号和不带引号的字体名
    const fonts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < rawValue.length; i++) {
        const char = rawValue[i];

        if (char === '"' || char === "'") {
            if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (quoteChar === char) {
                inQuotes = false;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            if (current.trim().length > 0) {
                fonts.push(current.trim());
            }
            current = '';
        } else {
            current += char;
        }
    }

    if (current.trim()) {
        fonts.push(current.trim());
    }

    return fonts
        .map(f => f.replace(/^["']|["']$/g, '').trim())
        .filter(f => f.length > 0);
}

export function parseOutline(outline?: string, style?: any) {
    // Parse outline with pattern: <width> || <style> || <color>
    if (typeof outline !== 'string') {
        return {};
    }

    const parts = outline.match(/(?:rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]{3,8}|[^\s]+)/gi) ?? [];
    const result: any = {};

    for (const part of parts) {
        if (/^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/i.test(part)) {
            result.outlineStyle = part.toLowerCase();
            continue;
        }

        if (/^(?:#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i.test(part)) {
            result.outlineColor = parseToLinearColor(part);
            continue;
        }

        // Width - assume it's a length value; fall back to numeric parsing
        const convertedWidth = convertLengthUnitToSlateUnit(part, style);
        if (convertedWidth !== undefined && convertedWidth !== null) {
            result.outlineWidth = convertedWidth;
        }
    }

    if (parts.length === 1 && !result.outlineWidth && !result.outlineColor) {
        result.outlineStyle = parts[0].toLowerCase();
    }

    return result;
}

export function parseFont(style: any) {
    let result = {};
    result['fontSize'] = parseFontSize(style?.fontSize, style);
    result['fontColor'] = parseToLinearColor(style?.color);
    result['textAlign'] = parseTextAlign(style?.textAlign);
    result['letterSpacing'] = convertLengthUnitToSlateUnit(style?.letterSpacing, style);
    result['wordSpacing'] = convertLengthUnitToSlateUnit(style?.wordSpacing, style);
    result['fontFamily'] = parseFontFamily(style?.fontFamily);
    result['fontFaceName'] = parseFontFaceName(style?.fontStyle, style?.fontWeight);
    result['fontSkewAmount'] = parseFontSkewAmount(style?.fontStyle);
    const {outlineStyle, outlineColor, outlineWidth} = parseOutline(style?.outline, style);
    result['outlineStyle'] = outlineStyle;
    result['outlineColor'] = outlineColor;
    result['outlineWidth'] = outlineWidth;
    if (style?.outlineColor) {
        result['outlineColor'] = parseToLinearColor(style?.outlineColor);
    }
    if (style?.outlineWidth) {
        result['outlineWidth'] = convertLengthUnitToSlateUnit(style?.outlineWidth, style);
    }

    return result;
}

export function setupFontStyles(outer: UE.Object, font: UE.SlateFontInfo, fontStyle: any) 
{
    if (fontStyle?.fontSize) {
        font.Size = parseFontSize(fontStyle?.fontSize, fontStyle);
    }
    if (fontStyle?.fontStyle) {
        font.SkewAmount = parseFontSkewAmount(fontStyle?.fontStyle);
    }
    if (fontStyle?.fontWeight) {
        font.TypefaceFontName = parseFontFaceName(fontStyle?.fontStyle, fontStyle?.fontWeight);
    }
    if (fontStyle?.fontFamily) {
        const fontFamilyArray = parseFontFamily(fontStyle?.fontFamily);
        if (fontFamilyArray.length === 0) {
            fontFamilyArray.push('Roboto'); // default font family
        }

        if (fontFamilyArray.includes('monospace')) {
            font.bForceMonospaced = true;
        }

        const width = fontStyle?.width;
        if (width) {
            font.MonospacedWidth = convertLengthUnitToSlateUnit(width, fontStyle);
        }

        let familyNames = UE.NewArray(UE.BuiltinString);
        for (const family of fontFamilyArray) {
            familyNames.Add(family);
        }

        const fontObject = UE.UMGManager.FindFontFamily(familyNames, outer);
        if (fontObject) {
            font.FontObject = fontObject;
        }
    } else if (!font.FontObject) {
        let familyNames = UE.NewArray(UE.BuiltinString);
        familyNames.Add('Roboto');
        font.FontObject = UE.UMGManager.FindFontFamily(familyNames, outer);
    }

    if (fontStyle?.letterSpacing) {
        font.LetterSpacing = convertLengthUnitToSlateUnit(fontStyle?.letterSpacing, fontStyle);
    }

    if (fontStyle?.wordSpacing) {
        font.LetterSpacing = convertLengthUnitToSlateUnit(fontStyle?.wordSpacing, fontStyle);
    }

    if (fontStyle?.outline) {
        const outlineResult = parseOutline(fontStyle?.outline, fontStyle);
        if (outlineResult.outlineWidth !== undefined) {
            font.OutlineSettings.OutlineSize = outlineResult.outlineWidth;
        }
        if (outlineResult.outlineColor) {
            font.OutlineSettings.OutlineColor.R = outlineResult.outlineColor.r;
            font.OutlineSettings.OutlineColor.G = outlineResult.outlineColor.g;
            font.OutlineSettings.OutlineColor.B = outlineResult.outlineColor.b;
            font.OutlineSettings.OutlineColor.A = outlineResult.outlineColor.a;
        }
    }

    if (fontStyle?.outlineColor) {
        const outlineColor = parseToLinearColor(fontStyle?.outlineColor);
        font.OutlineSettings.OutlineColor.R = outlineColor.r;
        font.OutlineSettings.OutlineColor.G = outlineColor.g;
        font.OutlineSettings.OutlineColor.B = outlineColor.b;
        font.OutlineSettings.OutlineColor.A = outlineColor.a;
    }

    if (fontStyle?.outlineWidth) {
        font.OutlineSettings.OutlineSize = convertLengthUnitToSlateUnit(fontStyle?.outlineWidth, fontStyle);
    }
}

export function hasFontStyles(style: any) {
    const styleNames = ['fontSize', 'fontStyle', 'fontWeight', 'fontFamily', 
        'letterSpacing', 'wordSpacing', 'outline', 'outlineColor', 'outlineWidth'];
    for (const styleName of styleNames) {
        if (isKeyOfRecord(styleName, style)) {
            return true;
        }
    }
    return false;
}
