import { JSXConverter } from "./jsx_converter";
import * as UE from "ue";
import { getAllStyles } from "../parsers/cssstyle_parser";
import { parseBackgroundProps } from "../parsers/css_background_parser";
import { parseToLinearColor } from "../parsers/css_color_parser";
import { safeParseFloat } from "../misc/utils";

const DEFAULT_MAX = 100;
const DEFAULT_MIN = 0;
const DOUBLE_CLICK_THRESHOLD_MS = 320;
const KEY_POLL_INTERVAL_MS = 50;

type ProgressEventName =
    | "onClick"
    | "onDoubleClick"
    | "onMouseEnter"
    | "onMouseLeave"
    | "onFocus"
    | "onBlur";

type KeyMapping = {
    readonly key: UE.Key;
    readonly eventKey: string;
};

const KEY_MAPPINGS: KeyMapping[] = [
    { key: new UE.Key("Left"), eventKey: "ArrowLeft" },
    { key: new UE.Key("Right"), eventKey: "ArrowRight" },
    { key: new UE.Key("Up"), eventKey: "ArrowUp" },
    { key: new UE.Key("Down"), eventKey: "ArrowDown" }
];

function toLinearColor(colorSource: string) {
    const color = parseToLinearColor(colorSource);
    return new UE.LinearColor(color.r, color.g, color.b, color.a);
}

function createSyntheticEvent(type: string, value: number | null, min: number, max: number) {
    return {
        type,
        target: {
            value,
            min,
            max
        },
        currentTarget: null,
        preventDefault() { /* noop */ },
        stopPropagation() { /* noop */ }
    };
}

function createKeyboardEvent(key: string, value: number | null, min: number, max: number) {
    return {
        key,
        code: key,
        target: {
            value,
            min,
            max
        },
        currentTarget: null,
        preventDefault() { /* noop */ },
        stopPropagation() { /* noop */ }
    };
}

