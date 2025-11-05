import * as UE from 'ue';
import { JSXConverter } from './jsx_converter';
import { getAllStyles } from '../parsers/cssstyle_parser';
import { hasFontStyles, setupFontStyles } from '../parsers/css_font_parser';
import { compareTwoFunctions } from '../misc/utils';
export class InputJSXConverter extends JSXConverter {
    private isCheckbox: boolean;
    private isSlider: boolean;
    private checkboxChangeCallback: (isChecked: boolean) => void;
    private textChangeCallback: (text: string) => void;

    private sliderChangeCallback: (value: number) => void;
    private lastSliderChangeFunc: Function;

    private lastEditTextOnChangeFunc: Function;
    private lastCheckOnChangeFunc: Function;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.isCheckbox = false;
        this.isSlider = false;
    }

    private updateTextChangeHandle(widget: UE.EditableText, onChange: Function) {
        const onChangeFuncSame: boolean = compareTwoFunctions(this.lastEditTextOnChangeFunc, onChange);
        if (onChangeFuncSame) return;

        if (this.textChangeCallback) {
            widget.OnTextChanged.Remove(this.textChangeCallback);
        }

        this.textChangeCallback = (text: string) => onChange({target: {name: this.props.name, type: this.props.type, value: text}});
        widget.OnTextChanged.Add(this.textChangeCallback);
        this.lastEditTextOnChangeFunc = onChange;
    }

    private setupTextChangeHandle(widget: UE.EditableText, onChange: Function) {
        this.textChangeCallback = (text: string) => onChange({target: {name: this.props.name, type: this.props.type, value: text}});
        widget.OnTextChanged.Add(this.textChangeCallback);
        this.lastEditTextOnChangeFunc = onChange;
    }

    private updateCheckboxChange(widget: UE.CheckBox, onChange: Function) {
        const onCheckChangeSame: boolean = compareTwoFunctions(this.lastCheckOnChangeFunc, onChange);
        if (onCheckChangeSame) return;

        if (this.checkboxChangeCallback) {
            widget.OnCheckStateChanged.Remove(this.checkboxChangeCallback);
        }
        this.checkboxChangeCallback = (isChecked: boolean) => onChange({target: {checked: isChecked}});
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastCheckOnChangeFunc = onChange;
    }

    private setupCheckboxChange(widget: UE.CheckBox, onChange: Function) {
        this.checkboxChangeCallback = (isChecked: boolean) => onChange({target: {checked: isChecked}});
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastCheckOnChangeFunc = onChange;
    }

    private setupCheckbox(widget: UE.CheckBox, props: any, isUpdate: boolean) {
        const { checked, onChange } = props;
        
        if (checked) widget.SetIsChecked(true);
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateCheckboxChange(widget, onChange);
            } else {
                this.setupCheckboxChange(widget, onChange);
            }
        }
        // set checkbox style
        // umg checkbox to more styles
    }

    private setupEditableText(widget: UE.EditableText, props: any, isUpdate: boolean) {
        const { placeholder, defaultValue, disabled, readOnly, onChange } = props;
        
        if (placeholder) widget.SetHintText(placeholder);
        if (defaultValue) widget.SetText(defaultValue);
        if (disabled) widget.SetIsEnabled(false);
        if (readOnly) widget.SetIsReadOnly(true);
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateTextChangeHandle(widget, onChange);
            } else {
                this.setupTextChangeHandle(widget, onChange);
            }
        }
        // set editable text style for font, color, etc.
        const styles = getAllStyles(this.typeName, props);
        if (hasFontStyles(styles)) {
            if (!widget.WidgetStyle || !widget.WidgetStyle.Font) {
                const fontStyles = new UE.SlateFontInfo();
                setupFontStyles(widget, fontStyles, styles);
                widget.SetFont(fontStyles);
            } else {
                setupFontStyles(widget, widget.WidgetStyle.Font, styles);
            }
        }
    }

    private updateSliderChangeHandle(widget: UE.Slider, onChange: Function) {
        const onChangeFuncSame: boolean = compareTwoFunctions(this.lastSliderChangeFunc, onChange);
        if (onChangeFuncSame) return;

        if (this.sliderChangeCallback) {
            widget.OnValueChanged.Remove(this.sliderChangeCallback);
        }

        this.sliderChangeCallback = (value: number) => onChange({ target: { value } });
        widget.OnValueChanged.Add(this.sliderChangeCallback);
        this.lastSliderChangeFunc = onChange;
    }

    private setupSliderChangeHandle(widget: UE.Slider, onChange: Function) {
        this.sliderChangeCallback = (value: number) => onChange({ target: { value } });
        widget.OnValueChanged.Add(this.sliderChangeCallback);
        this.lastSliderChangeFunc = onChange;
    }

    private setupSlider(widget: UE.Slider, props: any, isUpdate: boolean) {
        const { value, min, max, step, onChange } = props;

        // Set Slider properties
        if (value !== undefined) widget.SetValue(value);
        if (min !== undefined) widget.SetMinValue(min);
        if (max !== undefined) widget.SetMaxValue(max);
        if (step !== undefined) widget.SetStepSize(step);

        // Set slider style (optional)
        if (props.sliderBarColor) widget.SetSliderBarColor(props.sliderBarColor);
        if (props.sliderHandleColor) widget.SetSliderHandleColor(props.sliderHandleColor);

        // Handle onChange event
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateSliderChangeHandle(widget, onChange);
            } else {
                this.setupSliderChangeHandle(widget, onChange);
            }
        }
    }

    createNativeWidget(): UE.Widget {
        const inputType = this.props?.type || 'text';
        let widget: UE.Widget;

        if (inputType === 'checkbox') {
            widget = new UE.CheckBox(this.outer);
            this.setupCheckbox(widget as UE.CheckBox, this.props, false);
            this.isCheckbox = true;
        } else if (inputType === "range") {
            widget = new UE.Slider(this.outer);
            this.setupSlider(widget as UE.Slider, this.props, false);
        } else {
            widget = new UE.EditableText(this.outer);
            if (inputType === 'password') {
                (widget as UE.EditableText).SetIsPassword(true);
            }
            this.setupEditableText(widget as UE.EditableText, this.props, false);
        }
        
        return widget;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        if (this.isCheckbox) {
            this.setupCheckbox(widget as UE.CheckBox, changedProps, true);
        } else {
            this.setupEditableText(widget as UE.EditableText, changedProps, true);
        }
    }
}