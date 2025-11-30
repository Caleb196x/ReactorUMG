import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';

export class ViewportConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    createNativeWidget(): UE.Widget {
        const viewport = new UE.Viewport(this.outer);
        return viewport;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const viewport = widget as UE.Viewport;
        UE.UMGManager.SynchronizeWidgetProperties(viewport);
    }
}
