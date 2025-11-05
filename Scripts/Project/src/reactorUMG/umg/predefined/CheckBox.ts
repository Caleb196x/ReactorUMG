import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseBrush } from '../../parsers/brush_parser';
import { convertPadding } from '../../parsers/css_margin_parser';
import { parseToLinearColor } from '../../parsers/css_color_parser';
import { getAllStyles } from '../../parsers/cssstyle_parser';

export class CheckBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private setupCheckboxStyle(checkbox: UE.CheckBox, props: any): boolean {
        const checkboxStyle = getAllStyles(this.typeName, props);
        if (!checkboxStyle) {
            return false;
        }
        let propsChanged = false;
        
        const imageStyleMap: Record<string, string> = {
            'uncheckedBackground': 'UncheckedImage',
            'uncheckedHoveredBackground': 'UncheckedHoveredImage',
            'uncheckedPressedBackground': 'UncheckedPressedImage',
            'checkedBackground': 'CheckedImage',
            'checkedHoveredBackground': 'CheckedHoveredImage',
            'checkedPressedBackground': 'CheckedPressedImage',
            'undeterminedBackground': 'UndeterminedImage',
            'undeterminedHoveredBackground': 'UndeterminedHoveredImage',
            'undeterminedPressedBackground': 'UndeterminedPressedBrush',
            'normalBackground': 'BackgroundImage',
            'normalHoveredBackground': 'BackgroundHoveredImage',
            'normalPressedBackground': 'BackgroundPressedImage',
        }

        const soundMap: Record<string, string> = {
            'checkSound': 'CheckedSlateSound',
            'uncheckSound': 'UncheckedSlateSound',
            'hoveredSound': 'HoveredSlateSound',
        }

        for (const [key, value] of Object.entries(checkboxStyle)) {
            if (imageStyleMap[key]) {
                checkbox.WidgetStyle[imageStyleMap[key]] = parseBrush(value);
                propsChanged = true;
            } else if (soundMap[key]) {
                // todo@Caleb196x: 需要解析sound
                checkbox.WidgetStyle[soundMap[key]] = {};
                propsChanged = true;
            } else if (key === 'padding') {
                checkbox.WidgetStyle.Padding = convertPadding(checkboxStyle);
                propsChanged = true;
            } else if (key === 'color') {
                const rgba = parseToLinearColor(value as string);
                checkbox.WidgetStyle.ForegroundColor.SpecifiedColor.R = rgba.r;
                checkbox.WidgetStyle.ForegroundColor.SpecifiedColor.G = rgba.g;
                checkbox.WidgetStyle.ForegroundColor.SpecifiedColor.B = rgba.b;
                checkbox.WidgetStyle.ForegroundColor.SpecifiedColor.A = rgba.a;
                propsChanged = true;
            } else if (key === 'type') {
                switch (value) {
                    case 'checkbox':
                        checkbox.WidgetStyle.CheckBoxType = UE.ESlateCheckBoxType.CheckBox;
                        break;
                    case 'toggle':
                        checkbox.WidgetStyle.CheckBoxType = UE.ESlateCheckBoxType.ToggleButton;
                        break;
                    case 'default':
                    default:
                        checkbox.WidgetStyle.CheckBoxType = UE.ESlateCheckBoxType.CheckBox;
                        break;
                }
                propsChanged = true;
            }
        }

        return propsChanged;
    }

    private setupProps(checkBox: UE.CheckBox, props: any): boolean {
        let propsChanged = this.setupCheckboxStyle(checkBox, props);
        const checked = props?.checked;
        if (checked) {
            checkBox.SetIsChecked(checked);
            propsChanged = true;
        }

        const stateBinding = props?.checkStateBinding;
        if (stateBinding && typeof stateBinding === 'function') {
            checkBox.CheckedStateDelegate.Bind(stateBinding);
            propsChanged = true;
        }

        return propsChanged;
    }

    createNativeWidget(): UE.Widget {
        const checkBox = new UE.CheckBox(this.outer);
        const propsInit = this.setupProps(checkBox, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(checkBox);
        }
        return checkBox;
    }
    
    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const checkBox = widget as UE.CheckBox;
        const propsChanged = this.setupProps(checkBox, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(checkBox);
        }
    }
}

