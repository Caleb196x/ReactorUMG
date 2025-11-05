import { parseToLinearColor } from '../../parsers/css_color_parser';
import { UMGConverter } from '../umg_converter';
import * as UE from 'ue';

export class SpineConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private initSpineProps(spine: UE.SpineWidget, props: any): boolean {
        let propsInit = false;
        const initSkin = props?.initSkin as string;
        if (initSkin && initSkin !== '') {
            spine.SetSkin(initSkin);
        }

        const color = props?.color;
        if (color) {
            const rgba = parseToLinearColor(color);
            spine.Color.R = rgba.r;
            spine.Color.G = rgba.g;
            spine.Color.B = rgba.b;
            spine.Color.A = rgba.a;
            propsInit = true;
        }

        let atlasLoaded = false;
        const atlas = props?.atlas;
        if (atlas) {
            spine.Atlas = UE.UMGManager.LoadSpineAtlas(spine, atlas, __dirname);
            atlasLoaded = true;
            propsInit = true;
        }

        const skel = props?.skel;
        if (skel) {
            spine.SkeletonData = UE.UMGManager.LoadSpineSkeleton(spine, skel, __dirname);
            if (!atlasLoaded) {
                const atlasPath = skel.replace('.json', '.atlas').replace('.skel', '.atlas');
                spine.Atlas = UE.UMGManager.LoadSpineAtlas(spine, atlasPath, __dirname);
                atlasLoaded = true;
                propsInit = true;
            }
        }

        const initAnimation = props?.initAnimation;
        if (initAnimation && initAnimation !== '') {
            spine.SetAnimation(0, initAnimation, true);
        }

        const eventKeyMap: Record<string, string> = {
            'onAnimationStart': 'AnimationStart',
            'onAnimationEnd': 'AnimationEnd',
            'onAnimationComplete': 'AnimationComplete',
            'onAnimationEvent': 'AnimationEvent',
            'onAnimationInterrupt': 'AnimationInterrupt',
            'onAnimationDispose': 'AnimationDispose',
            'onBeforeUpdateWorldTransform': 'BeforeUpdateWorldTransform',
            'onAfterUpdateWorldTransform': 'AfterUpdateWorldTransform',
        }

        for (const [key, value] of Object.entries(props)) {
            if (eventKeyMap[key] && typeof value === 'function') {
                spine[eventKeyMap[key]].Add(value);
                propsInit = true;
            }
        }

        return propsInit;
    }
    
    createNativeWidget(): UE.Widget {
        const spine = new UE.SpineWidget(this.outer);
        const propsInit = this.initSpineProps(spine, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(spine);
        }
        return spine;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const spine = widget as UE.SpineWidget;
        const propsInit = this.initSpineProps(spine, changedProps);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(spine);
        }
    }
    
}

