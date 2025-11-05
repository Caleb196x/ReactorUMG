import * as UE from 'ue';
import { SliderConverter } from './Slider';
import { parseToLinearColor } from '../../parsers/css_color_parser';

export class RidialSliderConverter extends SliderConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private readonly valueConvertKeyMap: Record<string, string> = {
        'defaultValue': 'CustomDefaultValue',
        'thumbStartAngle': 'SliderHandleStartAngle',
        'thumbEndPointAngle': 'SliderHandleEndAngle',
        'thumbAngularOffset': 'AngularOffset',
        'showSliderThumb': 'ShowSliderHandle',
        'showSliderHand': 'ShowSliderHand'
    }

    private readonly colorKeyMap: Record<string, string> = {
        'sliderProgressColor': 'SliderProgressColor',
        'backgroundColor': 'CenterBackgroundColor',
    }

    private initRadialSliderProps(radialSlider: UE.RadialSlider, props: any): boolean {
        let propsInit = false;

        for (const key in props) {
            if (this.valueConvertKeyMap[key]) {
                radialSlider[this.valueConvertKeyMap[key]] = props[key];
            } else if (this.colorKeyMap[key]) {
                const color = parseToLinearColor(props[key]);
                radialSlider[this.colorKeyMap[key]] = new UE.LinearColor(color.r, color.g, color.b, color.a);
            } else if (key === 'valueTags') {
                props[key].map((tag: number) => radialSlider.ValueTags.Add(tag));
            }
        }

        return this.initSliderCommonProps(radialSlider, props) || propsInit;
    }

    createNativeWidget(): UE.Widget {
        const radialSlider = new UE.RadialSlider(this.outer);
        const propsInit = this.initRadialSliderProps(radialSlider, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(radialSlider);
        }
        return radialSlider;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const radialSlider = widget as UE.RadialSlider;
        const propsChanged = this.initRadialSliderProps(radialSlider, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(radialSlider);
        }
    }
    
}
