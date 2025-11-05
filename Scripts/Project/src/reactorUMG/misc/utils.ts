import { convertCssToStyles } from "../parsers/cssstyle_parser";

export function isKeyOfRecord(key: any, record: Record<string, any>): key is keyof Record<string, any> {
    return key in record;
}

export function isEmpty(record: Record<string, any>): boolean {
    return Object.keys(record).length === 0;
}

export function mergeClassStyleWithInlineStyle(props: any) {
    if (!props) {
        return {};
    }

    let classNameStyles = {};
    if (props?.className) {
        // Split multiple classes
        const classNames = props.className.split(' ');
        for (const className of classNames) {
            // Get styles associated with this class name
            const classStyle = getCssStyleFromGlobalCache(className);
            // todo@Caleb196x: 瑙ｆ瀽classStyle
            if (classStyle) {
                // Merge the class styles into our style object
                classNameStyles = { ...classNameStyles, ...classStyle };
            }
        }
    }

    // Merge className styles with inline styles, giving precedence to inline styles
    const mergedStyle = { ...classNameStyles, ...(props?.style || {}) };
    return mergedStyle;
}

export function twoArraysEqual<T>(a: T[], b: T[]): boolean {
    if (a === b) return true;
    const len = a.length;
    if (len !== b.length) return false;

    const isPlainObject = (v: any): v is Record<string, any> => {
        return v !== null && typeof v === 'object' && !Array.isArray(v);
    };

    const eq = (x: any, y: any): boolean => {
        if (x === y) return true;

        // Handle Date
        if (x instanceof Date && y instanceof Date) {
            return x.getTime() === y.getTime();
        }

        // Arrays
        if (Array.isArray(x) && Array.isArray(y)) {
            if (x.length !== y.length) return false;
            for (let i = 0; i < x.length; i++) {
                if (!eq(x[i], y[i])) return false;
            }
            return true;
        }

        // Plain objects
        if (isPlainObject(x) && isPlainObject(y)) {
            const xKeys = Object.keys(x);
            const yKeys = Object.keys(y);
            if (xKeys.length !== yKeys.length) return false;
            for (let i = 0; i < xKeys.length; i++) {
                const k = xKeys[i];
                if (k.startsWith("_") || k.startsWith("$$")) continue;
                if (!Object.prototype.hasOwnProperty.call(y, k)) return false;
                if (!eq(x[k], y[k])) return false;
            }
            return true;
        }

        return false;
    };

    for (let i = 0; i < len; i++) {
        if (!eq(a[i], b[i])) return false;
    }
    return true;
}

export function safeParseFloat(value: string | number) : number {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            return num;
        }
    }

    return 0;
}

export function findChangedProps(oldProps: any, newProps: any): any {
    if (!oldProps) return newProps;
    if (!newProps) return {};

    const seen = new WeakMap<object, WeakSet<object>>();

    const isPlainObject = (v: any): v is object => v !== null && typeof v === 'object' && !Array.isArray(v);

    function diffObjects(a: any, b: any): any {
        const result: any = {};

        // Cycle detection for object pairs
        if (isPlainObject(a) && isPlainObject(b)) {
            let set = seen.get(a);
            if (!set) {
                set = new WeakSet<object>();
                seen.set(a, set);
            }
            if (set.has(b)) {
                return result; // already compared this pair; avoid infinite recursion
            }
            set.add(b);
        }

        for (const key in b) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) continue;

            const oldValue = a ? a[key] : undefined;
            const newValue = b[key];

            if (oldValue === undefined) {
                result[key] = newValue;
                continue;
            }

            // Arrays: compare quickly and assign if changed
            if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                if (!twoArraysEqual(oldValue, newValue)) {
                    result[key] = newValue;
                }
                continue;
            }

            // Nested plain objects
            if (isPlainObject(oldValue) && isPlainObject(newValue)) {
                const nested = diffObjects(oldValue, newValue);
                if (nested && Object.keys(nested).length > 0) {
                    result[key] = nested;
                }
                continue;
            }

            // Functions: compare by source string
            if (typeof oldValue === 'function' && typeof newValue === 'function') {
                if (!compareTwoFunctions(oldValue, newValue)) {
                    result[key] = newValue;
                }
                continue;
            }

            // Primitives or differing types
            if (oldValue !== newValue) {
                result[key] = newValue;
            }
        }

        return result;
    }

    return diffObjects(oldProps, newProps);
}

export function compareTwoFunctions(func1: Function, func2: Function): boolean {
    if (!func1 || !func2) return false;
    try { return func1.toString() === func2.toString(); } catch (_) { return false; }
}

export function isReactElementInChildren(children: any[]): boolean {
    if (!children) return false;
    if (!Array.isArray(children)) return false;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (typeof child === "object" && child !== null && child.$$typeof === Symbol.for("react.element")) {
            return true;
        }
    }
    return false;
}
