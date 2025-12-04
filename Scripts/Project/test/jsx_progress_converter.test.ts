import { expect } from 'chai';
import { ProgressConverter } from '../src/reactorUMG/jsx/progress';
import * as UE from 'ue';
import { RGBToLinearColor } from '../src/reactorUMG/parsers/css_color_parser';

describe('ProgressConverter', () => {
  it('renders a determinate progress bar inside a transparent button and clamps percent', () => {
    const converter = new ProgressConverter('progress', {
      value: 50,
      min: 0,
      max: 200,
      style:{
        fill: '#ff0000',
        backgroundColor: '#000000',
      },
      focusable: true,
    }, null);

    const widget = converter.createNativeWidget() as UE.Button;
    expect(widget).to.be.instanceof(UE.Button);
    expect(widget.WidgetStyle.Normal.DrawAs).to.equal(UE.ESlateBrushDrawType.NoDrawType);
    expect(widget.IsFocusable).to.be.true;

    const bar = widget.children[0] as UE.ProgressBar;
    expect(bar).to.be.instanceof(UE.ProgressBar);
    expect(bar.marquee).to.be.false;
    expect(bar.percent).to.be.closeTo(0.25, 0.0001);
    expect(bar.FillColorAndOpacity.R).to.equal(RGBToLinearColor[255]);
  });

  it('enables marquee mode when value is missing and forwards click/hover events', () => {
    const received: any[] = [];
    const converter = new ProgressConverter('progress', {
      value: undefined,
      onClick: (evt: any) => received.push(evt.type),
      onDoubleClick: (evt: any) => received.push(evt.type),
      onMouseEnter: (evt: any) => received.push(evt.type),
      onMouseLeave: (evt: any) => received.push(evt.type),
      onFocus: (evt: any) => received.push(evt.type),
      onBlur: (evt: any) => received.push(evt.type),
    }, null);

    const widget = converter.createNativeWidget() as UE.Button;
    const bar = widget.children[0] as UE.ProgressBar;
    expect(bar.marquee).to.be.true;

    const now = Date.now;
    let tick = 1000;
    Date.now = () => tick;
    widget.OnClicked[0]();
    tick += 200;
    widget.OnClicked[0]();
    widget.OnHovered[0]();
    widget.OnUnhovered[0]();
    Date.now = now;

    expect(received).to.include.members(['click', 'doubleClick', 'mouseEnter', 'mouseLeave', 'focus:click']);
  });

  it('updates interactivity when disabled and recomputes percent on prop updates', () => {
    const converter = new ProgressConverter('progress', { value: 20, max: 40 }, null);
    const widget = converter.createNativeWidget() as UE.Button;
    const bar = widget.children[0] as UE.ProgressBar;
    expect(bar.percent).to.equal(0.5);

    converter.update(widget as any, { value: 20, max: 40 }, { value: 100, max: 80, disabled: true });
    expect(widget.bIsEnabled).to.be.false;
    expect(bar.percent).to.equal(1); // clamped to max
  });

  it('polls keyboard when focused and emits keydown events', () => {
    const keys: string[] = [];
    const converter = new ProgressConverter('progress', { onKeyDown: (evt: any) => keys.push(evt.key) }, null);
    const widget = converter.createNativeWidget() as UE.Button;

    const originalSetInterval = global.setInterval;
    const originalClearInterval = global.clearInterval;
    let intervalFn: Function | undefined;
    (global as any).setInterval = (fn: any) => { intervalFn = fn; return 123; };
    (global as any).clearInterval = () => {};

    UE.UMGManager.GetCurrentWorld = () => ({});
    UE.GameplayStatics.GetPlayerController = () => ({
      WasInputKeyJustPressed: (key: any) => key.name === 'Left'
    });

    (converter as any).handleFocus('test');
    intervalFn && intervalFn();
    (converter as any).handleBlur('test');

    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    expect(keys).to.include('ArrowLeft');
  });
});
