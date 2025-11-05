import { UMGConverter } from "./umg_converter";
import * as UE from 'ue';
import * as puerts from 'puerts';

export class NativeWidgetConverter extends UMGConverter {
    private callbackRecords: {[key: string] : () => void};

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.callbackRecords = {};
    }

    private getNativeWidget(): UE.Widget {
        const classPath = exports.lazyloadComponents[this.typeName];
        let widget: UE.Widget;
        if (classPath)  {
            widget = UE.NewObject(UE.Class.Load(classPath), this.outer) as UE.Widget;
        } else {
            widget = new UE[this.typeName](this.outer);
        }

        return widget;
    }

    private bindEvents(widget: UE.Widget, eventName: string, callback: Function): void {
        let widgetEvent = widget[eventName];
        if (typeof widgetEvent.Add === 'function') {
            widgetEvent.Add(callback);
            this.callbackRecords[eventName] = () => {
                widgetEvent.Remove(callback);
            }
        } else if (typeof widgetEvent.Bind === 'function') {
            widgetEvent.Bind(callback);
            this.callbackRecords[eventName] = () => {
                widgetEvent.Unbind();
            }
        } else {
            console.error(`Failed to bind event, ${eventName} not supported`);
        }
    }

    private unbindEvents(eventName: string): void {
        let remover = this.callbackRecords[eventName];
        this.callbackRecords[eventName] = undefined;
        if (remover) {
            remover();
        }
    }
    
    createNativeWidget(): UE.Widget {
        const widget = this.getNativeWidget();
        if (!widget) {
            return null;
        }

        let mergeProps = {};
        for (const key in this.props) {
            let val = this.props[key];
            if (typeof val === 'function') {
                this.bindEvents(widget, key, val);
            } else if(key !== 'children') {
                mergeProps[key] = val;
            }
        }

        puerts.merge(widget, mergeProps);

        return widget;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        let propsChanged = {};
        for (const key in changedProps) {
            let val = changedProps[key];
            if (key !== 'children') {
                if (typeof val === 'function') {
                    this.unbindEvents(key);
                    this.bindEvents(widget, key, val);
                } else {
                    propsChanged[key] = val;
                }
            }

        }

        if (propsChanged) {
            puerts.merge(widget, propsChanged);
            UE.UMGManager.SynchronizeWidgetProperties(widget);
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        if (parent instanceof UE.PanelWidget) {
            parent.AddChild(child);
        }
    }

    removeChild(parent: UE.Widget, child: UE.Widget): void {
        if (parent instanceof UE.PanelWidget) {
            parent.RemoveChild(child);
        }
    }
}

