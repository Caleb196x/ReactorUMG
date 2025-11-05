import * as UE from 'ue';
import * as CssType from 'csstype';
import { safeParseFloat } from '../misc/utils';
import { convertLengthUnitToSlateUnit } from './css_length_parser';

export function parseCursor(cursor: string) {
    if (!cursor) {
        return null;
    }

    switch (cursor) {
        case 'none':
            return UE.EMouseCursor.None;
        case 'text':
            return UE.EMouseCursor.TextEditBeam;
        case 'ew-resize':
        case 'col-resize':
            return UE.EMouseCursor.ResizeLeftRight;
        case 'ns-resize':
        case 'row-resize':
            return UE.EMouseCursor.ResizeUpDown;
        case 'se-resize':
            return UE.EMouseCursor.ResizeSouthEast;
        case 'sw-resize':
            return UE.EMouseCursor.ResizeSouthWest;
        case 'crosshair':
            return UE.EMouseCursor.Crosshairs;
        case 'pointer':
            return UE.EMouseCursor.Hand;
        case 'grab':
            return UE.EMouseCursor.GrabHand;
        case 'grabbing':
            return UE.EMouseCursor.GrabHandClosed;
        case 'not-allowed':
            return UE.EMouseCursor.SlashedCircle;
        case 'copy':
            return UE.EMouseCursor.EyeDropper;
        default:
            return UE.EMouseCursor.Default;
    }
}

