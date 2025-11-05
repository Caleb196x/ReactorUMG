import * as UE from 'ue';
import { ElementConverter } from '../converter';
import { getAllStyles } from '../parsers/cssstyle_parser';
import { parseWidgetSelfAlignment } from '../parsers/alignment_parser';

export class UMGConverter extends ElementConverter {
    private readonly predefinedWidgets: string[];
    private proxy: UMGConverter;
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);

        this.predefinedWidgets = [
            'Button',
            'Border',
            'CheckBox',
            'CircularThrobber',
            'Throbber',
            'ComboBox',
            'ProgressBar',
            'RidialSlider',
            'Slider',
            'Rive',
            'Spine',
            'SafeZone',
            'ScaleBox',
            'SizeBox',
            'Spacer',
            'SpinBox',
            'RetainerBox',
            'InvalidationBox',

            // todo@Caleb196x: 待实现的组件
            'ScrollBox',
            'ExpandableArea',
            'CanvasPanel',
            'TextBlock',
            'RichTextBlock',
            'ListView',
            'TreeView',
            'TileView',
            'WrapBox'
        ]

        this.proxy = null;
    }

    private createProxy(typeName: string): UMGConverter {
        // create proxy for predefined widgets
        let proxy: UMGConverter;
        if (this.predefinedWidgets.includes(typeName)) {
            const Module = require(`./predefined/${typeName}`);
            if (Module) {
                const ClassName = `${typeName}Converter`;
                proxy = new Module[ClassName](this.typeName, this.props, this.outer);
            }
        } else {
            const NativeWidgetModule = require('./native_widget_converter');
            if (NativeWidgetModule) {
                proxy = new NativeWidgetModule["NativeWidgetConverter"](this.typeName, this.props, this.outer);
            }
        }

        return proxy;
    }

    initPanelChildSlot(slot: any, childTypeName: string, childProps: any): void {
        if (slot) {
            const childStyle = getAllStyles(childTypeName, childProps);
            const alignment = parseWidgetSelfAlignment(childStyle);
            slot.SetHorizontalAlignment(alignment.horizontal);
            slot.SetVerticalAlignment(alignment.vertical);
            slot.SetPadding(alignment.padding);
        }
    }

    /**
     * 根据自动生成的component类型，创建出对应的converter
     * 转换规则：
     * UWidget到React控件定义的转换规则：
     * 1. 根据Widget名称直接创建对应的Widget就可以；
     * 2. 基本类型转换；
     * 3. LineColor，SlateColor转换成Css Color；
     * 4. Margin转换成Css Padding；
     * 5. SlateBrush转换成ImageStyle;
     * 5-1. SlateFontInfo转换成自定义的FontInfo;
     * 6. 枚举值转换成对应的string取值串；
     * 7. WidgetStyle进行解包，将所有类型为对象类型的子元素递归的进行一次上述转换，并且自身也要设为Partial；
     * 8. 命名转换：DataDelegate转换成DataBinding;
     * 9. 命名转换：首字母大写转换成小写；
     * 
     * 
     * React控件定义到UWidget的转换规则：
     */
    createNativeWidget(): UE.Widget {
        if (!this.proxy) {
            this.proxy = this.createProxy(this.typeName);
        }

        if (this.proxy) {
            return this.proxy.createNativeWidget();
        }

        return null;
    }
    
    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        if (this.proxy) {
            this.proxy.update(widget, oldProps, changedProps);
        }
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        if (parent instanceof UE.PanelWidget) {
            const slot = parent.AddChild(child);
            this.initPanelChildSlot(slot, childTypeName, childProps);
        }
    }
    
    removeChild(parent: UE.Widget, child: UE.Widget): void {
        if (parent instanceof UE.PanelWidget) {
            parent.RemoveChild(child);
        }
    }
    
}
