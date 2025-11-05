import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseToLinearColor } from '../../parsers/css_color_parser';
import { parseBrush } from '../../parsers/brush_parser';

export class SliderConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    initSliderCommonProps(slider: UE.Slider | UE.RadialSlider, props: any): boolean {
        if (!props || !slider) return false;

        let propsInit = false;
    
        const valueConvertKeyMap: Record<string, string> = {
            'value': 'Value',
            'stepSize': 'StepSize',
            'locked': 'Locked',
            'useMouseStep': 'MouseUsesStep',
            'controllerLock': 'RequiresControllerLock',
            'focusable': 'IsFocusable'
        }
    
        const colorKeyMap: Record<string, string> = {
            'sliderBarColor': 'SliderBarColor',
            'sliderThumbColor': 'SliderHandleColor',
        }
    
        const styleKeyMap: Record<string, string> = {
            'normalBarBackground': 'NormalBarImage',
            'hoverBarBackground': 'HoveredBarImage',
            'disabledBarBackground': 'DisabledBarImage',
            'normalThumbBackground': 'NormalThumbImage',
            'hoveredThumbBackground': 'HoveredThumbImage',
            'disabledThumbBackground': 'DisabledThumbImage'
        }
    
        const eventKeyMap: Record<string, string> = {
            'onValueChanged': 'OnValueChanged',
            'onMouseCaptureBegin': 'OnMouseCaptureBegin',
            'onMouseCaptureEnd': 'OnMouseCaptureEnd',
            'onControllerCaptureBegin': 'OnControllerCaptureBegin',
            'onControllerCaptureEnd': 'OnControllerCaptureEnd',
        }
    
        for (const key in props) {
            if (valueConvertKeyMap[key]) {
                slider[valueConvertKeyMap[key]] = props[key];
                propsInit = true;
            } else if (colorKeyMap[key]) {
                if (props?.sliderStyle) {
                    const color = parseToLinearColor(props.sliderStyle[key]);
                    slider[colorKeyMap[key]] = new UE.LinearColor(color.r, color.g, color.b, color.a);
                    propsInit = true;
                }
            } else if (styleKeyMap[key]) {
                if (props?.sliderStyle) {
                    slider.WidgetStyle[styleKeyMap[key]] = parseBrush(props.sliderStyle[key]);
                    propsInit = true;
                }
            } else if (key === 'barThickness') {
                if (props?.sliderStyle) {
                    slider.WidgetStyle.BarThickness = props.sliderStyle.barThickness;
                    propsInit = true;
                }
            }
    
            if (typeof props[key] === 'function') {
                if (eventKeyMap[key]) {
                    slider[eventKeyMap[key]].Add(props[key]);
                    propsInit = true;
                } else if (key === 'valueBinding') {
                    slider.ValueDelegate.Bind(props[key]);
                    propsInit = true;
                }
            }
        }

        return propsInit;
    }

    private initProps(slider: UE.Slider, props: any): boolean {
        if (!slider) return false;

        let propsInit = false;

        const minValue = props?.minValue;
        if (minValue) {
            slider.MinValue = minValue;
            propsInit = true;
        }

        const maxValue = props?.maxValue;
        if (maxValue) {
            slider.MaxValue = maxValue;
            propsInit = true;
        }

        const indentHandle = props?.indentHandle;
        if (indentHandle) {
            slider.IndentHandle = indentHandle;
            propsInit = true;
        }

        const orientation = props?.orientation;
        if (orientation) {
            switch (orientation) {
                case 'horizontal':
                    slider.Orientation = UE.EOrientation.Orient_Horizontal;
                    break;
                case 'vertical':
                    slider.Orientation = UE.EOrientation.Orient_Vertical;
                    break;
                default:
                    slider.Orientation = UE.EOrientation.Orient_Horizontal;
                    break;
            }
            propsInit = true;
        }

        return this.initSliderCommonProps(slider, props) || propsInit;
    }

    createNativeWidget(): UE.Widget {
        const slider = new UE.Slider(this.outer);
        const propsInit = this.initProps(slider, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(slider);
        }
        return slider;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const slider = widget as UE.Slider;
        const propsChanged = this.initProps(slider, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(slider);
        }
    }
    
}