export function parseTransform(transform: CssType.Property.Transform, translate?: CssType.Property.Translate, rotate?: CssType.Property.Rotate): UE.WidgetTransform {
    if (!transform) {
        return null;
    }

    const result = {
        translation: new UE.Vector2D(0, 0),
        scale: new UE.Vector2D(1, 1), 
        shear: new UE.Vector2D(0, 0),
        angle: 0
    };

    // Parse transform string like "translate(10px, 20px) rotate(45deg) scale(2)"
    let transformParts = transform.match(/\w+\([^)]+\)/g) || [];

    const parseAngle = (angle: string | number) => {
        if (typeof angle === 'number') {
            return angle;
        }

        if (!angle) return 0;
        
        // Extract numeric value and unit
        const match = angle.match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)?$/);
        if (!match) return 0;

        const value = safeParseFloat(match[1]);
        const unit = match[2] || 'deg';

        // Convert to degrees based on unit
        switch (unit) {
            case 'rad':
                return value * 180 / Math.PI;
            case 'turn': 
                return value * 360;
            case 'grad':
                return value * 0.9;
            case 'deg':
            default:
                return value;
        }
    }

    if (translate) {
        const values = translate.trim().split(' ');
        const x = values[0] || '0px';
        const y = values[1] || '0px';

        const contactValues = {translateX: convertLengthUnitToSlateUnit(x, {}), translateY: convertLengthUnitToSlateUnit(y, {})}
        transformParts = {...transformParts, ...contactValues}
    }

    if (rotate) {
        // Match both simple angle format and axis-specific rotation format
        // Examples: "45deg", "x 10deg", "y 4rad", "z 90grad"
        const axisMatch = rotate.match(/^([xyz])?\s*(-?\d*\.?\d+)(deg|rad|turn|grad)?$/);
        if (!axisMatch) {
            return;
        }
        
        // If there's an axis specified (x, y, z), we only care about z-axis for 2D transforms
        // For x and y rotations, we would ignore them as they're not applicable in 2D UMG
        const axis = axisMatch[1];
        if (axis === 'x' || axis === 'y') {
            return; // Skip x and y axis rotations for 2D transforms
        }

        // fixme@Caleb196x: 45deg这种形式是否能正确解析？？

        const value = safeParseFloat(axisMatch[2]);
        const unit = axisMatch[3] || 'deg';
        // Convert to degrees based on unit
        let angle = 0;
        switch (unit) {
            case 'rad':
                angle = value * 180 / Math.PI;
                break;
            case 'turn':
                angle = value * 360;
                break;
            case 'grad':
                angle = value * 0.9;
                break;
            case 'deg':
            default:
                angle = value;
                break;
        }

        const contactValues = {rotate: angle}
        transformParts = {...transformParts, ...contactValues}
    }

    transformParts.forEach(part => {
        if (!part || typeof part !== 'string') {
            return;
        }

        const trimmedPart = (part as string).trim();
        let property = trimmedPart;
        let values: string[] = [];

        const openParenIndex = trimmedPart.indexOf('(');
        if (openParenIndex !== -1) {
            const closeParenIndex = trimmedPart.lastIndexOf(')');
            property = trimmedPart.slice(0, openParenIndex).trim();
            const innerValues = closeParenIndex > openParenIndex
                ? trimmedPart.slice(openParenIndex + 1, closeParenIndex)
                : trimmedPart.slice(openParenIndex + 1);

            values = innerValues
                .split(/[,\s]+/)
                .map(value => value.trim())
                .filter(value => value.length > 0);
        }

        switch (property) {
            case 'translate':
            case 'translate3d':
                result.translation.X = convertLengthUnitToSlateUnit(values[0] || '0px', {});
                result.translation.Y = convertLengthUnitToSlateUnit(values[1] || '0px', {});
                break;

            case 'translateX':
                result.translation.X = convertLengthUnitToSlateUnit(values[0] || '0px', {});
                break;

            case 'translateY': 
                result.translation.Y = convertLengthUnitToSlateUnit(values[0] || '0px', {});
                break;

            case 'scale':
            case 'scale3d':
                result.scale.X = safeParseFloat(values[0]);
                result.scale.Y = safeParseFloat(values[1] || values[0]);
                break;

            case 'scaleX':
                result.scale.X = safeParseFloat(values[0]);
                break;

            case 'scaleY':
                result.scale.Y = safeParseFloat(values[0]);
                break;

            case 'rotate':
            case 'rotateZ':
                result.angle = parseAngle(values[0]);
                break;

            case 'skew':
                result.shear.X = parseAngle(values[0]);
                result.shear.Y = parseAngle(values[1]);
                break;

            case 'skewX':
                result.shear.X = parseAngle(values[0]);
                break;

            case 'skewY':
                result.shear.Y = parseAngle(values[0]);
                break;
            case 'matrix':
                // matrix(a, b, c, d, tx, ty)
                // [a c tx]
                // [b d ty]
                // [0 0 1 ]
                result.scale.X = safeParseFloat(values[0]); // a - scale x
                result.scale.Y = safeParseFloat(values[3]); // d - scale y
                // Convert skew matrix values to angles in degrees (-90 to 90)
                result.shear.X = Math.max(-90, Math.min(90, safeParseFloat(values[2])) * 180 / Math.PI); // c - skew x angle
                result.shear.Y = Math.max(-90, Math.min(90, safeParseFloat(values[1])) * 180 / Math.PI); // b - skew y angle
                result.translation.X = safeParseFloat(values[4]); // tx - translate x
                result.translation.Y = safeParseFloat(values[5]); // ty - translate y
                break;

            case 'matrix3d':
                // matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
                // Only use the 2D transformation components
                result.scale.X = safeParseFloat(values[0]); // a - scale x
                result.scale.Y = safeParseFloat(values[5]); // d - scale y
                result.shear.X = Math.max(-90, Math.min(90, safeParseFloat(values[4])) * 180 / Math.PI); // c - skew x angle
                result.shear.Y = Math.max(-90, Math.min(90, safeParseFloat(values[1])) * 180 / Math.PI); // b - skew y angle
                result.translation.X = safeParseFloat(values[12]); // tx - translate x
                result.translation.Y = safeParseFloat(values[13]); // ty - translate y
                break;
        }
    });

    return new UE.WidgetTransform(
            result.translation,
            result.scale,
            result.shear,
            result.angle
        );
}

