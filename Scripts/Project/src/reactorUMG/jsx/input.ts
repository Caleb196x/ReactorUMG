import * as UE from 'ue';
import { JSXConverter } from './jsx_converter';
import { getAllStyles } from '../parsers/cssstyle_parser';
import { hasFontStyles, setupFontStyles } from '../parsers/css_font_parser';
import { compareTwoFunctions } from '../misc/utils';
export class InputJSXConverter extends JSXConverter {
    private static readonly DEFAULT_SLIDER_WIDTH = 240;
    private isCheckbox: boolean;
    private isSlider: boolean;
    private isRadio: boolean;
    private checkboxChangeCallback: (isChecked: boolean) => void;
    private textChangeCallback: (text: string) => void;

    private sliderChangeCallback: (value: number) => void;
    private lastSliderChangeFunc: Function;

    private lastEditTextOnChangeFunc: Function;
    private lastCheckOnChangeFunc: Function;
    private lastRadioOnChangeFunc: Function;
    private radioInternalUpdate: boolean;
    private sliderWidget?: UE.Slider;
    private sliderWrapper?: UE.SizeBox;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.isCheckbox = false;
        this.isSlider = false;
        this.isRadio = false;
        this.radioInternalUpdate = false;
    }

    private updateTextChangeHandle(widget: UE.EditableText, onChange: Function) {
        // const onChangeFuncSame: boolean = compareTwoFunctions(this.lastEditTextOnChangeFunc, onChange);
        // if (onChangeFuncSame) return;

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
        // const onCheckChangeSame: boolean = compareTwoFunctions(this.lastCheckOnChangeFunc, onChange);
        // if (onCheckChangeSame) return;

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
        
        widget.SetIsChecked(checked == true);
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

    private updateRadioChange(widget: UE.CheckBox, onChange: Function) {
        // const onCheckChangeSame: boolean = compareTwoFunctions(this.lastRadioOnChangeFunc, onChange);
        // if (onCheckChangeSame) return;

        if (this.checkboxChangeCallback) {
            widget.OnCheckStateChanged.Remove(this.checkboxChangeCallback);
        }

        this.checkboxChangeCallback = (isChecked: boolean) => {
            // Prevent recursion for internal resets
            if (this.radioInternalUpdate) {
                this.radioInternalUpdate = false;
                return;
            }
            if (isChecked) {
                onChange({ target: { name: this.props.name, type: 'radio', checked: true } });
            } else {
                // Radio cannot be unchecked by clicking itself; re-check it
                this.radioInternalUpdate = true;
                widget.SetIsChecked(true);
            }
        };
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastRadioOnChangeFunc = onChange;
    }

    private setupRadioChange(widget: UE.CheckBox, onChange: Function) {
        this.checkboxChangeCallback = (isChecked: boolean) => {
            if (this.radioInternalUpdate) {
                this.radioInternalUpdate = false;
                return;
            }
            if (isChecked) {
                onChange({ target: { name: this.props.name, type: 'radio', checked: true } });
            } else {
                this.radioInternalUpdate = true;
                widget.SetIsChecked(true);
            }
        };
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastCheckOnChangeFunc = onChange;
    }

    private setupRadio(widget: UE.CheckBox, props: any, isUpdate: boolean) {
        const { checked, onChange } = props;

        // Force standard checkbox type (visual styling can be provided via UMG styles if available)
        if (widget.WidgetStyle) {
            widget.WidgetStyle.CheckBoxType = UE.ESlateCheckBoxType.CheckBox;
        }

        if (checked ===  true) widget.SetIsChecked(true);
        else if (checked === false) widget.SetIsChecked(false);

        // For radios, clicking an already-checked control should not uncheck it.
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateRadioChange(widget, onChange);
            } else {
                this.setupRadioChange(widget, onChange);
            }
        }
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
        // const onChangeFuncSame: boolean = compareTwoFunctions(this.lastSliderChangeFunc, onChange);
        // if (onChangeFuncSame) return;

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

    private setupSlider(widget: UE.Slider, props: any, isUpdate: boolean): UE.Widget {
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

        if (!isUpdate) {
            this.sliderWrapper = this.createSliderSizeBox(widget);
            return this.sliderWrapper;
        }

        return widget;
    }

    private createSliderSizeBox(slider: UE.Slider): UE.SizeBox {
        if (this.sliderWrapper) {
            return this.sliderWrapper;
        }

        const sizeBox = new UE.SizeBox(this.outer);
        sizeBox.SetWidthOverride(InputJSXConverter.DEFAULT_SLIDER_WIDTH);
        sizeBox.SetMinDesiredWidth(InputJSXConverter.DEFAULT_SLIDER_WIDTH);
        sizeBox.SetMaxDesiredWidth(InputJSXConverter.DEFAULT_SLIDER_WIDTH);
        sizeBox.AddChild(slider);
        return sizeBox;
    }

    private resolveSliderInstance(widget: UE.Widget): UE.Slider | null {
        if (this.sliderWidget) {
            return this.sliderWidget;
        }

        if (widget instanceof UE.Slider) {
            return widget;
        }

        if (widget instanceof UE.SizeBox) {
            const content = widget.GetContent();
            if (content instanceof UE.Slider) {
                return content;
            }
        }

        return null;
    }

    createNativeWidget(): UE.Widget {
        const inputType = this.props?.type || 'text';
        let widget: UE.Widget;

        if (inputType === 'checkbox') {
            widget = new UE.CheckBox(this.outer);
            this.setupCheckbox(widget as UE.CheckBox, this.props, false);
            this.isCheckbox = true;
            this.isRadio = false;
        } else if (inputType === 'radio') {
            widget = new UE.CheckBox(this.outer);
            this.setupRadio(widget as UE.CheckBox, this.props, false);
            this.isRadio = true;
            this.isCheckbox = false;
        } else if (inputType === "range") {
            const slider = new UE.Slider(this.outer);
            this.sliderWidget = slider;
            widget = this.setupSlider(slider, this.props, false);
            this.isSlider = true;
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
        } else if (this.isRadio) {
            this.setupRadio(widget as UE.CheckBox, changedProps, true);
        } else if (this.isSlider){
            const sliderInstance = this.resolveSliderInstance(widget);
            if (sliderInstance) {
                this.sliderWidget = sliderInstance;
                this.setupSlider(sliderInstance, changedProps, true);
            }
        } else {
            this.setupEditableText(widget as UE.EditableText, changedProps, true);
        }
    }
}
