import * as UE from "ue";
import { parseToLinearColor } from "../parsers/css_color_parser";
import { getAllStyles } from "../parsers/cssstyle_parser";
import { JSXConverter } from "./jsx_converter";
import { parseBackgroundProps } from "../parsers/css_background_parser";
import { parseBrush } from "../parsers/brush_parser";
import { convertToUEMargin } from "../parsers/css_margin_parser";

export class ButtonConverter extends JSXConverter {

    private eventCallbacks: Record<string, Function | undefined> = {};

    private readonly eventNameMapping: Record<string, string> = {
        onClick: 'OnClicked',
        onPressed: 'OnPressed',
        onMouseDown: 'OnPressed',
        onReleased: 'OnReleased',
        onMouseUp: 'OnReleased',
        onHovered: 'OnHovered',
        onMouseEnter: 'OnHovered',
        onUnhovered: 'OnUnhovered',
        onMouseLeave: 'OnUnhovered',
        onFocus: 'OnHovered',
        onBlur: 'OnUnhovered'
    };

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private setButtonTextColor(button: UE.Button, style: any, props: any) {
        const textColor = props?.textColor ?? style?.textColor ?? style?.color;
        if (!textColor) {
            return;
        }

        const rgba = parseToLinearColor(textColor);
        if (!button.ColorAndOpacity) {
            button.ColorAndOpacity = new UE.LinearColor(rgba.r, rgba.g, rgba.b, rgba.a);
            return;
        }

        button.ColorAndOpacity.R = rgba.r;
        button.ColorAndOpacity.G = rgba.g;
        button.ColorAndOpacity.B = rgba.b;
        button.ColorAndOpacity.A = rgba.a;
    }

    private isSlateBrush(value: any): value is UE.SlateBrush {
        return value instanceof UE.SlateBrush ||
            (value &&
                typeof value === 'object' &&
                'DrawAs' in value &&
                'TintColor' in value &&
                'ResourceObject' in value);
    }

    private applyStateBrush(
        button: UE.Button,
        state: 'Hovered' | 'Pressed' | 'Disabled',
        source: any,
        fallbackBrush?: UE.SlateBrush,
        fallbackTint?: UE.LinearColor
    ) {
        let brush: UE.SlateBrush | null = null;

        if (source) {
            try {
                // fix: should convert source to ImageStyle
                if (this.isSlateBrush(source)) {
                    brush = source;
                } else {
                    // fix: should convert source to ImageStyle
                    brush = parseBrush(source);
                }
            } catch (error) {
                console.warn(`Failed to parse ${state} background`, error);
            }
        } else if (fallbackBrush) {
            brush = fallbackBrush;
        }

        if (!brush) {
            return;
        }

        if (fallbackTint && !brush.Tint) {
            brush.Tint = fallbackTint;
        }

        button.WidgetStyle[state] = brush;
    }

    private setButtonBackground(button: UE.Button, style: any, props: any) {
        const backgroundSource = {
            ...style,
            background: props?.background ?? style?.background,
            backgroundColor: props?.backgroundColor ?? style?.backgroundColor,
            backgroundImage: props?.backgroundImage ?? style?.backgroundImage,
            backgroundSize: props?.backgroundSize ?? style?.backgroundSize,
            backgroundRepeat: props?.backgroundRepeat ?? style?.backgroundRepeat,
            backgroundPosition: props?.backgroundPosition ?? style?.backgroundPosition
        };

        const parsedBackground = parseBackgroundProps(backgroundSource);
        const normalBrush = parsedBackground?.image ?? button.WidgetStyle.Normal;

        if (parsedBackground?.image) {
            button.WidgetStyle.Normal = parsedBackground.image;
        }

        if (parsedBackground?.color) {
            button.BackgroundColor = parsedBackground.color;
        } else if (props?.backgroundColor) {
            const color = parseToLinearColor(props.backgroundColor);
            button.BackgroundColor = new UE.LinearColor(color.r, color.g, color.b, color.a);
        }

        const hoverPseudoStyle = getAllStyles(this.typeName, this.props, 'hover');
        const pressPseudoStyle = getAllStyles(this.typeName, this.props, 'press');
        const disabledPseudoStyle = getAllStyles(this.typeName, this.props, 'disabled');
        const parsedHoverPseudoBackground = parseBackgroundProps(hoverPseudoStyle);
        const parsedPressPseudoBackground = parseBackgroundProps(pressPseudoStyle);
        const parsedDisabledPseudoBackground = parseBackgroundProps(disabledPseudoStyle);
        const hoveredBackground = props?.hoveredBackground
            ?? style?.hoveredBackground
            ?? parsedHoverPseudoBackground?.image;
        const pressedBackground = props?.pressedBackground
            ?? style?.pressedBackground
            ?? parsedPressPseudoBackground?.image;
        const disabledBackground = props?.disabledBackground
            ?? style?.disabledBackground
            ?? parsedDisabledPseudoBackground?.image;

        const hoverTint = parsedHoverPseudoBackground?.color ?? parsedBackground?.color;
        const pressTint = parsedPressPseudoBackground?.color ?? parsedBackground?.color;
        const disabledTint = parsedDisabledPseudoBackground?.color ?? parsedBackground?.color;
        this.applyStateBrush(button, 'Hovered', hoveredBackground, normalBrush, hoverTint);
        this.applyStateBrush(button, 'Pressed', pressedBackground, normalBrush, pressTint);
        this.applyStateBrush(button, 'Disabled', disabledBackground, normalBrush, disabledTint);
    }

