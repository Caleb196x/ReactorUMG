import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseBrush } from '../../parsers/brush_parser';
import { parseToLinearColor } from '../../parsers/css_color_parser';

export class ProgressBarConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private initProps(progressBar: UE.ProgressBar, props: any): boolean {
        if (!progressBar) {
            return;
        }

        let propsInit = false;

        const backgroundImageMap: Record<string, string> = {
            'background': 'BackgroundImage',
            'fillBackground': 'FillImage',
            'marqueeBackground': 'MarqueeImage',
        }
        
        for (const [key, value] of Object.entries(props)) {
            if (backgroundImageMap[key]) {
                progressBar.WidgetStyle[backgroundImageMap[key]] = parseBrush(value);
                propsInit = true;
            } else if (key === 'enableFillAnimation') {
                progressBar.WidgetStyle.EnableFillAnimation = value as boolean;
                propsInit = true;
            } else if (key === 'fillColor') {
                const color = parseToLinearColor(value as string);
                progressBar.FillColorAndOpacity.R = color.r;
                progressBar.FillColorAndOpacity.G = color.g;
                progressBar.FillColorAndOpacity.B = color.b;
                progressBar.FillColorAndOpacity.A = color.a;
                propsInit = true;
            } else if (key === 'barType') {
                switch (value) {
                    case 'left-to-right':
                        progressBar.BarFillType = UE.EProgressBarFillType.LeftToRight;
                        break;
                    case 'right-to-left':
                        progressBar.BarFillType = UE.EProgressBarFillType.RightToLeft;
                        break;
                    case 'top-to-bottom':
                        progressBar.BarFillType = UE.EProgressBarFillType.TopToBottom;
                        break;
                    case 'bottom-to-top':
                        progressBar.BarFillType = UE.EProgressBarFillType.BottomToTop;
                        break;
                    case 'fill-from-center':
                        progressBar.BarFillType = UE.EProgressBarFillType.FillFromCenter;
                        break;
                    case 'fill-from-center-x':
                        progressBar.BarFillType = UE.EProgressBarFillType.FillFromCenterHorizontal;
                        break;
                    case 'fill-from-center-y':
                        progressBar.BarFillType = UE.EProgressBarFillType.FillFromCenterVertical;
                        break;
                    default:
                        progressBar.BarFillType = UE.EProgressBarFillType.LeftToRight;
                        break;
                } 
                propsInit = true;
            } else if (key === 'precentBinding' && typeof value === 'function') {
                progressBar.PercentDelegate.Bind(value as () => number);
                propsInit = true;
            } else if (key === 'fillColorBinding' && typeof value === 'function') {
                progressBar.FillColorAndOpacityDelegate.Bind(() => {
                    const color = parseToLinearColor(value());
                    const linearColor = new UE.LinearColor();
                    linearColor.R = color.r;
                    linearColor.G = color.g;
                    linearColor.B = color.b;
                    linearColor.A = color.a;
                    return linearColor;
                });
                propsInit = true;
            } else if (key === 'precent') {
                progressBar.SetPercent(value as number);
            } else if (key === 'isMarquee') {
                progressBar.SetIsMarquee(value as boolean);
            }
        }

        return propsInit;
    }

    createNativeWidget(): UE.Widget {
        const progressBar = new UE.ProgressBar(this.outer);
        const propsInit = this.initProps(progressBar, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(progressBar);
        }
        return progressBar;
    }
    
    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const progressBar = widget as UE.ProgressBar;
        const propsChanged = this.initProps(progressBar, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(progressBar);
        }
    }
}
