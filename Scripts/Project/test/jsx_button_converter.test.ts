import { expect } from 'chai';
import Module from 'module';
import { JSXConverter } from '../src/reactorUMG/jsx/jsx_converter';
import { ButtonConverter } from '../src/reactorUMG/jsx/button';
import * as UE from 'ue';

describe('JSXConverter', () => {
  it('creates proxy converters for jsx elements and appends children', () => {
    const originalLoad = (Module as any)._load;
    const proxyNative = {};
    class StubProxy {
      created = false;
      createNativeWidget() { this.created = true; return proxyNative; }
      update() {}
      appendChild() {}
      removeChild() {}
    }
    (Module as any)._load = function (request: string, parent: any, isMain: boolean) {
      if (request === './button') return { ButtonConverter: StubProxy };
      return originalLoad.call(this, request, parent, isMain);
    };

    const conv = new JSXConverter('button', { className: 'btn' }, null);
    const native = conv.createNativeWidget();
    expect(native).to.equal(proxyNative);

    const parent = new UE.PanelWidget();
    const child = {};
    conv.appendChild(parent as any, child as any, 'span', {});
    expect(parent.children).to.include(child);

    (Module as any)._load = originalLoad;
  });
});

describe('ButtonConverter', () => {
  it('applies styles, padding, focus/enabled state and event handlers', () => {
    const onClick = () => {};
    const buttonConv = new ButtonConverter('button', {
      backgroundColor: '#00ff00',
      textColor: '#ff0000',
      disabled: true,
      focusable: false,
      normalPadding: '2px',
      pressedPadding: '4px',
      clickMethod: 'down',
      touchMethod: 'down-up',
      pressMethod: 'press',
      onClick,
    }, null);

    const widget = buttonConv.createNativeWidget() as any;
    expect(widget.BackgroundColor?.G).to.equal(1);
    expect(widget.ColorAndOpacity?.R).to.equal(1);
    expect(widget.bIsEnabled).to.be.false;
    expect(widget.IsFocusable).to.be.false;
    expect(widget.WidgetStyle.NormalPadding?.Left).to.equal(2);
    expect(widget.WidgetStyle.PressedPadding?.Left).to.equal(4);
    expect(widget._clickMethod).to.equal(UE.EButtonClickMethod.MouseDown);
    expect(widget._touchMethod).to.equal(UE.EButtonTouchMethod.DownAndUp);
    expect(widget._pressMethod).to.equal(UE.EButtonPressMethod.ButtonPress);
    expect(widget.OnClicked.length).to.equal(1);

    buttonConv.update(widget as any, {}, { onClick: undefined });
    expect(widget.OnClicked.length).to.equal(0);
  });

  it('sets state brushes, sounds and dynamic handlers', () => {
    const hoverBrush = new UE.SlateBrush();
    const disabledBrush = new UE.SlateBrush();
    const sound = new UE.SlateSound();
    const buttonConv = new ButtonConverter('button', {
      hoveredBackground: hoverBrush,
      pressedBackground: { drawType: 'border', color: '#fff' },
      disabledBackground: disabledBrush,
      hoveredSound: sound,
      pressedSound: sound,
      onHovered: () => {},
    }, null);

    const widget = buttonConv.createNativeWidget() as any;
    expect(widget.WidgetStyle.Hovered).to.have.property('DrawAs');
    expect(widget.WidgetStyle.Pressed.DrawAs).to.equal(UE.ESlateBrushDrawType.Border);
    expect(widget.WidgetStyle.Disabled).to.have.property('DrawAs');
    expect(widget.OnHovered.length).to.equal(1);

    buttonConv.update(widget as any, {}, { onHovered: undefined });
    expect(widget.OnHovered.length).to.equal(0);
  });
});
