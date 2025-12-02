import { getInlineStyles, normalizePseudo } from './inline_style_registry';

function mergeStyleRecords(target: Record<string, any>, addition?: Record<string, any>) {
    if (addition && Object.keys(addition).length > 0) {
        Object.assign(target, addition);
    }
}

function fetchCssSelector(selector: string, pseudo: string) {
    let style = getCssStyleFromGlobalCache(selector, pseudo);
    if (!style && pseudo.startsWith(':')) {
        style = getCssStyleFromGlobalCache(selector, pseudo.slice(1));
    }
    return style || undefined;
}

function buildAttributeSelectorsFromProps(props: any): string[] {
    if (!props) {
        return [];
    }

    const selectors: string[] = [];
    const attributeKeys = Object.keys(props);
    for (let i = 0; i < attributeKeys.length; i++) {
        const key = attributeKeys[i];
        if (key === 'children' || key.startsWith('_')) {
            continue;
        }

        const value = props[key];
        if (value === undefined || value === null || typeof value === 'function') {
            continue;
        }

        const normalizedValue = String(value).trim();
        if (!normalizedValue || normalizedValue === '[object Object]') {
            continue;
        }

        const escapedValue = normalizedValue.replace(/"/g, '\\"');
        selectors.push(`${key}="${escapedValue}"`);
    }

    return selectors;
}

function getDescendantStylesForClass(className: string, childType: string, attributeSelectors: string[], pseudo?: string): Record<string, any> {
    if (!className || !childType) {
        return {};
    }

    const normalizedChildType = childType.trim().toLowerCase();
    if (!normalizedChildType) {
        return {};
    }

    const normalizedPseudo = normalizePseudo(pseudo);
    const baseSelector = className.startsWith('uniquescope_') ? className : `.${className}`;
    const descendantSelector = `${baseSelector} ${normalizedChildType}`;
    const result: Record<string, any> = {};

    const selectors = [descendantSelector];
    for (const attributeSelector of attributeSelectors) {
        selectors.push(`${descendantSelector}[${attributeSelector}]`);
    }

    for (const selector of selectors) {
        mergeStyleRecords(result, fetchCssSelector(selector, normalizedPseudo));
    }
    mergeStyleRecords(result, getInlineStyles('class', `${className} ${normalizedChildType}`, normalizedPseudo));

    return result;
}

function getParentDescendantStyles(childType: string, props: any, attributeSelectors: string[], pseudo?: string): Record<string, any> {
    const parentClassName = props?.__parentProps?.className ?? undefined;
    if (!parentClassName || typeof parentClassName !== 'string') {
        return {};
    }

    const classTokens = parentClassName.split(/\s+/).filter(token => token);
    if (classTokens.length === 0) {
        return {};
    }

    const result: Record<string, any> = {};
    for (const parentClass of classTokens) {
        mergeStyleRecords(result, getDescendantStylesForClass(parentClass, childType, attributeSelectors, pseudo));
    }

    return result;
}

function getAttributeSelectorStylesForType(childType: string, attributeSelectors: string[], pseudo?: string): Record<string, any> {
    if (!childType || attributeSelectors.length === 0) {
        return {};
    }

    const normalizedChildType = childType.trim().toLowerCase();
    if (!normalizedChildType) {
        return {};
    }

    const normalizedPseudo = normalizePseudo(pseudo);
    const result: Record<string, any> = {};
    for (const attributeSelector of attributeSelectors) {
        mergeStyleRecords(result, fetchCssSelector(`${normalizedChildType}[${attributeSelector}]`, normalizedPseudo));
    }

    return result;
}

export function getStylesFromClassSelector(className: string, pseudo?: string): Record<string, any> {
    if (!className) {
        return {};
    }

    let classNameStyles = {};
    const normalizedPseudo = normalizePseudo(pseudo);

    // Split multiple classes
    const classNames = className.split(' ');
    for (const token of classNames) {
        if (!token) continue;
        const baseSelector = token.startsWith('uniquescope_') ? token : `.${token}`;
        const classStyle = fetchCssSelector(baseSelector, normalizedPseudo);
        mergeStyleRecords(classNameStyles, classStyle);

        const inlineStyle = getInlineStyles('class', token, normalizedPseudo);
        mergeStyleRecords(classNameStyles, inlineStyle);
    }

    return classNameStyles;
}

export function getStyleFromIdSelector(id: string, pseudo?: string): Record<string, any> {
    if (!id) {
        return {};
    }

    const normalizedPseudo = normalizePseudo(pseudo);
    const idStyle = getCssStyleFromGlobalCache(`#${id}`, normalizedPseudo)
        || (normalizedPseudo.startsWith(':') ? getCssStyleFromGlobalCache(`#${id}`, normalizedPseudo.slice(1)) : undefined);
    const inlineStyle = getInlineStyles('id', id, normalizedPseudo);
    if (inlineStyle) {
        return { ...(idStyle || {}), ...inlineStyle };
    }
    return idStyle;
}

export function getStyleFromTypeSelector(type: string, pseudo?: string): Record<string, any> {
    if (!type) {
        return {};
    }

    const normalizedPseudo = normalizePseudo(pseudo);
    const typeStyle = getCssStyleFromGlobalCache(type, normalizedPseudo)
        || (normalizedPseudo.startsWith(':') ? getCssStyleFromGlobalCache(type, normalizedPseudo.slice(1)) : undefined);
    const inlineStyle = getInlineStyles('type', type, normalizedPseudo);
    if (inlineStyle) {
        return { ...(typeStyle || {}), ...inlineStyle };
    }

    return typeStyle;
}

/* c8 ignore start */
function parseClassName(props: any) {
    if (!props) {
        return "";
    }

    let currentPropsClassName = props?.className;
    if (currentPropsClassName) {
        return currentPropsClassName;
    } else {
        const type = props?.type;
        const parentClassName = props?.__parentProps.className ?? "";
        if (parentClassName && type 
            && typeof parentClassName === 'string'
            && typeof type === 'string' 
        ) {
            return parentClassName + " " + type;
        }
    }

    return "";
}
/* c8 ignore end */

/**
 * 从props中获取所有渠道定义的样式
 * @param type 元素类型
 * @param props 组件属性
 * @param pseudo 是否获取伪类属性
 * @returns 
 */
export function getAllStyles(type: string, props: any, pseudo?: string): Record<string, any> {
    if (!props) {
        return {};
    }

    // get all the styles from css selector and jsx style
    const classNameStyles = getStylesFromClassSelector(props?.className, pseudo);
    
    const attributeSelectors = buildAttributeSelectorsFromProps(props);
    const attributeTypeStyles = getAttributeSelectorStylesForType(type, attributeSelectors, pseudo);
    const parentDescendantStyles = getParentDescendantStyles(type, props, attributeSelectors, pseudo);
    const idStyle = getStyleFromIdSelector(props?.id, pseudo);
    const typeStyle = getStyleFromTypeSelector(type, pseudo);
    const inlineStyles = props?.style || {};
    // When merging styles, properties from objects later in the spread order
    // will override properties from earlier objects if they have the same key.
    // This follows CSS specificity rules where:
    // 1. Type selectors (element) have lowest priority
    // 2. Class selectors have higher priority than type selectors
    // 3. ID selectors have higher priority than class selectors
    // 4. Inline styles have the highest priority
    //
    // So the order of precedence (from lowest to highest) is:
    // typeStyle < attributeTypeStyles < classNameStyles < parentDescendantStyles < idStyle < inlineStyles
    return {  ...typeStyle, ...attributeTypeStyles, ...classNameStyles, ...parentDescendantStyles, ...idStyle, ...inlineStyles };
}

export function convertCssToStyles(css: any): Record<string, any> {
    if (!css || typeof css !== 'object') {
        return {};
    }

    const result: Record<string, any> = {};
    const base = css.base;

    if (base && typeof base === 'object') {
        Object.assign(result, base);
    }

    for (const key in css) {
        if (!Object.prototype.hasOwnProperty.call(css, key) || key === 'base') {
            continue;
        }

        result[key] = css[key];
    }

    if (base !== undefined && typeof base !== 'object') {
        result.base = base;
    }

    return result;
}

/**
 * 将CSS样式的字符串格式转换为JSX样式对象
 * @param css 
 * @returns 
 */
export function convertCssToStyles2(css: string): Record<string, any> {
    // Parse the CSS string
    const styles: Record<string, any> = {};
    
    // Handle empty or invalid input
    if (!css || typeof css !== 'string') {
        return styles;
    }
    
    // Remove curly braces if they exist
    let cleanCss = css.trim();
    if (cleanCss.startsWith('{') && cleanCss.endsWith('}')) {
        cleanCss = cleanCss.substring(1, cleanCss.length - 1).trim();
    }
    
    // Split by semicolons to get individual declarations
    const declarations = cleanCss.split(';').filter(decl => decl.trim() !== '');
    
    for (const declaration of declarations) {
        // Split each declaration into property and value
        const [property, value] = declaration.split(':').map(part => part.trim());
        
        if (property && value) {
            // Convert kebab-case to camelCase
            const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            
            // Add to styles object
            styles[camelCaseProperty] = value;
        }
    }

    return styles;
}
