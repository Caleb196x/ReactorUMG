import { getInlineStyles, normalizePseudo } from './inline_style_registry';

export function getStylesFromClassSelector(className: string, pseudo?: string): Record<string, any> {
    if (!className) {
        return {};
    }

    let classNameStyles = {};
    if (className) {
        // Split multiple classes
        const classNames = className.split(' ');
        for (const className of classNames) {
            // Get styles associated with this class name
            let classStyle = {};
            const normalizedPseudo = normalizePseudo(pseudo);
            if (className.startsWith("uniquescope_")) {
                  classStyle = getCssStyleFromGlobalCache(className, normalizedPseudo) 
                    || (normalizedPseudo.startsWith(':') ? getCssStyleFromGlobalCache(className, normalizedPseudo.slice(1)) : undefined);
            } else {
                classStyle = getCssStyleFromGlobalCache("." + className, normalizedPseudo) 
                    || (normalizedPseudo.startsWith(':') ? getCssStyleFromGlobalCache("." + className, normalizedPseudo.slice(1)) : undefined);
            }

            if (classStyle) {
                // Merge the class styles into our style object
                classNameStyles = { ...classNameStyles, ...classStyle };
            }
            const inlineStyle = getInlineStyles('class', className, normalizedPseudo);
            if (inlineStyle) {
                classNameStyles = { ...classNameStyles, ...inlineStyle };
            }
        }
    }

    return classNameStyles;
}

export function getStyleFromIdSelector(id: string, pseudo?: string): Record<string, any> {
    if (!id) {
        return {};
    }

    const normalizedPseudo = normalizePseudo(pseudo);
    const idStyle = getCssStyleFromGlobalCache("#" + id, normalizedPseudo)
        || (normalizedPseudo.startsWith(':') ? getCssStyleFromGlobalCache("#" + id, normalizedPseudo.slice(1)) : undefined);
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
    // typeStyle < classNameStyles < idStyle < inlineStyles
    return { ...classNameStyles, ...idStyle, ...typeStyle, ...inlineStyles };
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

