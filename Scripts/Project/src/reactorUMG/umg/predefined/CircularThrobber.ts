import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseBrush } from '../../parsers/brush_parser';

export class CircularThrobberConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private valueConvertKeyMap: Record<string, string> = {
        'radius': 'Radius',
        'pieces': 'NumberOfPieces',
        'period': 'Period',
        'enableRadius': 'bEnableRadius',
    }

    private setupProps(circularThrobber: UE.CircularThrobber, props: any): boolean {
        let propsChanged = false;
        for (const key in this.props) {
            if (this.valueConvertKeyMap[key]) {
                circularThrobber[this.valueConvertKeyMap[key]] = this.props[key];
                propsChanged = true;
            } else if (key === 'image') {
                circularThrobber.Image = parseBrush(this.props[key]);
                propsChanged = true;
            }
        }

        return propsChanged;
    }

    createNativeWidget(): UE.Widget {
        const circularThrobber = new UE.CircularThrobber(this.outer);

        const propsInit = this.setupProps(circularThrobber, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(circularThrobber);
        }
        
        return circularThrobber;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const circularThrobber = widget as UE.CircularThrobber;
        const propsChanged = this.setupProps(circularThrobber, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(circularThrobber);
        }
    }
}
