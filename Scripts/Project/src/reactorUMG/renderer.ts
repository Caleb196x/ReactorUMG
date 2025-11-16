import * as Reconciler from 'react-reconciler';
import * as puerts from 'puerts';
import * as UE from 'ue';
import { createElementConverter, ElementConverter } from './converter';

const REACT_ELEMENT_TYPE = typeof Symbol === 'function' ? Symbol.for('react.element') : 0;

function isReactElement(value: any) {
    return value && typeof value === 'object' && value.$$typeof === REACT_ELEMENT_TYPE;
}

function isPlainObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeComparableChildren(value: any): any[] {
    if (value === undefined || value === null) {
        return [];
    }
    const arrayified = Array.isArray(value) ? value : [value];
    return arrayified.filter((item) => !isReactElement(item));
}

/**
 * Compares two values for deep equality.
 *
 * Mirrors the semantics used by findChangedProps so React props trigger updates
 * only when a meaningful difference is detected.
 */
function deepEquals(x: any, y: any) {
    const seen = new WeakMap<object, WeakSet<object>>();
    const hasOwn = Object.prototype.hasOwnProperty;

    const equals = (left: any, right: any): boolean => {
        if (left === right) {
            return true;
        }

        // functions always considered different to force updates
        if (typeof left === 'function' || typeof right === 'function') {
            return false;
        }

        if (left === null || right === null || left === undefined || right === undefined) {
            return left === right;
        }

        if (Array.isArray(left) && Array.isArray(right)) {
            if (left.length !== right.length) {
                return false;
            }
            for (let i = 0; i < left.length; i++) {
                if (!equals(left[i], right[i])) {
                    return false;
                }
            }
            return true;
        }

        if (isPlainObject(left) && isPlainObject(right)) {
            let set = seen.get(left);
            if (!set) {
                set = new WeakSet<object>();
                seen.set(left, set);
            }
            if (set.has(right)) {
                return true; // already compared this pair
            }
            set.add(right);

            const leftKeys = Object.keys(left);
            const rightKeys = Object.keys(right);
            let normalizedLeftChildren: any[] | undefined;
            let normalizedRightChildren: any[] | undefined;

            for (const key of leftKeys) {
                if (key.startsWith('_') || key.startsWith('$$')) {
                    continue;
                }
                if (key === 'children') {
                    normalizedLeftChildren ??= normalizeComparableChildren(left[key]);
                    normalizedRightChildren ??= normalizeComparableChildren(right[key]);
                    if (normalizedLeftChildren.length !== normalizedRightChildren.length) {
                        return false;
                    }
                    for (let i = 0; i < normalizedLeftChildren.length; i++) {
                        if (!equals(normalizedLeftChildren[i], normalizedRightChildren[i])) {
                            return false;
                        }
                    }
                    continue;
                }

                if (!hasOwn.call(right, key)) {
                    return false;
                }

                if (!equals(left[key], right[key])) {
                    return false;
                }
            }

            for (const key of rightKeys) {
                if (key.startsWith('_') || key.startsWith('$$')) {
                    continue;
                }
                if (!hasOwn.call(left, key)) {
                    if (key === 'children') {
                        normalizedRightChildren ??= normalizeComparableChildren(right[key]);
                        return normalizedRightChildren.length === 0;
                    }
                    return false;
                }

                if (key === 'children' && normalizedLeftChildren === undefined) {
                    normalizedLeftChildren = normalizeComparableChildren(left[key]);
                    normalizedRightChildren = normalizeComparableChildren(right[key]);
                    if (normalizedLeftChildren.length !== normalizedRightChildren.length) {
                        return false;
                    }
                    for (let i = 0; i < normalizedLeftChildren.length; i++) {
                        if (!equals(normalizedLeftChildren[i], normalizedRightChildren[i])) {
                            return false;
                        }
                    }
                }
            }

            return true;
        }

        return false;
    };

    return equals(x, y);
}

class UMGWidget {
    native: UE.Widget;
    typeName: string;
    props: any;
    rootContainer: RootContainer;
    // isContainer: boolean;
    converter: ElementConverter;
    parentFiber: any;
    parentProps: any;

    constructor(typeName: string, props: any, rootContainer: RootContainer, parentFiber?: any) {
        this.typeName = typeName;
        this.rootContainer = rootContainer;
        this.parentFiber = parentFiber;
        this.parentProps = this.getParentProps();
        this.props = { ...props, __parentProps: this.parentProps };
        this.init();
    }

    init() {
        try {
            const WidgetTreeOuter = this.rootContainer.widgetTree;
            this.converter = createElementConverter(this.typeName, this.props, WidgetTreeOuter);
            this.native = this.converter.createWidget();
            const shouldIgnore = (this.converter as any)?.ignore === true;
            if (this.native === null && !shouldIgnore) {
                console.warn("Not supported widget: " + this.typeName);
            }
        } catch(e) {
            console.error("Failed to create widget: " + this.typeName + ", error: " + e);
            console.error(e.stack);
        }
    }

    update(oldProps: any, newProps: any) {
        if (this.native !== null) {
            this.props = { ...newProps, __parentProps: this.parentProps };
            this.converter.updateWidget(this.native, oldProps, newProps);
        }
    }

    appendChild(child: UMGWidget) {
        const shouldForceAppend = (child.converter as any)?.forceAppend === true;
        if ((shouldForceAppend &&this.native && child ) 
            || (this.native && child && child.native)) {
            this.converter.appendChild(this.native, child.native, child.typeName, child.props);
        }
    }

