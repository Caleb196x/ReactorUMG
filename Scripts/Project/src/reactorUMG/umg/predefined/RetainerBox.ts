import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';

export class RetainerBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private initRetainerBoxProps(retainerBox: UE.RetainerBox, props: any): boolean {
        let propsInit = false;
        const retainRender = props?.retainRender;
        if (retainRender) {
            retainerBox.bRetainRender = retainRender;
            propsInit = true;
        }

        const renderOnInvalidate = props?.renderOnInvalidate;
        if (renderOnInvalidate) {
            retainerBox.RenderOnInvalidation = renderOnInvalidate;
            propsInit = true;
        }

        const renderOnPhase = props?.renderOnPhase;
        if (renderOnPhase) {
            retainerBox.RenderOnPhase = renderOnPhase;
            propsInit = true;
        }

        const phase = props?.phase;
        if (phase) {
            retainerBox.Phase = phase;
            propsInit = true;
        }

        const phaseCount = props?.phaseCount;
        if (phaseCount) {
            retainerBox.PhaseCount = phaseCount;
            propsInit = true;
        }

        return propsInit;
    }

    createNativeWidget(): UE.Widget {
        const retainerBox = new UE.RetainerBox(this.outer);
        const propsInit = this.initRetainerBoxProps(retainerBox, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(retainerBox);
        }
        
        return retainerBox;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const retainerBox = widget as UE.RetainerBox;
        const propsChanged = this.initRetainerBoxProps(retainerBox, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(retainerBox);
        }
    }
}
