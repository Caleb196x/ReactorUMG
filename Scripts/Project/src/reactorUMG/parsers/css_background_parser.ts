import * as UE from 'ue';
import { ImageLoader } from '../misc/image_loader';
import { parseToLinearColor } from './css_color_parser';
import { convertLengthUnitToSlateUnit } from './css_length_parser';

function parseBackgroundLayer(layer) {
    const REPEAT_KEYWORDS = {
        'repeat-x': 1, 'repeat-y': 1, 'repeat': 1,
        'space': 1, 'round': 1, 'no-repeat': 1
    };
      
    const ATTACHMENT_KEYWORDS = {
    'scroll': 1, 'fixed': 1, 'local': 1
    };
    
    const POSITION_KEYWORDS = new Set([
    'left', 'right', 'top', 'bottom', 'center'
    ]);

    const state = {
      color: 'none',
      image: 'none',
      position: 'none',
      size: 'none',
      repeat: 'none',
      attachment: 'scroll'
    };
  
    // 提取颜色（按规范应出现在最后）
    const colorMatch = layer.match(/(?:^|\s)(#[0-9a-fA-F]{3,8}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*\d*\.?\d+)?\s*\)|hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*\d*\.?\d+)?\s*\)|\b[a-zA-Z]+\b)(?=\s*$)/);
    if (colorMatch) {
      state.color = colorMatch[1];
      layer = layer.slice(0, colorMatch.index).trim();
    }
  
    // 拆分 token（处理带空格的图片）
    const tokens = [];
    const regex = /(url\([^)]+\))/g;
    let match;
    while ((match = regex.exec(layer)) !== null) {
      tokens.push(match[1]);
    }
  
    // 解析其他属性
    let positionBuffer = [];
    let hasSlash = false;
  
    tokens.forEach(token => {
      if (token.startsWith('url(') || token.match(/^[\w-]+\(/)) {
        state.image = token;
      } else if (token === '/') {
        hasSlash = true;
      } else if (hasSlash) {
        state.size = token;
        hasSlash = false;
      } else if (token in REPEAT_KEYWORDS) {
        state.repeat = token;
      } else if (token in ATTACHMENT_KEYWORDS) {
        state.attachment = token;
      } else if (POSITION_KEYWORDS.has(token) || token.match(/^[\d%.]+$/)) {
        positionBuffer.push(token);
      }
    });
  
    // 处理位置/尺寸
    // fixme@Caleb196x: 解析的有点问题
    if (positionBuffer.length > 0) {
      const slashIndex = positionBuffer.indexOf('/');
      if (slashIndex > -1) {
        state.position = positionBuffer.slice(0, slashIndex).join(' ');
        state.size = positionBuffer.slice(slashIndex + 1).join(' ');
      } else {
        state.position = positionBuffer.join(' ');
      }
    }
  
    return state;
}

type Alignment = {horizontal: UE.EHorizontalAlignment, 
    vertical: UE.EVerticalAlignment, padding: UE.Margin};

function isDirectionKeyword(value: string) : boolean {
    return ['top', 'bottom', 'left', 'right', 'center'].includes(value);
}

const horizontalMap = {
    'left': UE.EHorizontalAlignment.HAlign_Left,
    'right': UE.EHorizontalAlignment.HAlign_Right,
    'center': UE.EHorizontalAlignment.HAlign_Center,
    '_': UE.EHorizontalAlignment.HAlign_Fill,
}

const verticalMap = {
    'top': UE.EVerticalAlignment.VAlign_Top,
    'bottom': UE.EVerticalAlignment.VAlign_Bottom,
    'center': UE.EVerticalAlignment.VAlign_Center,
    '_': UE.EVerticalAlignment.VAlign_Fill,
}

/**
 * 
 * @param parts 
 * @param result 
 * @returns 
 */
function parsePositionTwoValueRules(parts: string[], result: Alignment): Alignment {
    if (parts.length !== 2) {
        throw new Error("Must be two values for background position");
    }

    let xAxis = { type: null, value: "0" }; // 类型：horizontal/vertical/value
    let yAxis = { type: null, value: "0" };

    // 解析每个部分的属性
    const parsePart = (part) => ({
        isHorizontal: ["left", "right"].includes(part),
        isVertical: ["top", "bottom"].includes(part),
        isCenter: part === "center",
        isNumeric: /^[\d%.]+$/.test(part)
    });

    const p1 = parsePart(parts[0]);
    const p2 = parsePart(parts[1]);

    // 规则 1: 两个关键字（必须水平+垂直）
    if ((p1.isHorizontal || p1.isVertical || p1.isCenter) && 
        (p2.isHorizontal || p2.isVertical || p2.isCenter)) 
    {
        xAxis.type = p1.isHorizontal ? "horizontal" : p2.isHorizontal ? "horizontal" : "value";
        yAxis.type = p1.isVertical ? "vertical" : p2.isVertical ? "vertical" : "value";

        xAxis.value = p1.isHorizontal || p1.isCenter ? parts[0] : 
                        p2.isHorizontal ? parts[1] : "center";
        yAxis.value = p1.isVertical || p1.isCenter ? parts[0] : 
                        p2.isVertical ? parts[1] : "center";
    }// 规则 2: 关键字 + 数值（顺序敏感）
    else if ((p1.isHorizontal && p2.isNumeric) || 
            (p1.isVertical && p2.isNumeric) || 
            (p1.isNumeric && p2.isVertical)) 
    {
        // 水平关键字 + 数值（如 "right 20px"）
        if (p1.isHorizontal) {
            xAxis = { type: "horizontal", value: parts[0] };
            yAxis = { type: "value", value: parts[1] };
        }
        // 数值 + 垂直关键字（如 "20% bottom"）
        else if (p2.isVertical) {
            xAxis = { type: "value", value: parts[0] };
            yAxis = { type: "vertical", value: parts[1] };
        }
        // 垂直关键字 + 数值（如 "top 10px"）
        else if (p1.isVertical) {
            xAxis = { type: "value", value: parts[1] };
            yAxis = { type: "vertical", value: parts[0] };
        }
    } // 规则 3: 两个数值（如 "30% 60%"）
    else if (p1.isNumeric && p2.isNumeric) {
        xAxis = { type: "value", value: parts[0] };
        yAxis = { type: "value", value: parts[1] };
    }

    // 映射到 UMG 参数
    const applyAxis = (axis, isHorizontal) => {
        if (axis.type === "horizontal") {
            result.horizontal = axis.value === "left" ? UE.EHorizontalAlignment.HAlign_Left : 
                                axis.value === "right" ? UE.EHorizontalAlignment.HAlign_Right : UE.EHorizontalAlignment.HAlign_Center;

            if (axis.value === "left") result.padding.Right = 0;
            if (axis.value === "right") result.padding.Left = 0;

        } else if (axis.type === "vertical") {
            result.vertical = axis.value === "top" ? UE.EVerticalAlignment.VAlign_Top : 
                            axis.value === "bottom" ? UE.EVerticalAlignment.VAlign_Bottom : UE.EVerticalAlignment.VAlign_Center;
            
            if (axis.value === "top") result.padding.Bottom = 0;
            if (axis.value === "bottom") result.padding.Top = 0;

        } else if (axis.type === "value") {
            if (isHorizontal) {
                result.horizontal = UE.EHorizontalAlignment.HAlign_Fill;
                if (axis.value === "center") {
                    result.horizontal = UE.EHorizontalAlignment.HAlign_Center;
                } else {
                    result.padding.Left = convertLengthUnitToSlateUnit(axis.value, undefined);
                    result.padding.Right = 0;
                }
            } else {
                result.vertical = UE.EVerticalAlignment.VAlign_Fill;
                if (axis.value === "center") {
                    result.vertical = UE.EVerticalAlignment.VAlign_Center;
                } else {
                    result.padding.Top = convertLengthUnitToSlateUnit(axis.value, undefined);
                    result.padding.Bottom = 0;
                }
            }
        }
    };

    applyAxis(xAxis, true);  // 处理 X 轴
    applyAxis(yAxis, false); // 处理 Y 轴

    return result;
}

function parsePositionThreeAndFourValueRules(parts: string[], result: Alignment): Alignment {
    if (parts.length !== 3 && parts.length !== 4) {
        throw new Error("Must be three or four values for background position");
    }

    const isKeyword = str => /^(left|right|top|bottom|center)$/.test(str);
    const isHorizontalKeyword = k => ["left", "right", "center"].includes(k);
    const isVerticalKeyword = k => ["top", "bottom", "center"].includes(k);
    const isAxisCompatible = (k1, k2) => 
      (isHorizontalKeyword(k1) && isVerticalKeyword(k2)) ||
      (isVerticalKeyword(k1) && isHorizontalKeyword(k2));

    // 参数分组
    const groups = [];
    let currentGroup = [];
    for (const part of parts) {
        if (isKeyword(part)) {
        if (currentGroup.length > 0) groups.push(currentGroup);
            currentGroup = [part];
        } else {
            currentGroup.push(part);
        }
    }
    groups.push(currentGroup);

      // 验证分组结构
    if (groups.length !== 2 || groups.some(g => g.length > 2)) {
        throw new Error(`Invalid multi-value syntax: ${parts.join(" ")}`);
    }

    // 解析 X/Y 轴参数（兼容缺失的偏移量）
    const [xParts, yParts] = groups.map(g => ({
        key: g[0],
        offset: g[1] || "0px" // 三值语法时补充默认偏移量
    }));

    if (!isAxisCompatible(xParts.key, yParts.key)) {
        // using two value rules
        return parsePositionTwoValueRules([parts[0], parts[1]], result);
    }

    // 处理 X/Y 轴参数
    const applyAxis = ({key, offset}, isHorizontal) => {
        if (isHorizontal) {
            result.horizontal = horizontalMap[key] || UE.EHorizontalAlignment.HAlign_Center;

            switch (key) {
                case 'left':
                    result.padding.Left = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Right = 0;
                    break;
                case 'right':
                    result.padding.Right = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Left = 0;
                    break;
                case 'center':
                    result.padding.Left = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Right = 0;
                    break;
                default:
                    result.padding.Left = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Right = 0;
            }
        } else {
            result.vertical = verticalMap[key] || UE.EVerticalAlignment.VAlign_Center;

            switch (key) {
                case 'top':
                    result.padding.Top = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Bottom = 0;
                    break;
                case 'bottom':
                    result.padding.Bottom = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Top = 0;
                    break;
                case 'center':
                    result.padding.Top = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Bottom = 0;
                    break;
                default:
                    result.padding.Top = convertLengthUnitToSlateUnit(offset, undefined);
                    result.padding.Bottom = 0;
            }
        }
    }

    applyAxis(xParts, true);
    applyAxis(yParts, false);

    return result;
}

/**
 * 外部可调用接口
 */
export function parseBackgroundPosition(backgroundPosition: string) : any {
    const parts = backgroundPosition.split(/[\s,]+/).filter(p => p !== "");
    console.log(parts);
    let result: Alignment = {
        horizontal: UE.EHorizontalAlignment.HAlign_Center,
        vertical: UE.EVerticalAlignment.VAlign_Center,
        padding: new UE.Margin(0, 0, 0, 0)
    }

    if (parts.length === 1) {
        if (isDirectionKeyword(parts[0])) {
            result.horizontal = horizontalMap[parts[0]] || UE.EHorizontalAlignment.HAlign_Center;
            result.vertical = verticalMap[parts[0]] || UE.EVerticalAlignment.VAlign_Center;
        } else {
            result.horizontal = UE.EHorizontalAlignment.HAlign_Fill;
            result.vertical = UE.EVerticalAlignment.VAlign_Center;
            const length = convertLengthUnitToSlateUnit(parts[0], undefined);
            result.padding.Left = length;
        }
    } else if (parts.length === 2) {
        result = parsePositionTwoValueRules(parts, result);
    } else if (parts.length === 3 || parts.length === 4) {
        result = parsePositionThreeAndFourValueRules(parts, result);
    }
    
    return result;
}

export function parseBackgroundImage(backgroundImage: string, backgroundSize: string) : UE.SlateBrush | undefined {
    let brush = new UE.SlateBrush();
    brush.DrawAs = UE.ESlateBrushDrawType.Image;
    if (!backgroundImage) {
        return brush;
    }

    if (typeof backgroundImage !== 'string') {
        brush.ResourceObject = backgroundImage as UE.Texture2D;
        return brush;
    }

    let imagePath = backgroundImage;

    // Handle template literal with imported texture
    const templateMatch = backgroundImage.match(/`url\(\${(.*?)}\)`/);
    if (templateMatch && templateMatch[1]) {
        const textureName = templateMatch[1].trim();
        imagePath = textureName;
    }

    // Handle url() format if present
    const urlMatch = backgroundImage.match(/url\((.*?)\)/);
    if (urlMatch && urlMatch[1]) {
        imagePath = urlMatch[1].trim();
        // Remove quotes if present
        imagePath = imagePath.replace(/['"]/g, '');
    }
    // If not url() format, use the path directly
    else {
        imagePath = backgroundImage.trim();
        imagePath = imagePath.replace(/['"]/g, ''); // Still remove quotes if any
    }

    // Basic path validation
    if (!imagePath || imagePath.length === 0) {
        return null;
    }

    // Check for invalid characters in path
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(imagePath)) {
        console.warn(`Invalid characters in image path: ${imagePath}`);
        return null;
    }

    // Check file extension
    const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.tga'];
    const hasValidExtension = validExtensions.some(ext => 
        imagePath.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
        console.warn(`Invalid image file extension: ${imagePath}`);
        return null;
    }

    // Check if file exists
    const texture = ImageLoader.loadTextureFromImagePath(imagePath);
    if (!texture) {
        console.warn(`Failed to load texture from image path: ${imagePath}`);
    } else {
        brush.ResourceObject = texture;
    }

    // parse backgroundSize
    if (backgroundSize) {
        const sizeValues = backgroundSize.split(' ');
        if (sizeValues.length === 1) {
            if (sizeValues[0] === 'cover' || sizeValues[0] === 'auto') {
                brush.Tiling = UE.ESlateBrushTileType.NoTile;
            } else if (sizeValues[0] === 'contain') {
                brush.Tiling = UE.ESlateBrushTileType.Both;
            } else {
                brush.ImageSize.X = Number(sizeValues[0]);
                brush.ImageSize.Y = Number(sizeValues[0]);
            }
        } else if (sizeValues.length === 2) {
            brush.Tiling = UE.ESlateBrushTileType.Both;
            brush.ImageSize.X = Number(sizeValues[0]);
            brush.ImageSize.Y = Number(sizeValues[1]);
        }
    }

    return brush;
}

export function parseBackgroundColor(backgroundColor: string) : UE.LinearColor {
    const color = parseToLinearColor(backgroundColor);
    return new UE.LinearColor(color.r, color.g, color.b, color.a);
}

export function parseBackgroundRepeat(backgroundRepeat: string, image: UE.SlateBrush) : UE.SlateBrush {
    if (!image) {
        return image;
    }

    if (backgroundRepeat === 'no-repeat') {
        image.Tiling = UE.ESlateBrushTileType.NoTile;
    } else if (backgroundRepeat === 'repeat') {
        image.Tiling = UE.ESlateBrushTileType.Both;
    } else if (backgroundRepeat === 'repeat-x') {
        image.Tiling = UE.ESlateBrushTileType.Horizontal;
    } else if (backgroundRepeat === 'repeat-y') {
        image.Tiling = UE.ESlateBrushTileType.Vertical;
    }

    return image;
}

export function parseBackground(background: string) : any {
    // 1. 提取background中定义的background-color值
    // 2. 提取出background中定义的background-position值
    // 3. 提取出background中定义的background-repeat值
    // 4. 提取出background中定义的background-image值
    if (!background) {
        return {};
    }

    const { 
        color, 
        image, 
        position, 
        size, 
        repeat, 
        attachment 
    } = parseBackgroundLayer(background);

    let result = {};
    if (color !== 'none') {
        result['color'] = parseBackgroundColor(color);
    }

    if (image !== 'none') {
        result['image'] = parseBackgroundImage(image, size);
        result['image'] = parseBackgroundRepeat(repeat, result['image']);
    }

    if (position !== 'none') {
        result['position'] = parseBackgroundPosition(position);
    }

    return result;
}

export function parseBackgroundProps(style: any): any {
    // image转换成brush image
    // repeat转换成image中的tiling模式
    // position转换成alignment和padding

    let result = {};
    const background = style?.background;
    if (background) {
        result = parseBackground(background);
    }

    const backgroundColor = style?.backgroundColor;
    if (backgroundColor) {
        result['color'] = parseBackgroundColor(backgroundColor);
    }

    const backgroundImage = style?.backgroundImage;
    const backgroundSize = style?.backgroundSize;
    if (backgroundImage) {
        result['image'] = parseBackgroundImage(backgroundImage, backgroundSize);
    }

    const backgroundRepeat = style?.backgroundRepeat;
    if (backgroundRepeat && result['image']) {
        result['image'] = parseBackgroundRepeat(backgroundRepeat, result['image']);
    }

    return result;
}