import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseBrush } from '../../parsers/brush_parser';

export class ThrobberConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }
    private readonly valueConvertKeyMap: Record<string, string> = {
        'pieces': 'NumberOfPieces',
        'animationHorizontal': 'bAnimationHorizontal',
        'animationVertical': 'bAnimationVertical',
        'animationOpacity': 'bAnimationOpacity',
    }

    private initProps(throbber: UE.Throbber, props: any): boolean {
        let propsInit = false;

        for (const key in props) {
            if (this.valueConvertKeyMap[key]) {
                throbber[this.valueConvertKeyMap[key]] = props[key];
                propsInit = true;
            } else if (key === 'image') {
                throbber.Image = parseBrush(props[key]);
                propsInit = true;
            }   
        }

        return propsInit;
    }

    createNativeWidget(): UE.Widget {
        const throbber = new UE.Throbber(this.outer);
        const propsInit = this.initProps(throbber, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(throbber);
        }
        return throbber;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const throbber = widget as UE.Throbber;
        const propsChanged = this.initProps(throbber, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(throbber);
        }
    }
}