    private resolveProps(overrides?: any): { props: any, style: any } {
        if (!overrides) {
            return { props: this.props, style: this.widgetStyle };
        }

        const mergedProps: any = { ...(this.props || {}) };
        for (const key of Object.keys(overrides)) {
            const overrideValue = overrides[key];

            if (key === 'style') {
                mergedProps.style = { ...(this.props?.style || {}), ...(overrideValue || {}) };
                continue;
            }

            if (
                typeof overrideValue === 'object' &&
                overrideValue !== null &&
                !Array.isArray(overrideValue) &&
                typeof mergedProps[key] === 'object' &&
                mergedProps[key] !== null &&
                !Array.isArray(mergedProps[key])
            ) {
                mergedProps[key] = { ...mergedProps[key], ...overrideValue };
            } else {
                mergedProps[key] = overrideValue;
            }
        }

        const style = getAllStyles(this.typeName, mergedProps);
        return { props: mergedProps, style };
    }

    private applyEnabledState(button: UE.Button, props: any) {
        const disabled = props?.disabled;
        const disable = props?.disable;

        if (disabled !== undefined) {
            button.bIsEnabled = !disabled;
            return;
        }

        if (disable !== undefined) {
            button.bIsEnabled = !disable;
            return;
        }

        if (button.bIsEnabled === undefined) {
            button.bIsEnabled = true;
        }
    }

    private applyFocusable(button: UE.Button, props: any) {
        if (props?.focusable !== undefined) {
            button.IsFocusable = !!props.focusable;
        }
    }

    private toPaddingValue(value: any): string | null {
        if (value === undefined || value === null) {
            return null;
        }

        if (typeof value === 'number') {
            return `${value}`;
        }

        if (typeof value === 'string') {
            return value;
        }

        return null;
    }

    private setButtonPadding(button: UE.Button, props: any, style: any) {
        const normalPaddingValue = this.toPaddingValue(props?.normalPadding ?? style?.normalPadding);
        if (normalPaddingValue) {
            const margin = convertToUEMargin(style || {}, normalPaddingValue, '', '', '', '');
            if (margin) {
                button.WidgetStyle.NormalPadding = margin;
            }
        }

        const pressedPaddingValue = this.toPaddingValue(props?.pressedPadding ?? style?.pressedPadding);
        if (pressedPaddingValue) {
            const margin = convertToUEMargin(style || {}, pressedPaddingValue, '', '', '', '');
            if (margin) {
                button.WidgetStyle.PressedPadding = margin;
            }
        }
    }

    private setInteractionMethods(button: UE.Button, props: any) {
        const clickMethod = props?.clickMethod;
        if (clickMethod) {
            const clickMethodMap: Record<string, UE.EButtonClickMethod> = {
                'down-up': UE.EButtonClickMethod.DownAndUp,
                'down': UE.EButtonClickMethod.MouseDown,
                'up': UE.EButtonClickMethod.MouseUp,
                'precise-click': UE.EButtonClickMethod.PreciseClick
            };
            const mapped = clickMethodMap[clickMethod];
            if (mapped !== undefined) {
                button.SetClickMethod(mapped);
            }
        }

        const touchMethod = props?.touchMethod;
        if (touchMethod) {
            const touchMethodMap: Record<string, UE.EButtonTouchMethod> = {
                'down-up': UE.EButtonTouchMethod.DownAndUp,
                'down': UE.EButtonTouchMethod.Down,
                'precise-tap': UE.EButtonTouchMethod.PreciseTap
            };
            const mapped = touchMethodMap[touchMethod];
            if (mapped !== undefined) {
                button.SetTouchMethod(mapped);
            }
        }

        const pressMethod = props?.pressMethod;
        if (pressMethod) {
            const pressMethodMap: Record<string, UE.EButtonPressMethod> = {
                'down-up': UE.EButtonPressMethod.DownAndUp,
                'press': UE.EButtonPressMethod.ButtonPress,
                'release': UE.EButtonPressMethod.ButtonRelease
            };
            const mapped = pressMethodMap[pressMethod];
            if (mapped !== undefined) {
                button.SetPressMethod(mapped);
            }
        }
    }

