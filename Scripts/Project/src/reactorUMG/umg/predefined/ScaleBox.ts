import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';

export class ScaleBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private parseStretch(stretch: string, scale: number) {
        let stretchType = UE.EStretch.None;
        switch (stretch) {
            case 'contain':
                stretchType = UE.EStretch.ScaleToFit;
                break;
            case 'cover': 
                stretchType = UE.EStretch.ScaleToFill;
                break;
            case 'fill':
                stretchType = UE.EStretch.Fill;
                break;
            case 'scale-y':
                stretchType = UE.EStretch.ScaleToFitY;
                break;
            case 'scale-x':
                stretchType = UE.EStretch.ScaleToFitX;
                break;
            case 'custom':
                stretchType = UE.EStretch.UserSpecified;
                break;
        }

        if (scale && stretch === 'custom') {
            return {
                Stretch: stretchType,
                UserSpecifiedScale: scale
            };
        }

        return {
            Stretch: stretchType
        };

    }

    private initScaleBoxProps(scaleBox: UE.ScaleBox, props: any) {
        const stretch = props?.stretch;
        const scale = props?.scale;
        if (stretch) {
            const {Stretch, UserSpecifiedScale} = this.parseStretch(stretch, scale);
            scaleBox.SetStretch(Stretch);
            if (UserSpecifiedScale) {
                scaleBox.SetUserSpecifiedScale(UserSpecifiedScale);
            }
        }
    }

    createNativeWidget(): UE.Widget {
        const scaleBox = new UE.ScaleBox(this.outer);
        this.initScaleBoxProps(scaleBox, this.props);
        return scaleBox;
    }   

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const scaleBox = widget as UE.ScaleBox;
        this.initScaleBoxProps(scaleBox, changedProps);
    }
}