export function parseTransformPivot(transformOrigin: CssType.Property.TransformOrigin ): UE.Vector2D {
    if (!transformOrigin) {
        return null;
    }

    const result = {
        pivot: new UE.Vector2D(0.5, 0.5)
    };

    // Parse transform origin values (e.g., "center", "50% 50%", "top left", etc.)
    const originValues = transformOrigin.split(' ');
    
    // Handle X position (horizontal)
    if (originValues.length > 0) {
        const xValue = originValues[0].trim();
        if (xValue === 'left') {
            result.pivot.X = 0;
        } else if (xValue === 'center') {
            result.pivot.X = 0.5;
        } else if (xValue === 'right') {
            result.pivot.X = 1;
        } else if (xValue.endsWith('%')) {
            // Convert percentage to 0-1 range
            const percentage = parseFloat(xValue) / 100;
            result.pivot.X = Math.max(0, Math.min(1, percentage));
        } else {
            // For pixel values or other units, we'd need the element size
            // Default to center if we can't determine
            result.pivot.X = 0.5;
        }
    }
    
    // Handle Y position (vertical)
    if (originValues.length > 1) {
        const yValue = originValues[1].trim();
        if (yValue === 'top') {
            result.pivot.Y = 0;
        } else if (yValue === 'center') {
            result.pivot.Y = 0.5;
        } else if (yValue === 'bottom') {
            result.pivot.Y = 1;
        } else if (yValue.endsWith('%')) {
            // Convert percentage to 0-1 range
            const percentage = parseFloat(yValue) / 100;
            result.pivot.Y = Math.max(0, Math.min(1, percentage));
        } else {
            // For pixel values or other units, we'd need the element size
            // Default to center if we can't determine
            result.pivot.Y = 0.5;
        }
    } else if (originValues.length === 1) {
        // If only one value is provided, use it for both X and Y
        result.pivot.Y = result.pivot.X;
    }
    
    // todo@Caleb196x: 实现以屏幕像素位置作为锚点的转换

    return result.pivot;
}

export function parseTranslate(translate: CssType.Property.Translate) {
    if (!translate) {
        return new UE.WidgetTransform(
            new UE.Vector2D(0, 0),
            new UE.Vector2D(1, 1),
            new UE.Vector2D(0, 0),
            0
        );
    }

    // Split the translate value into components
    const values = translate.trim().split(' ');
    const x = values[0] || '0px';
    const y = values[1] || '0px';

    // Parse x and y values, handling percentages and units
    let translateX = convertLengthUnitToSlateUnit(x, {});
    let translateY = convertLengthUnitToSlateUnit(y, {});

    return new UE.WidgetTransform(
        new UE.Vector2D(translateX, translateY),
        new UE.Vector2D(1, 1), // No scale
        new UE.Vector2D(0, 0), // No shear
        0 // No rotation
    );
}

export function parseRotate(rotate: CssType.Property.Rotate) {
    if (!rotate) {
        return new UE.WidgetTransform(
            new UE.Vector2D(0, 0),
            new UE.Vector2D(1, 1),
            new UE.Vector2D(0, 0),
            0
        );
    }

    // Extract numeric value and unit
    const match = rotate.match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)?$/);
    if (!match) {
        return new UE.WidgetTransform(
            new UE.Vector2D(0, 0), 
            new UE.Vector2D(1, 1),
            new UE.Vector2D(0, 0),
            0
        );
    }

    const value = safeParseFloat(match[1]);
    const unit = match[2] || 'deg';

    // Convert to degrees based on unit
    let angle = 0;
    switch (unit) {
        case 'rad':
            angle = value * 180 / Math.PI;
            break;
        case 'turn':
            angle = value * 360;
            break;
        case 'grad':
            angle = value * 0.9;
            break;
        case 'deg':
        default:
            angle = value;
            break;
    }

    return new UE.WidgetTransform(
        new UE.Vector2D(0, 0),
        new UE.Vector2D(1, 1),
        new UE.Vector2D(0, 0),
        angle
    );
}

export function parseVisibility(visibility: string, hitTest?: string): UE.ESlateVisibility {
    if (!visibility) {
        return null;
    }

    let result = null;
    switch (visibility) {
        case 'visible':
            result = UE.ESlateVisibility.Visible;
            break;
        case 'hidden':
            result = UE.ESlateVisibility.Hidden;
            break;
        case 'collapse':
        case 'collapsed':
            result = UE.ESlateVisibility.Collapsed;
            break;
        default:
            result = UE.ESlateVisibility.Visible;
    }

    if (hitTest) {
        switch (hitTest) {
            case 'self-invisible':
                result = UE.ESlateVisibility.SelfHitTestInvisible;
            case 'self-children-invisible':
                result = UE.ESlateVisibility.HitTestInvisible;
            default:
                result = UE.ESlateVisibility.Visible;
        }
    }

    return result;
}
