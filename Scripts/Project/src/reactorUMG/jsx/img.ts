import * as UE from 'ue';
import { JSXConverter } from './jsx_converter';
import { ImageLoader } from '../misc/image_loader';
import { parseToLinearColor } from '../parsers/css_color_parser';
import { getAllStyles } from '../parsers/cssstyle_parser';

/**
 * 支持的图片源src类型：
 * 1. 本地图片路径； 2. 网络图片路径； 3. UE纹理资源路径；4. 材质资源；
 * 图片资源的加载方式均采用异步加载的方式进行。
 */
export class ImageConverter extends JSXConverter {
    private source: string;
    private width: number | string;
    private height: number | string;
    private color: string;
    private onClick: ()=>void;
    private image: UE.Image | undefined;
    private scaleBox: UE.ScaleBox | undefined;
    private currentReloadTime: number;
    private reloadMaxTimesWhenError: number;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.source = props?.src;
        this.width = props?.width;
        this.height = props?.height;
        this.color = props?.color;
        this.image = undefined;
        this.scaleBox = undefined;
        this.onClick = props?.onClick;
        this.currentReloadTime = 0;
        this.reloadMaxTimesWhenError = 5;
    }

    private onLoad(object: UE.Object) {
        if (this.image && object) {
            this.image.SetBrushResourceObject(object);
            if (this.props?.onLoad && 
                typeof this.props.onLoad === 'function') 
            {
                this.props.onLoad();
            }
        }
    }

    private onError = () => {
        if (this.props?.onError && typeof this.props.onError === 'function') {
            // Provide a minimal event-like object with target.src setter to allow fallback
            const self = this;
            const evt: any = {
                target: {
                    get src() { return self.source; },
                    set src(v: string) {
                        self.source = v;
                        if (self.image && this.currentReloadTime < this.reloadMaxTimesWhenError) {
                            this.currentReloadTime++;
                            ImageLoader.loadBrushImageObject(self.image, v, __dirname, false, self.onLoad.bind(self), self.onError);
                        }
                    }
                }
            };
            try {
                this.props.onError(evt);
            } catch (e) {
                // swallow to avoid breaking render chains
                console.warn('img onError handler threw:', e);
            }
        }
    }

    createNativeWidget() {
        this.image = new UE.Image(this.outer);

        if (this.source) {
            ImageLoader.loadBrushImageObject(
                this.image, this.source, __dirname, false, this.onLoad.bind(this), this.onError
            );
        }

        let setupProps = false;
        const parseSize = (v: any): number | null => {
            if (v === undefined || v === null) return null;
            if (typeof v === 'number') return v;
            const n = parseFloat(v);
            return isNaN(n) ? null : n;
        };

        const w = parseSize(this.width);
        const h = parseSize(this.height);
        if (w !== null || h !== null) {
            const actualWidth = w !== null ? w : (h !== null ? h : 0);
            const actualHeight = h !== null ? h : (w !== null ? w : 0);
            this.image.Brush.ImageSize.X = actualWidth;
            this.image.Brush.ImageSize.Y = actualHeight;
            // Hint the layout size as well
            this.image.SetDesiredSizeOverride(new UE.Vector2D(actualWidth, actualHeight));
            setupProps = true;
        }

        if (this.color) {
            const rgba = parseToLinearColor(this.color);
            this.image.ColorAndOpacity.R = rgba.r;
            this.image.ColorAndOpacity.G = rgba.g;
            this.image.ColorAndOpacity.B = rgba.b;
            this.image.ColorAndOpacity.A = rgba.a;
            setupProps = true;
        }
        
        if (this.onClick) {
            this.image.OnMouseButtonDownEvent.Bind((MyGeometry, MouseEvent) => {
                this.onClick();
                return new UE.EventReply();
            });

            setupProps = true;
        }

        // object-fit support via ScaleBox wrapper
        const styles = getAllStyles(this.typeName, this.props);
        const objectFit = styles?.objectFit;
        if (objectFit) {
            this.scaleBox = new UE.ScaleBox(this.outer);
            switch (objectFit) {
                case 'contain':
                    this.scaleBox.SetStretch(UE.EStretch.ScaleToFit);
                    break;
                case 'cover':
                    this.scaleBox.SetStretch(UE.EStretch.ScaleToFill);
                    break;
                case 'fill':
                    this.scaleBox.SetStretch(UE.EStretch.Fill);
                    break;
                case 'none':
                    this.scaleBox.SetStretch(UE.EStretch.None);
                    break;
                case 'scale-down':
                    this.scaleBox.SetStretch(UE.EStretch.UserSpecifiedWithClipping);
                    break;
                default:
                    this.scaleBox.SetStretch(UE.EStretch.ScaleToFit);
            }
            this.scaleBox.AddChild(this.image);
        }

        if (setupProps) {
            UE.UMGManager.SynchronizeWidgetProperties(this.image);
        }

        return this.scaleBox ? (this.scaleBox as unknown as UE.Widget) : this.image;
    }
    
    update(widget: UE.Widget, oldProps: any, changedProps: any) {
        if (!this.image) return;

        if (changedProps.src && changedProps.src !== this.source) {
            const changedSrc = changedProps.src;
            this.source = changedSrc;
            ImageLoader.loadBrushImageObject(
                this.image, changedSrc, __dirname, false, this.onLoad.bind(this), this.onError
            );
        }

        if (changedProps.width || changedProps.height) {
            const w = changedProps.width !== undefined ? changedProps.width : this.width;
            const h = changedProps.height !== undefined ? changedProps.height : this.height;
            const parseSize = (v: any): number | null => {
                if (v === undefined || v === null) return null;
                if (typeof v === 'number') return v;
                const n = parseFloat(v);
                return isNaN(n) ? null : n;
            };
            const wv = parseSize(w);
            const hv = parseSize(h);
            if (wv !== null || hv !== null) {
                const actualWidth = wv !== null ? wv : (hv !== null ? hv : 0);
                const actualHeight = hv !== null ? hv : (wv !== null ? wv : 0);
                this.image.Brush.ImageSize.X = actualWidth;
                this.image.Brush.ImageSize.Y = actualHeight;
                this.image.SetDesiredSizeOverride(new UE.Vector2D(actualWidth, actualHeight));
                UE.UMGManager.SynchronizeWidgetProperties(this.image);
            }
        }

        if (changedProps.color) {
            const rgba = parseToLinearColor(changedProps.color);
            this.image.ColorAndOpacity.R = rgba.r;
            this.image.ColorAndOpacity.G = rgba.g;
            this.image.ColorAndOpacity.B = rgba.b;
            this.image.ColorAndOpacity.A = rgba.a;
            UE.UMGManager.SynchronizeWidgetProperties(this.image);
        }

        // Update object-fit if style changed
        const styles = getAllStyles(this.typeName, { ...this.props, ...changedProps });
        const objectFit = styles?.objectFit;
        if (this.scaleBox && objectFit) {
            switch (objectFit) {
                case 'contain': this.scaleBox.SetStretch(UE.EStretch.ScaleToFit); break;
                case 'cover': this.scaleBox.SetStretch(UE.EStretch.ScaleToFill); break;
                case 'fill': this.scaleBox.SetStretch(UE.EStretch.Fill); break;
                case 'none': this.scaleBox.SetStretch(UE.EStretch.None); break;
                case 'scale-down': this.scaleBox.SetStretch(UE.EStretch.UserSpecifiedWithClipping); break;
            }
            UE.UMGManager.SynchronizeWidgetProperties(this.scaleBox);
        }
    }
}
