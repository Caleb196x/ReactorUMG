import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';

export class InvalidationBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    createNativeWidget(): UE.Widget {
        const invalidationBox = new UE.InvalidationBox(this.outer);
        const cache = this.props?.cache;
        if (cache) {
            invalidationBox.SetCanCache(cache);
        }
        return invalidationBox;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const invalidationBox = widget as UE.InvalidationBox;

        const cache = changedProps?.cache;
        if (cache) {
            invalidationBox.SetCanCache(cache);
        }
    }
}