    private setButtonSounds(button: UE.Button, props: any) {
        const pressedSound = props?.pressedSound;
        if (pressedSound) {
            if (pressedSound instanceof UE.SlateSound) {
                button.WidgetStyle.PressedSlateSound = pressedSound;
            } else if (button.WidgetStyle.PressedSlateSound instanceof UE.SlateSound && 'ResourceObject' in button.WidgetStyle.PressedSlateSound) {
                // todo: support converting non SlateSound pressedSound inputs
                console.warn('pressedSound provided but not a UE.SlateSound instance - conversion pending');
            }
        }

        const hoveredSound = props?.hoveredSound;
        if (hoveredSound) {
            if (hoveredSound instanceof UE.SlateSound) {
                button.WidgetStyle.HoveredSlateSound = hoveredSound;
            } else if (button.WidgetStyle.HoveredSlateSound instanceof UE.SlateSound && 'ResourceObject' in button.WidgetStyle.HoveredSlateSound) {
                // todo: support converting non SlateSound hoveredSound inputs
                console.warn('hoveredSound provided but not a UE.SlateSound instance - conversion pending');
            }
        }
    }

    private setButtonStyle(button: UE.Button, props?: any) {
        if (!button) {
            return;
        }

        const { props: resolvedProps, style } = this.resolveProps(props);

        if (props) {
            this.props = resolvedProps;
            this.widgetStyle = style;
        }

        this.applyEnabledState(button, resolvedProps);
        this.applyFocusable(button, resolvedProps);
        this.setButtonTextColor(button, style, resolvedProps);
        this.setButtonBackground(button, style, resolvedProps);
        this.setButtonPadding(button, resolvedProps, style);
        this.setInteractionMethods(button, resolvedProps);
        this.setButtonSounds(button, resolvedProps);
    }

    private initSingleEventHandler(button: UE.Button, propName: string, handler: Function) {
        if (typeof handler !== 'function') {
            return;
        }

        const eventName = this.eventNameMapping[propName];
        if (!eventName || !button[eventName]) {
            console.warn(`Event name mapping not found for property: ${propName}`);
            return;
        }

        this.removeSingleEventHandler(button, propName);
        button[eventName].Add(handler);
        this.eventCallbacks[propName] = handler;
    }

    private initButtonDefaultProps(button: UE.Button) {
        if (!button) return;

        // init image tint color
        function InitTintColorToWhite(tintColor: UE.SlateColor) {
            if (!tintColor) {
                tintColor = new UE.SlateColor();
            }

            tintColor.SpecifiedColor.R = 1;
            tintColor.SpecifiedColor.G = 1;
            tintColor.SpecifiedColor.B = 1;
            tintColor.SpecifiedColor.A = 1;
        }
        InitTintColorToWhite(button.WidgetStyle.Normal.TintColor);
        InitTintColorToWhite(button.WidgetStyle.Hovered.TintColor);
        InitTintColorToWhite(button.WidgetStyle.Pressed.TintColor);
    }

    private removeSingleEventHandler(button: UE.Button, propName: string) {
        const eventName = this.eventNameMapping[propName];
        if (!eventName) {
            return;
        }

        const callback = this.eventCallbacks[propName];
        if (callback && button[eventName]) {
            button[eventName].Remove(callback);
        }
        this.eventCallbacks[propName] = undefined;
    }

    private setButtonEventHandlers(button: UE.Button, props?: any) {
        if (!props) {
            return;
        }

        // Setup all event handlers
        for (const propName in this.eventNameMapping) {
            if (Object.prototype.hasOwnProperty.call(props, propName)) {
                const handler = props[propName];
                if (handler) {
                    this.initSingleEventHandler(button, propName, handler);
                } else {
                    this.removeSingleEventHandler(button, propName);
                }
            }
        }
    }

    private setupButtonProps(button: UE.Button, props?: any) {
        this.initButtonDefaultProps(button);
        this.setButtonStyle(button, props);
        this.setButtonEventHandlers(button, props ?? this.props);
        UE.UMGManager.SynchronizeWidgetProperties(button);
    }

    createNativeWidget() {
        const button = new UE.Button(this.outer);
        this.setupButtonProps(button, this.props);
        return button;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any) {
        const button = widget as UE.Button;
        this.setButtonStyle(button, changedProps);
        this.setButtonEventHandlers(button, changedProps);
        UE.UMGManager.SynchronizeWidgetProperties(button);
    }
}
