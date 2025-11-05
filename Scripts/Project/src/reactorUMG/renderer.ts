import * as Reconciler from 'react-reconciler';
import * as puerts from 'puerts';
import * as UE from 'ue';
import { createElementConverter, ElementConverter } from './converter';

/**
 * Compares two values for deep equality.
 *
 * This function checks if two values are strictly equal, and if they are objects,
 * it recursively checks their properties for equality, excluding the 'children' 
 * and 'Slot' properties.
 *
 * @param x - The first value to compare.
 * @param y - The second value to compare.
 * @returns True if the values are deeply equal, false otherwise.
 */
function deepEquals(x: any, y: any) {
    if ( x === y ) return true;

    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;

    for (var p in x) { // all x[p] in y
        if (p == 'children') continue;
        if (!deepEquals(x[p], y[p])) return false;
    }

    for (var p in y) {
        if (p == 'children') continue;
        if (!x.hasOwnProperty(p)) return false;
    }

    return true;
}

class UMGWidget {
    native: UE.Widget;
    typeName: string;
    props: any;
    rootContainer: RootContainer;
    hostContext: any;
    // isContainer: boolean;
    converter: ElementConverter;

    constructor(typeName: string, props: any, rootContainer: RootContainer, hostContext: any) {
        this.typeName = typeName;
        this.props = props;
        this.rootContainer = rootContainer;
        this.hostContext = hostContext;
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
}

class RootContainer {
    public widgetTree: UE.WidgetTree;
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
}

const hostConfig : Reconciler.HostConfig<string, any, RootContainer, UMGWidget, UMGWidget, any, any, {}, any, any, any, any, any> = {
    getRootHostContext () { return {}; },
    //CanvasPanel()的parentHostContext是getRootHostContext返回的
    getChildHostContext (parentHostContext: {}) { return parentHostContext;},
    appendInitialChild (parent: UMGWidget, child: UMGWidget) { parent.appendChild(child); },
    appendChildToContainer (container: RootContainer, child: UMGWidget) { container.appendChild(child); },
    appendChild (parent: UMGWidget, child: UMGWidget) { parent.appendChild(child); },
    createInstance (type: string, props: any, rootContainer: RootContainer, hostContext: any, internalHandle: Reconciler.OpaqueHandle) { 
        return new UMGWidget(type, props, rootContainer, hostContext);
    },
    createTextInstance (text: string, rootContainer: RootContainer, hostContext: any) {
        
        return new UMGWidget("text", {text: text}, rootContainer, hostContext);
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
  
    //return false表示不更新，真值将会出现到commitUpdate的updatePayload里头
    prepareUpdate (instance: UMGWidget, type: string, oldProps: any, newProps: any) {
        try{
            const textContainers = new Set(['text','span','textarea','label','p','a','h1','h2','h3','h4','h5','h6']);
            if (textContainers.has(type)) {
                const oldChild: any = oldProps ? (oldProps as any).children : undefined;
                const newChild: any = newProps ? (newProps as any).children : undefined;
                const oldIsText = typeof oldChild === 'string' || typeof oldChild === 'number';
                const newIsText = typeof newChild === 'string' || typeof newChild === 'number';
                if ((oldIsText || newIsText) && oldChild !== newChild) {
                    return true;
                }
            }
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
        let root = new RootContainer(inWidgetTree);
        const container = reconciler.createContainer(root, 0, null, false, false, "", null, null);
        reconciler.updateContainer(reactElement, container, null, null);
        return root;
    }
}
