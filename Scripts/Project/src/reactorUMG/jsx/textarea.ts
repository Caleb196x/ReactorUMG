import * as UE from 'ue';
import { JSXConverter } from './jsx_converter';
import { getAllStyles } from '../parsers/cssstyle_parser';
import { hasFontStyles, setupFontStyles } from '../parsers/css_font_parser';
import { parseToLinearColor } from '../parsers/css_color_parser';

export class TextAreaConverter extends JSXConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private readonly propertySetters: Record<string, (widget: UE.MultiLineEditableText, value: any) => void> = {
        'value': (widget, value) => {
            if (value !== undefined && value !== null) {
                widget.SetText(value);
            }
        },
        'defaultValue': (widget, value) => {
            if (value !== undefined && value !== null) {
                widget.SetText(value);
            }
        }, 
        'placeholder': (widget, value) => {
            if (value !== undefined && value !== null) {
                widget.SetHintText(value);
            }
        },
        'readOnly': (widget, value) => {
            if (value !== undefined && value !== null) {
                widget.SetIsReadOnly(!!value);
            }
        },
        'disabled': (widget, value) => {
            if (value !== undefined && value !== null) {
                widget.SetIsEnabled(!value);
            }
        }
    };

    
    private readonly eventHandlers: Record<string, {
        event: string,
        setup: (widget: UE.MultiLineEditableText, handler: Function) => Function
    }> = {
        'onChange': {
            event: 'OnTextChanged',
            setup: (widget, handler) => {
                const callback = (text: string) => handler({target: {value: text}});
                widget.OnTextChanged.Add(callback);
                return callback;
            }
        },
        'onSubmit': {
            event: 'OnTextCommitted', 
            setup: (widget, handler) => {
                const callback = (text: string, commitMethod: UE.ETextCommit) => {
                    if (commitMethod === UE.ETextCommit.Default) {
                        handler({target: text});
                    }
                };
                widget.OnTextCommitted.Add(callback);
                return callback;
            }
        },
        'onBlur': {
            event: 'OnTextCommitted',
            setup: (widget, handler) => {
                const callback = (text: string, commitMethod: UE.ETextCommit) => {
                    if (commitMethod === UE.ETextCommit.OnUserMovedFocus) {
                        handler({target: {value: text}});
                    }
                };
                widget.OnTextCommitted.Add(callback);
                return callback;
            }
        }
    };

    private eventCallbacks: Record<string, Function | undefined> = {};

    private applyStyles(textArea: UE.MultiLineEditableText, props: any) {
        const styles = getAllStyles(this.typeName, props) ?? {};

        if (hasFontStyles(styles)) {
            const existingFont = textArea.GetFont?.();
            if (existingFont) {
                setupFontStyles(textArea, existingFont, styles);
                textArea.SetFont(existingFont);
            } else {
                const font = new UE.SlateFontInfo();
                setupFontStyles(textArea, font, styles);
                textArea.SetFont(font);
            }
        }

        const fontColor = styles?.color ?? styles?.fontColor;
        if (fontColor && textArea.WidgetStyle && textArea.WidgetStyle.ColorAndOpacity) {
            const rgba = parseToLinearColor(fontColor);
            textArea.WidgetStyle.ColorAndOpacity.SpecifiedColor.R = rgba.r;
            textArea.WidgetStyle.ColorAndOpacity.SpecifiedColor.G = rgba.g;
            textArea.WidgetStyle.ColorAndOpacity.SpecifiedColor.B = rgba.b;
            textArea.WidgetStyle.ColorAndOpacity.SpecifiedColor.A = rgba.a;
        }
    }

    private initTextAreaProps(textArea: UE.MultiLineEditableText, props: any): boolean {
        let propsInit = false;
        // Apply properties
        for (const [key, setter] of Object.entries(this.propertySetters)) {
            if (key in props) {
                setter(textArea, props[key]);
                propsInit = true;
            }
        }

        // Setup event handlers
        for (const [key, handler] of Object.entries(this.eventHandlers)) {
            const existingCallback = this.eventCallbacks[key];
            if (existingCallback) {
                const eventDelegate = textArea[handler.event];
                if (eventDelegate && typeof eventDelegate.Remove === 'function') {
                    eventDelegate.Remove(existingCallback);
                }
                this.eventCallbacks[key] = undefined;
            }

            if (typeof props[key] === 'function') {
                this.eventCallbacks[key] = handler.setup(textArea, props[key]);
                propsInit = true;
            }
        }

        return propsInit;
    }

    createNativeWidget(): UE.Widget {
        const textArea = new UE.MultiLineEditableText(this.outer);
        this.initTextAreaProps(textArea, this.props);
        this.applyStyles(textArea, this.props);
        UE.UMGManager.SynchronizeWidgetProperties(textArea);
        return textArea;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const textArea = widget as UE.MultiLineEditableText;
        const propsChanged = this.initTextAreaProps(textArea, changedProps);
        this.applyStyles(textArea, this.props);
        const styleChanged = !!changedProps && (('style' in changedProps) || ('className' in changedProps) || ('id' in changedProps));
        if (propsChanged || styleChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(textArea);
        }
    }
}
