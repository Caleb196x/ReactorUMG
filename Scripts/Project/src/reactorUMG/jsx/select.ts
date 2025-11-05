import * as UE from 'ue';
import { JSXConverter } from './jsx_converter';
import { getAllStyles } from '../parsers/cssstyle_parser';
import { parseBackgroundProps } from '../parsers/css_background_parser';
import { hasFontStyles, setupFontStyles } from '../parsers/css_font_parser';
import { parseToLinearColor } from '../parsers/css_color_parser';
import { compareTwoFunctions } from '../misc/utils';

type OptionItem = { value: string; label: string };

export class SelectConverter extends JSXConverter {
    private options: OptionItem[] = [];
    private labelToValue: Map<string, string> = new Map();
    private onChangeBound?: (SelectedItem: string, SelectionType: UE.ESelectInfo) => void;
    private nativeOnChangeLast: Function;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private applyComboButtonBrushes(combo: UE.ComboBoxString, style: any) {
        if (!combo || !style) return;

        const baseBg = parseBackgroundProps(style);
        if (baseBg?.image) {
            combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Normal = baseBg.image;
        }

        // Pseudo classes
        const hoverStyle = getAllStyles(this.typeName, this.props, 'hover');
        const activeStyle = getAllStyles(this.typeName, this.props, 'active');
        const disabledStyle = getAllStyles(this.typeName, this.props, 'disabled');

        const hoverBg = parseBackgroundProps(hoverStyle || {});
        const activeBg = parseBackgroundProps(activeStyle || {});
        const disabledBg = parseBackgroundProps(disabledStyle || {});

        if (hoverBg?.image) {
            combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Hovered = hoverBg.image;
        }
        if (activeBg?.image) {
            combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Pressed = activeBg.image;
        }
        if (disabledBg?.image) {
            combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Disabled = disabledBg.image;
        }
    }

    private applyTextStyles(combo: UE.ComboBoxString, style: any) {
        if (!combo || !style) return;

        // font
        if (hasFontStyles(style)) {
            if (!combo.Font) {
                combo.Font = new UE.SlateFontInfo();
            }
            setupFontStyles(this.outer, combo.Font, style);
        }

        // color
        const textColor = style?.color ?? style?.textColor;
        if (textColor) {
            const rgba = parseToLinearColor(textColor);
            if (!combo.ForegroundColor) {
                combo.ForegroundColor = new UE.SlateColor();
            }
            combo.ForegroundColor.SpecifiedColor.R = rgba.r;
            combo.ForegroundColor.SpecifiedColor.G = rgba.g;
            combo.ForegroundColor.SpecifiedColor.B = rgba.b;
            combo.ForegroundColor.SpecifiedColor.A = rgba.a;
        }
    }

    private syncOptions(combo: UE.ComboBoxString) {
        combo.ClearOptions();
        for (const opt of this.options) {
            combo.DefaultOptions.Add(opt.label);
            combo.AddOption(opt.label);
        }
    }

    private setSelection(combo: UE.ComboBoxString, props: any) {
        const value = props?.value ?? props?.defaultValue;
        if (value !== undefined && value !== null) {
            // find label by value
            let label: string | undefined;
            for (const opt of this.options) {
                if (String(opt.value) === String(value)) { label = opt.label; break; }
            }
            if (label !== undefined) {
                combo.SetSelectedOption(label);
            }
        }
    }

    private ensureOnChange(combo: UE.ComboBoxString, props: any, isUpdate: boolean) {
        const onChange = props?.onChange;

        const rebindOnChange = (onChange: Function) => {
            if (!onChange) return;

            if (this.onChangeBound) {
                combo.OnSelectionChanged.Remove(this.onChangeBound);
            }

            this.onChangeBound = (selectedLabel: string, _type: UE.ESelectInfo) => {
                const val = this.labelToValue.get(selectedLabel) ?? selectedLabel;
                try { onChange({ target: { value: val } }); } catch {}
            };
            combo.OnSelectionChanged.Add(this.onChangeBound);
        };

        if (isUpdate) {
            if (!compareTwoFunctions(this.nativeOnChangeLast, onChange)) {
                rebindOnChange(onChange);
            }
        } else {
            if (onChange && typeof onChange === 'function') {
                rebindOnChange(onChange);
                this.nativeOnChangeLast = onChange;
            }
        }
    }

    private extractLabelFromChildren(children: any): string | undefined {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) {
            for (const c of children) {
                if (typeof c === 'string') return c;
            }
        }
        return undefined;
    }

    createNativeWidget(): UE.Widget {
        const combo = new UE.ComboBoxString(this.outer);

        // apply styles
        const style = getAllStyles(this.typeName, this.props);
        this.applyComboButtonBrushes(combo, style);
        this.applyTextStyles(combo, style);

        // disabled / focusable
        if (this.props?.disabled !== undefined) {
            combo.bIsEnabled = !this.props.disabled;
        }
        if (this.props?.focusable !== undefined) {
            combo.bIsFocusable = !!this.props.focusable;
        }

        // options will be appended via appendChild
        // initial selection and handler
        this.setSelection(combo, this.props);
        this.ensureOnChange(combo, this.props, false);

        UE.UMGManager.SynchronizeWidgetProperties(combo);
        return combo;
    }

    update(widget: UE.Widget, _oldProps: any, changedProps: any): void {
        const combo = widget as UE.ComboBoxString;

        const style = getAllStyles(this.typeName, { ...this.props, ...changedProps });
        this.applyComboButtonBrushes(combo, style);
        this.applyTextStyles(combo, style);

        if (changedProps?.disabled !== undefined) {
            combo.bIsEnabled = !changedProps.disabled;
        }
        if (changedProps?.focusable !== undefined) {
            combo.bIsFocusable = !!changedProps.focusable;
        }

        this.setSelection(combo, changedProps);
        this.ensureOnChange(combo, changedProps, true);

        UE.UMGManager.SynchronizeWidgetProperties(combo);
    }

    appendChild(parent: UE.Widget, _child: UE.Widget, childTypeName: string, childProps: any): void {
        const combo = parent as UE.ComboBoxString;
        if (childTypeName !== 'option') return;

        const label = this.extractLabelFromChildren(childProps?.children) ?? String(childProps?.value ?? '');
        const value = String(childProps?.value ?? label ?? '');

        const item: OptionItem = { value, label: label ?? value };
        this.options.push(item);
        this.labelToValue.set(item.label, item.value);

        // reflect to native immediately
        combo.DefaultOptions.Add(item.label);
        combo.AddOption(item.label);

        // if this option matches selected value, set selection
        const curVal = this.props?.value ?? this.props?.defaultValue;
        if (curVal !== undefined && String(curVal) === item.value) {
            combo.SetSelectedOption(item.label);
        }
    }

    removeChild(parent: UE.Widget, child: UE.Widget): void {
        // For option removal, we cannot infer props from native. Keep simple: no-op.
        // In practice, options rarely removed dynamically in current demos.
        if (!(parent instanceof UE.PanelWidget)) {
            // nothing to do; ComboBoxString is not a panel
        }
    }
}