    removeChild(child: UMGWidget) {
        if (this.native && child && child.native) {
            this.converter.removeChild(this.native, child.native);
        }
    }

    private getParentProps() {
        if (this.parentFiber) {
            const memoizedProps = (this.parentFiber as any).memoizedProps ?? (this.parentFiber as any).memorizedProps;
            if (memoizedProps) {
                return memoizedProps;
            }
        }

        return {};
    }
}

class RootContainer {
    public widgetTree: UE.WidgetTree;
    public reconcilerContainer: any;
    constructor(nativePtr: UE.WidgetTree) {
        this.widgetTree = nativePtr;
    }

    appendChild(child: UMGWidget) {
        if (child?.native) {
            UE.UMGManager.AddRootWidgetToWidgetTree(this.widgetTree, child.native);
        }
    }

    removeChild(child: UMGWidget) {
        if (child?.native) {
            UE.UMGManager.RemoveRootWidgetFromWidgetTree(this.widgetTree, child.native);
        }
    }

    clearAllWidgets() {
        this.widgetTree.RootWidget = null;
    }
}

const hostConfig : Reconciler.HostConfig<string, any, RootContainer, UMGWidget, UMGWidget, any, any, {}, any, any, any, any, any> = {
    getRootHostContext () { return {}; },
    //CanvasPanel()的parentHostContext是getRootHostContext返回值; 累加父元素class以便后代样式解析
    getChildHostContext (parentHostContext: any, _type: string, props: any) {
        return {};
    },
    appendInitialChild (parent: UMGWidget, child: UMGWidget) { parent.appendChild(child); },
    appendChildToContainer (container: RootContainer, child: UMGWidget) { container.appendChild(child); },
    appendChild (parent: UMGWidget, child: UMGWidget) { parent.appendChild(child); },
    createInstance (type: string, props: any, rootContainer: RootContainer, hostContext: any, internalHandle: Reconciler.OpaqueHandle) { 
        return new UMGWidget(type, props, rootContainer, internalHandle.return ?? null);
    },
    createTextInstance (text: string, rootContainer: RootContainer, hostContext: any, internalHandle: Reconciler.OpaqueHandle) {
        return new UMGWidget("text", {text: text, _children_text_instance: true}, rootContainer, internalHandle.return ?? null);
    },
    finalizeInitialChildren () { return false; },
    getPublicInstance (instance: UMGWidget) { return instance.native; },
    prepareForCommit(containerInfo: RootContainer): any {},
    resetAfterCommit (container: RootContainer) {},
    resetTextContent (instance: UMGWidget) { },
    shouldSetTextContent (type, props) {
        const textContainers = new Set([
            'text','span','p', 'textarea', 'label', 'a','h1','h2','h3','h4','h5','h6'
        ]);
        const children = props && props.children;
        return textContainers.has(type) && (typeof children === 'string' || typeof children === 'number');
    },
    commitTextUpdate (textInstance: UMGWidget, oldText: string, newText: string) {
        if (textInstance != null && oldText != newText) {
            textInstance.update({}, {text: newText})
        }
    },
  
    prepareUpdate (instance: UMGWidget, type: string, oldProps: any, newProps: any) {
        try{
            return !deepEquals(oldProps, newProps);
        } catch(e) {
            console.error(e.message);
            return true;
        }
    },

    commitUpdate (instance: UMGWidget, updatePayload: any, type : string, oldProps : any, newProps: any) {
        try{
            instance.update(oldProps, newProps);
        } catch(e) {
            console.error("commitUpdate fail!, " + e + "\n" + e.stack);
        }
    },

    removeChildFromContainer (container: RootContainer, child: UMGWidget) { container.removeChild(child); },

    removeChild(parent: UMGWidget, child: UMGWidget) {
        parent.removeChild(child);
    },

    clearContainer(container: RootContainer) {},
    getCurrentEventPriority(){ return 0; },
    getInstanceFromNode(node: any){ return undefined; },
    beforeActiveInstanceBlur() {},
    afterActiveInstanceBlur() {},
    prepareScopeUpdate(scopeInstance: any, instance: any) {},
    getInstanceFromScope(scopeInstance: any) { return null; },
    detachDeletedInstance(node: any){},

    supportsMutation: true,
    isPrimaryRenderer: true,
    supportsPersistence: false,
    supportsHydration: false,
    noTimeout: undefined,
    preparePortalMount() {},
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout
    //useSyncScheduling: true,
    // scheduleDeferredCallback: undefined,
    // shouldDeprioritizeSubtree: undefined,
    // setTimeout: undefined,
    // clearTimeout: undefined,
    // cancelDeferredCallback: undefined,
}

const reconciler = Reconciler(hostConfig);

export const ReactorUMG = {
    
    render: function(inWidgetTree: UE.WidgetTree, reactElement: React.ReactNode) {
        if (inWidgetTree == undefined) {
            throw new Error("init with ReactorUIWidget first!");
        }
        const root = new RootContainer(inWidgetTree);
        const container = reconciler.createContainer(root, 0, null, false, false, "", null, null);
        root.reconcilerContainer = container;
        reconciler.updateContainer(reactElement, container, null, null);
        return root;
    },
    release: function(root: RootContainer) {
        reconciler.updateContainer(null, root.reconcilerContainer, null, null);
    }
}