export class ProgressConverter extends JSXConverter {
    private styles: any;
    private button?: UE.Button;
    private progressBar?: UE.ProgressBar;
    private currentMin: number;
    private currentMax: number;
    private currentValue: number | null;
    private isMarquee: boolean;
    private eventHandlers: {
        onClick?: () => void;
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
    };
    private keyPollHandle?: ReturnType<typeof setInterval>;
    private lastClickTimestamp: number;
    private focused: boolean;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.styles = getAllStyles(typeName, props);
        this.currentMin = DEFAULT_MIN;
        this.currentMax = DEFAULT_MAX;
        this.currentValue = null;
        this.isMarquee = false;
        this.eventHandlers = {};
        this.lastClickTimestamp = 0;
        this.focused = false;
    }

    private refreshStyles(props: any) {
        this.styles = getAllStyles(this.typeName, props);
    }

    private configureButtonBase(button: UE.Button) {
        const style = button.WidgetStyle;
        const setBrushTransparent = (brush: UE.SlateBrush) => {
            if (!brush) {
                return;
            }
            brush.TintColor = brush.TintColor ?? new UE.SlateColor();
            brush.TintColor.SpecifiedColor = new UE.LinearColor(0, 0, 0, 0);
            brush.DrawAs = UE.ESlateBrushDrawType.NoDrawType;
        };

        setBrushTransparent(style.Normal);
        setBrushTransparent(style.Hovered);
        setBrushTransparent(style.Pressed);
        setBrushTransparent(style.Disabled);

        button.SetBackgroundColor(new UE.LinearColor(0, 0, 0, 0));
        button.SetColorAndOpacity(new UE.LinearColor(1, 1, 1, 1));
        style.NormalPadding = new UE.Margin(0, 0, 0, 0);
        style.PressedPadding = new UE.Margin(0, 0, 0, 0);
    }

    private applyProgressStyles(progressBar: UE.ProgressBar) {
        if (!progressBar) {
            return;
        }

        const parsedBackground = parseBackgroundProps(this.styles);
        if (parsedBackground?.image) {
            progressBar.WidgetStyle.BackgroundImage = parsedBackground.image;
        }
        if (parsedBackground?.color) {
            progressBar.WidgetStyle.BackgroundImage.Tint = parsedBackground.color;
        }

        const fill =
            this.styles?.fill ??
            this.styles?.color ??
            this.styles?.backgroundColor ??
            this.styles?.fillColor;
        if (fill) {
            progressBar.SetFillColorAndOpacity(toLinearColor(fill));
        }
    }

    private normalizeNumber(value: any, fallback: number): number {
        if (value === undefined || value === null) {
            return fallback;
        }
        return safeParseFloat(value);
    }

    private isIndeterminate(props: any): boolean {
        if (props && Object.prototype.hasOwnProperty.call(props, "indeterminate")) {
            return !!props.indeterminate;
        }

        if (props && Object.prototype.hasOwnProperty.call(props, "value")) {
            const raw = props.value;
            return raw === undefined || raw === null || raw === "";
        }

        return true;
    }

    private applyValueState(props: any) {
        if (!this.progressBar) {
            return;
        }

        const min = this.normalizeNumber(props?.min, DEFAULT_MIN);
        let max = this.normalizeNumber(props?.max, DEFAULT_MAX);
        if (!Number.isFinite(max) || max <= min) {
            max = min + 1;
        }

        const indeterminate = this.isIndeterminate(props);
        this.currentMin = min;
        this.currentMax = max;
        this.isMarquee = indeterminate;

        if (indeterminate) {
            this.currentValue = null;
            this.progressBar.SetIsMarquee(true);
            return;
        }

        const rawValue = this.normalizeNumber(props?.value, min);
        const clamped = Math.min(Math.max(rawValue, min), max);
        this.currentValue = clamped;

        const range = max - min;
        const percent = range <= 0 ? 0 : (clamped - min) / range;

        this.progressBar.SetIsMarquee(false);
        this.progressBar.SetPercent(percent);
    }

    private emitEvent(name: ProgressEventName, type: string) {
        const handler = this.props?.[name];
        if (typeof handler === "function") {
            handler(createSyntheticEvent(type, this.currentValue, this.currentMin, this.currentMax));
        }
    }

    private emitKeyDown(key: string) {
        const handler = this.props?.onKeyDown;
        if (typeof handler === "function") {
            handler(createKeyboardEvent(key, this.currentValue, this.currentMin, this.currentMax));
        }
    }

    private handleFocus(source: string) {
        if (!this.button || this.focused) {
            return;
        }

        this.focused = true;

        if (this.button.IsFocusable) {
            this.button.SetKeyboardFocus();
        }

        this.emitEvent("onFocus", `focus:${source}`);
        this.ensurePolling();
    }

    private handleBlur(source: string) {
        if (!this.focused) {
            return;
        }
        this.focused = false;
        this.emitEvent("onBlur", `blur:${source}`);
        this.stopPolling();
    }

    private ensurePolling() {
        if (this.keyPollHandle !== undefined) {
            return;
        }

        this.keyPollHandle = setInterval(() => {
            if (!this.button) {
                this.stopPolling();
                return;
            }

            if (this.focused) {
                const stillFocused = this.button.HasKeyboardFocus() || this.button.HasAnyUserFocus();
                if (!stillFocused) {
                    this.handleBlur("focus-check");
                    return;
                }

                if (typeof this.props?.onKeyDown === "function") {
                    this.pollKeyboard();
                }
            }
        }, KEY_POLL_INTERVAL_MS);
    }

    private stopPolling() {
        if (this.keyPollHandle !== undefined) {
            clearInterval(this.keyPollHandle);
            this.keyPollHandle = undefined;
        }
    }

    private pollKeyboard() {
        const world = UE.UMGManager.GetCurrentWorld();
        if (!world) {
            return;
        }

        const controller = UE.GameplayStatics.GetPlayerController(world, 0);
        if (!controller) {
            return;
        }

        for (const mapping of KEY_MAPPINGS) {
            if (controller.WasInputKeyJustPressed(mapping.key)) {
                this.emitKeyDown(mapping.eventKey);
            }
        }
    }

    private setupEventHandlers(button: UE.Button) {
        const handleClick = () => {
            const now = Date.now();
            const isDouble = now - this.lastClickTimestamp <= DOUBLE_CLICK_THRESHOLD_MS;
            this.lastClickTimestamp = now;

            this.emitEvent("onClick", "click");
            this.handleFocus("click");

            if (isDouble && typeof this.props?.onDoubleClick === "function") {
                this.emitEvent("onDoubleClick", "doubleClick");
            }
        };

        const handleMouseEnter = () => {
            this.emitEvent("onMouseEnter", "mouseEnter");
        };

        const handleMouseLeave = () => {
            this.emitEvent("onMouseLeave", "mouseLeave");
            if (!this.button?.HasKeyboardFocus()) {
                this.handleBlur("mouseLeave");
            }
        };

        const clickWrapper = () => handleClick();
        const hoverWrapper = () => handleMouseEnter();
        const unhoverWrapper = () => handleMouseLeave();

        button.OnClicked.Add(clickWrapper);
        button.OnHovered.Add(hoverWrapper);
        button.OnUnhovered.Add(unhoverWrapper);

        this.eventHandlers.onClick = clickWrapper;
        this.eventHandlers.onMouseEnter = hoverWrapper;
        this.eventHandlers.onMouseLeave = unhoverWrapper;
    }

    private teardownEventHandlers(button: UE.Button) {
        if (this.eventHandlers.onClick) {
            button.OnClicked.Remove(this.eventHandlers.onClick);
            this.eventHandlers.onClick = undefined;
        }
        if (this.eventHandlers.onMouseEnter) {
            button.OnHovered.Remove(this.eventHandlers.onMouseEnter);
            this.eventHandlers.onMouseEnter = undefined;
        }
        if (this.eventHandlers.onMouseLeave) {
            button.OnUnhovered.Remove(this.eventHandlers.onMouseLeave);
            this.eventHandlers.onMouseLeave = undefined;
        }
    }

    private updateInteractivity(props: any) {
        if (!this.button) {
            return;
        }

        const disabled = !!props?.disabled;
        this.button.SetIsEnabled(!disabled);

        const tabIndex = props?.tabIndex;
        const focusable =
            !!props?.focusable ||
            typeof tabIndex === "number" && tabIndex >= 0 ||
            typeof props?.onKeyDown === "function" ||
            typeof props?.onFocus === "function";

        this.button.IsFocusable = focusable;

        if (!focusable && this.focused) {
            this.handleBlur("focusable-change");
        }
    }

    createNativeWidget() {
        this.button = new UE.Button(this.outer);
        this.configureButtonBase(this.button);

        this.progressBar = new UE.ProgressBar(this.outer);
        const slot = this.button.AddChild(this.progressBar) as UE.ButtonSlot;
        slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill);
        slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill);
        slot.SetPadding(new UE.Margin(0, 0, 0, 0));

        this.applyProgressStyles(this.progressBar);
        this.applyValueState(this.props);
        this.updateInteractivity(this.props);
        this.setupEventHandlers(this.button);

        if (this.props?.autoFocus) {
            setTimeout(() => this.handleFocus("auto"), 0);
        }

        UE.UMGManager.SynchronizeWidgetProperties(this.progressBar);
        UE.UMGManager.SynchronizeWidgetProperties(this.button);

        return this.button;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any) {
        const button = widget as UE.Button;
        if (!button) {
            return;
        }

        const nextProps = { ...oldProps, ...changedProps };
        this.props = nextProps;
        this.refreshStyles(nextProps);

        this.applyProgressStyles(this.progressBar!);
        this.applyValueState(nextProps);
        this.updateInteractivity(nextProps);

        UE.UMGManager.SynchronizeWidgetProperties(this.progressBar);
        UE.UMGManager.SynchronizeWidgetProperties(button);
    }

    removeChild(parent: UE.Widget, child: UE.Widget) {
        super.removeChild(parent, child);
        this.handleBlur("remove");
        if (this.button && this.eventHandlers) {
            this.teardownEventHandlers(this.button);
        }
    }
}
