import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { convertMargin, convertToUEMargin } from '../../parsers/css_margin_parser';
import { parseBrush } from '../../parsers/brush_parser';
import { parseToLinearColor } from '../../parsers/css_color_parser';

export class ComboBoxConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }

    private setupOptions(comboBox: UE.ComboBoxString, props: any) {
        const options = props?.options;
        if (options) {
            comboBox.ClearOptions();
            options.forEach((option: string) => {
                comboBox.DefaultOptions.Add(option);
                comboBox.AddOption(option);
            });
        }

        const selectedOption = props?.selectedOption;
        if (selectedOption) {
            comboBox.SetSelectedOption(selectedOption);
        }
    }

    private setupComboBoxStyle(comboBox: UE.ComboBoxString, props: any): boolean {
        const comboBoxStyle = props?.comboBoxStyle;
        if (!comboBoxStyle) {
            return false;
        }

        let styleInit = false;

        const styleMap: Record<string, string> = {
            'backgroundImage': 'Normal',
            'hoveredBackgroundImage': 'Hovered',
            'pressedBackgroundImage': 'Pressed',
            'disabledBackgroundImage': 'Disabled',
            'downArrowBackground': 'DownArrow',
        }

        const soundMap: Record<string, string> = {
            'pressedSound': 'PressedSlateSound',
            'selectionChangeSound': 'SelectionChangeSlateSound',
        }

        const paddingMap: Record<string, string> = {
            'rowPadding': 'MenuRowPadding',
            'downArrowPadding': 'DownArrowPadding',
        }

        for (const [key, value] of Object.entries(comboBoxStyle)) {
            if (styleMap[key]) {
                comboBox.WidgetStyle.ComboButtonStyle.ButtonStyle[styleMap[key]] = parseBrush(value);
                styleInit = true;
            } else if (soundMap[key]) {
                // todo@Caleb196x: 需要解析sound
                comboBox.WidgetStyle[soundMap[key]] = {};
                styleInit = true;
            } else if (paddingMap[key]) {
                const paddingVal = value as string;
                comboBox.WidgetStyle[paddingMap[key]] = convertToUEMargin(comboBoxStyle, paddingVal, '', '', '', '');
                styleInit = true;
            } else if (key === 'downArrowBackground') {
                comboBox.WidgetStyle.ComboButtonStyle.DownArrowImage = parseBrush(value);
                styleInit = true;
            } else if (key === 'downArrowPadding') {
                const paddingVal = value as string;
                comboBox.WidgetStyle.ComboButtonStyle.DownArrowPadding = convertToUEMargin(comboBoxStyle, paddingVal, '', '', '', '');
                styleInit = true;
            } else if (key === 'downArrowAlign') {
                switch (value) {
                    case 'left':
                    case 'top':
                        comboBox.WidgetStyle.ComboButtonStyle.DownArrowAlign = UE.EVerticalAlignment.VAlign_Top;
                        break;
                    case 'right':
                    case 'bottom':
                        comboBox.WidgetStyle.ComboButtonStyle.DownArrowAlign = UE.EVerticalAlignment.VAlign_Bottom;
                        break;
                    case 'center':
                        comboBox.WidgetStyle.ComboButtonStyle.DownArrowAlign = UE.EVerticalAlignment.VAlign_Center;
                        break;
                    default:
                        comboBox.WidgetStyle.ComboButtonStyle.DownArrowAlign = UE.EVerticalAlignment.VAlign_Top;
                        break;
                }
                styleInit = true;
            }
        }

        return styleInit;
    }

    private setupComboBoxScrollBarStyle(comboBox: UE.ComboBoxString, props: any): boolean {
        const comboBoxScrollBarStyle = props?.scrollBarStyle;
        if (!comboBoxScrollBarStyle) {
            return false;
        }

        let barStyleInit = false;

        const styleMap: Record<string, string> = {
            'horizontalBackground': 'HorizontalBackgroundImage',
            'verticalBackground': 'VerticalBackgroundImage',
            'normalThumb': 'NormalThumbImage',
            'hoveredThumb': 'HoveredThumbImage',
            'draggedThumb': 'DraggedThumbImage',
        }
        
        for (const [key, value] of Object.entries(comboBoxScrollBarStyle)) {
            if (styleMap[key]) {
                comboBox.ScrollBarStyle[styleMap[key]] = parseBrush(value);
                barStyleInit = true;
            } else if (key === 'thickness') {
                comboBox.ScrollBarStyle.Thickness = value as number;
                barStyleInit = true;
            }
        }

        return barStyleInit;
    }

    private setupComboBoxItemStyle(comboBox: UE.ComboBoxString, props: any): boolean {
        const comboBoxItemStyle = props?.itemStyle;
        if (!comboBoxItemStyle) {
            return false;
        }

        let itemStyleInit = false;

        const styleMap: Record<string, string> = {
            'activeBackground': 'ActiveBrush',
            'activeHoveredBackground': 'ActiveHoveredBrush',
            'focusedBackground': 'SelectorFocusedBrush',
            'inactiveBackground': 'InactiveBrush',
            'inactiveHoveredBackground': 'InactiveHoveredBrush',
            'menuRowBackground': 'MenuRowBrush',
            'evenMenuRowBackground': 'EvenMenuRowBrush',
            'oddMenuRowBackground': 'OddMenuRowBrush',
        }

        const colorMap: Record<string, string> = {
            'textColor': 'TextColor',
            'selectedTextColor': 'SelectedTextColor',
        }

        for (const [key, value] of Object.entries(comboBoxItemStyle)) {
            if (styleMap[key]) {
                // fixme@Caleb196x: 需要处理styleMap[key]不存在的情况
                comboBox.ItemStyle[styleMap[key]] = parseBrush(value);
                itemStyleInit = true;
            } else if (colorMap[key]) {
                const rgba = parseToLinearColor(value as string);
                comboBox.ItemStyle[colorMap[key]].SpecifiedColor.R = rgba.r;
                comboBox.ItemStyle[colorMap[key]].SpecifiedColor.G = rgba.g;
                comboBox.ItemStyle[colorMap[key]].SpecifiedColor.B = rgba.b;
                comboBox.ItemStyle[colorMap[key]].SpecifiedColor.A = rgba.a;
                itemStyleInit = true;
            }
        }

        return itemStyleInit;
    }

    private setupProps(comboBox: UE.ComboBoxString, props: any): boolean {
        this.setupOptions(comboBox, props);

        return this.setupComboBoxStyle(comboBox, props) ||
            this.setupComboBoxScrollBarStyle(comboBox, props) ||
            this.setupComboBoxItemStyle(comboBox, props);
    }

    createNativeWidget(): UE.Widget {
        const comboBox = new UE.ComboBoxString(this.outer);
        const propsInit = this.setupProps(comboBox, this.props);
        if (propsInit) {
            UE.UMGManager.SynchronizeWidgetProperties(comboBox);
        }
        return comboBox;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        const comboBox = widget as UE.ComboBoxString;
        const propsChanged = this.setupProps(comboBox, changedProps);
        if (propsChanged) {
            UE.UMGManager.SynchronizeWidgetProperties(comboBox);
        }
    }
}
