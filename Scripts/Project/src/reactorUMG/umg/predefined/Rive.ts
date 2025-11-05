import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { Rive } from 'reactorUMG';

export class RiveConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private convertFitType(fitType: string) {
        switch (fitType) {
            case "contain":
                return UE.ERiveFitType.Contain;
            case "cover":
                return UE.ERiveFitType.Cover;
            case "fill":
                return UE.ERiveFitType.Fill;
            case "fit-width":
                return UE.ERiveFitType.FitWidth;
            case "fit-height":
                return UE.ERiveFitType.FitHeight;
            case "none":
                return UE.ERiveFitType.None;
            case "scale-down":
                return UE.ERiveFitType.ScaleDown;
            case "layout":
                return UE.ERiveFitType.Layout;
            default:
                return UE.ERiveFitType.Contain;
        }
    }

    private convertAlignment(alignment: string) {
        switch (alignment) {
            case "top-left":
                return UE.ERiveAlignment.TopLeft;
            case "top-center":
                return UE.ERiveAlignment.TopCenter;
            case "top-right":
                return UE.ERiveAlignment.TopRight;
            case "center-left":
                return UE.ERiveAlignment.CenterLeft;
            case "center-right":
                return UE.ERiveAlignment.CenterRight;
            case "bottom-left":
                return UE.ERiveAlignment.BottomLeft;
            case "bottom-center":
                return UE.ERiveAlignment.BottomCenter;
            case "bottom-right":
                return UE.ERiveAlignment.BottomRight;
            case "center":
                return UE.ERiveAlignment.Center;
            default:
                return UE.ERiveAlignment.Center;
        }
    }

    private initRiveProps(rive: UE.RiveWidget, props: any) {
        if (!rive) {
            return;
        }

        const artBoard = props?.artBoard || "";
        const artBoardIndex = props?.artBoardIndex || 0;
        const fitType = props?.fitType || "contain";
        const scale = props?.scale || 1.0;
        const alignment = props?.alignment || "center";

        const riveFile = props?.rive;
        if (riveFile) {
            const descriptor = new UE.RiveDescriptor();
            descriptor.RiveFile = UE.UMGManager.LoadRiveFile(rive, riveFile, __dirname);
            descriptor.ArtboardName = artBoard;
            descriptor.ArtboardIndex = artBoardIndex;
            descriptor.FitType = this.convertFitType(fitType);
            descriptor.ScaleFactor = scale;
            descriptor.Alignment = this.convertAlignment(alignment);
            rive.SetRiveDescriptor(descriptor);
        }

        const RiveReady = props?.onRiveReady;
        if (RiveReady) {
            rive.OnRiveReady.Add(RiveReady);
        }

        return;
    }

    createNativeWidget(): UE.Widget {
        const Rive = UE.UMGManager.CreateWidget(this.outer, UE.RiveWidget.StaticClass()) as UE.RiveWidget;
        this.initRiveProps(Rive, this.props);
        return Rive;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const rive = widget as UE.RiveWidget;
        this.initRiveProps(rive, changedProps);
    }
}
