/**
 * UMG Button
 */
import * as UE from 'ue';
import { UMGConverter } from '../umg_converter';
import { parseBrush } from '../../parsers/brush_parser';
import { parseToLinearColor } from '../../parsers/css_color_parser';
import { convertToUEMargin } from '../../parsers/css_margin_parser';

export class ButtonConverter extends UMGConverter {
    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
    }
    
    private setupButtonProps(button: UE.Button, props: any) {
        const brushKeyMap: Record<string, string> = {
            'background': 'Normal',
            'hoveredBackground': 'Hovered',
            'pressedBackground': 'Pressed',
            'disabledBackground': 'Disabled'
        };
        
        const colorKeyMap: Record<string, string> = {
            'textColor': 'ColorAndOpacity',
            'backgroundColor': 'BackgroundColor'
        };

        const paddingKeyMap: Record<string, string> = {
            'normalPadding': 'NormalPadding',
            'pressedPadding': 'PressedPadding',
        };

        const soundKeyMap: Record<string, string> = {
            'pressedSound': 'PressedSlateSound',
            'hoveredSound': 'HoveredSlateSound',
        };
        
        const eventKeyMap: Record<string, string> = {
            'onClick': 'OnClicked',
            'onPressed': 'OnPressed',
            'onReleased': 'OnReleased',
            'onHovered': 'OnHovered',
            'onUnhovered': 'OnUnhovered',
        };
        
        for (const key in props) {
            const value = props[key];
            if (brushKeyMap[key]) {
                button.WidgetStyle[brushKeyMap[key]] = parseBrush(value);
            } else if (colorKeyMap[key]) {
                const rgba = parseToLinearColor(value);
                button[colorKeyMap[key]].R = rgba.r;
                button[colorKeyMap[key]].G = rgba.g;
                button[colorKeyMap[key]].B = rgba.b;
                button[colorKeyMap[key]].A = rgba.a;

            } else if (paddingKeyMap[key]) {
                button[paddingKeyMap[key]] = convertToUEMargin({}, value, '', '', '', '');
            } else if (soundKeyMap[key]) {
                // todo@Caleb196x: 添加sound
            } else if (eventKeyMap[key]) {
                button[eventKeyMap[key]].Add(value);
            } else if (key === 'focusable') {
                button.IsFocusable = value;
            }
        }
    }

    createNativeWidget(): UE.Widget {
        const button = new UE.Button(this.outer);
        this.setupButtonProps(button, this.props);
        return button;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        this.setupButtonProps(widget as UE.Button, changedProps);
    }
}
