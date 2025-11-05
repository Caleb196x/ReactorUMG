import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseAspectRatio } from '../../parsers/css_length_parser';
import { safeParseFloat } from "../../misc/utils";

export class SizeBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private readonly keyMap: Record<string, string> = {
        'width': 'WidthOverride',
        'height': 'HeightOverride',
        'minWidth': 'MinDesiredWidth',
        'minHeight': 'MinDesiredHeight',
        'maxWidth': 'MaxDesiredWidth',
        'maxHeight': 'MaxDesiredHeight',
        'minAspectRatio': 'MinAspectRatio',
        'maxAspectRatio': 'MaxAspectRatio',
    };

    private initSizeBoxProps(sizeBox: UE.SizeBox, props: any): boolean {
        let propsInit = false;
        for (const key in props) {
            if (this.keyMap[key]) {
                const value = props[key];
                if (typeof value === 'number') {
                    sizeBox[this.keyMap[key]] = value;
                    propsInit = true;
                } else if (typeof value === 'string') {
                    if (key == 'minAspectRatio' || key == 'maxAspectRatio') {
                        sizeBox[this.keyMap[key]] = parseAspectRatio(value);
                    } else {
                        sizeBox[this.keyMap[key]] = safeParseFloat(value);
                    }
                    propsInit = true;
                }
            }
        }

        return propsInit;
    }

    createNativeWidget(): UE.Widget {
        const sizeBox = new UE.SizeBox(this.outer);
        const propsInit = this.initSizeBoxProps(sizeBox, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(sizeBox);
        }
        return sizeBox;
    }
   
    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const sizeBox = widget as UE.SizeBox;
        const propsInit = this.initSizeBoxProps(sizeBox, changedProps);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(sizeBox);
        }
    }
}
