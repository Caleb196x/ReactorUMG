import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseToLinearColor } from '../../parsers/css_color_parser';
import { parseBrush } from '../../parsers/brush_parser';
import { convertToUEMargin } from '../../parsers/css_margin_parser';

export class SpinBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private readonly valueConvertKeyMap: Record<string, string> = {
        'value': 'Value',
        'minValue': 'MinValue',
        'maxValue': 'MaxValue',
        'minSliderValue': 'MinSliderValue',
        'maxSliderValue': 'MaxSliderValue',
        'minFractionDigits': 'MinFractionDigits',
        'maxFractionDigits': 'MaxFractionDigits',
        'useDeltaSnap': 'bAlwaysUsesDeltaSnap',
        'enableSlider': 'bEnableSlider',
        'deltaValue': 'Delta',
        'sliderExponent': 'SliderExponent',
        'minDesiredWidth': 'MinDesiredWidth',
        'clearKeyboardFocusOnCommit': 'ClearKeyboardFocusOnCommit',
        'selectAllTextOnFocus': 'SelectAllTextOnCommit',
        'foregroundColor': 'ForegroundColor',
    }

    private readonly eventKeyMap: Record<string, string> = {
        'onValueChanged': 'OnValueChanged',
        'onValueCommitted': 'OnValueCommitted',
        'onBeginSliderMovement': 'OnBeginSliderMovement',
        'onEndSliderMovement': 'OnEndSliderMovement',
    }

    private readonly styleKeyMap: Record<string, string> = {
        'arrowBackground': 'ArrowImage',
        'normalBackground': 'BackgroundBrush',
        'activeBackground': 'ActiveBackgroundBrush',
        'hoveredBackground': 'HoveredBackgroundBrush',
        'activeFillBackground': 'ActiveFillBrush',
        'hoveredFillBackground': 'HoveredFillBrush',
        'inactiveFillBackground': 'InactiveFillBrush',
    }

    private readonly paddingKeyMap: Record<string, string> = {
        'textPadding': 'TextPadding',
        'insetPadding': 'InsetPadding',
    }

    private readonly colorKeyMap: Record<string, string> = {
        'foregroundColor': 'ForegroundColor',
    }

    private initSpinBoxProps(spinBox: UE.SpinBox, props: any): boolean {
        let propsInit = false;
        
        for (const key in props) {
            if (this.valueConvertKeyMap[key]) {
                spinBox[this.valueConvertKeyMap[key]] = props[key];
                propsInit = true;
            } else if (this.eventKeyMap[key] && typeof props[key] === 'function') {
                spinBox[this.eventKeyMap[key]].Add(props[key]);
                propsInit = true;
            } else if (this.styleKeyMap[key]) {
                spinBox.WidgetStyle[this.styleKeyMap[key]] = parseBrush(props[key]);
                propsInit = true;
            } else if (this.paddingKeyMap[key]) {
                spinBox.WidgetStyle[this.paddingKeyMap[key]] = convertToUEMargin({}, props[key], '', '', '', '');
                propsInit = true;
            } else if (this.colorKeyMap[key]) {
                const rgba = parseToLinearColor(props[key]);
                spinBox.WidgetStyle[this.colorKeyMap[key]] = new UE.LinearColor(rgba.r, rgba.g, rgba.b, rgba.a);
                propsInit = true;
            } else if (key === 'textAlign') {
                switch (props[key]) {
                    case 'left':
                        spinBox.Justification = UE.ETextJustify.Left;
                        break;
                    case 'right':
                        spinBox.Justification = UE.ETextJustify.Right;
                        break;
                    case 'center':
                        spinBox.Justification = UE.ETextJustify.Center;
                        break;
                    default:
                        spinBox.Justification = UE.ETextJustify.Left;
                        break;
                }
                propsInit = true;
            } else if (key === 'keyboardType') {
                switch (props[key]) {
                    case 'number':
                        spinBox.KeyboardType = UE.EVirtualKeyboardType.Number;
                        break;
                    case 'web':
                        spinBox.KeyboardType = UE.EVirtualKeyboardType.Web;
                        break;
                    case 'email':
                        spinBox.KeyboardType = UE.EVirtualKeyboardType.Email;
                        break;
                    case 'password':
                        spinBox.KeyboardType = UE.EVirtualKeyboardType.Password;
                        break;
                    case 'alpha-numberic':
                        spinBox.KeyboardType = UE.EVirtualKeyboardType.AlphaNumeric;
                        break;
                    default:
                        spinBox.KeyboardType = UE.EVirtualKeyboardType.Default;
                        break;
                }
                propsInit = true;
            } else if (key === 'valueBinding') {
                spinBox.ValueDelegate.Bind(props[key]);
                propsInit = true;
            }
        }

        return propsInit;
    }

    createNativeWidget(): UE.Widget {
        const spinBox = new UE.SpinBox(this.outer);
        const propsInit = this.initSpinBoxProps(spinBox, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(spinBox);
        }
        return spinBox;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const spinBox = widget as UE.SpinBox;
        const propsInit = this.initSpinBoxProps(spinBox, changedProps);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(spinBox);
        }
    }
}
