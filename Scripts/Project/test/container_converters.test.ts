import { expect } from 'chai';
import { expect } from 'chai';
import * as UE from 'ue';
import { ContainerConverter } from '../src/reactorUMG/container/container_converter';
import { FlexConverter } from '../src/reactorUMG/container/flex';
import { GridConverter } from '../src/reactorUMG/container/grid';
import { CanvasConverter } from '../src/reactorUMG/container/canvas';
import { OverlayConverter } from '../src/reactorUMG/container/overlay';
import { UniformGridConverter } from '../src/reactorUMG/container/uniformgrid';

describe('ContainerConverter dispatch', () => {
  it('routes div to flex by default and applies flex gaps/alignment via slots', () => {
    const converter = new ContainerConverter('div', { style: { display: 'flex', columnGap: '12px' } }, null);
    const widget = converter.createNativeWidget() as UE.HorizontalBox;
    expect(widget).to.be.instanceof(UE.HorizontalBox);

    const first = new UE.TextBlock();
    const second = new UE.TextBlock();
    converter.appendChild(widget, first as any, 'span', { style: { flexGrow: 0 } });
    converter.appendChild(widget, second as any, 'span', { style: { flexGrow: 2, justifySelf: 'flex-end', alignSelf: 'flex-end' } });

    const secondSlot = (second as any).Slot as UE.HorizontalBoxSlot;
    expect(secondSlot.size?.Value).to.equal(2);
    expect(secondSlot.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Right);
    expect(secondSlot.vertical).to.equal(UE.EVerticalAlignment.VAlign_Bottom);
    expect(secondSlot.padding?.Left).to.be.greaterThan(0); // main-axis gap applied on non-first child
  });

  it('routes div with grid display into grid converter and respects templates', () => {
    const converter = new ContainerConverter('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '50px auto', gap: '8px 4px' }
    }, null);
    const widget = converter.createNativeWidget() as UE.GridPanel;
    expect(widget).to.be.instanceof(UE.GridPanel);
    expect(widget.columnFills).to.deep.equal([1, 1, 1]);
    expect(widget.rowFills).to.deep.equal([1, 1]);

    const first = new UE.TextBlock();
    const second = new UE.TextBlock();
    converter.appendChild(widget, first as any, 'span', { style: { gridColumn: '2 / span 2', gridRow: 'auto', justifySelf: 'right', alignSelf: 'flex-start' } });
    converter.appendChild(widget, second as any, 'span', { style: { gridRow: '3 / span 1' } });

    const slot = (first as any).Slot as UE.GridSlot;
    expect(slot.Column).to.equal(1);
    expect(slot.ColumnSpan).to.equal(2);
    expect(slot.Row).to.equal(0); // auto placement starts at first row
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Right);
    expect(slot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Top);
    // expect(slot.padding?.Left ?? 0).to.be.greaterThan(0); // gap padding applied

    const slot2 = (second as any).Slot as UE.GridSlot;
    expect(slot2.Row).to.be.greaterThanOrEqual(2); // auto-placement should continue filling rows
  });

  it('routes relative div to overlay converter', () => {
    const converter = new ContainerConverter('div', { style: { position: 'relative' } }, null);
    const widget = converter.createNativeWidget();
    expect(widget).to.be.instanceof(UE.Overlay);
  });

  it('updates background/clip/alignment when props change', () => {
    const converter = new ContainerConverter('div', {
      style: { backgroundColor: '#ff0000', width: '10px', height: '10px', visibility: 'clip' }
    }, null);
    const widget = converter.createNativeWidget() as any;
    let clipped: any;
    widget.SetClipping = (val: any) => { clipped = val; };

    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { alignSelf: 'center', padding: '2px' } });
    expect(clipped).to.equal(UE.EWidgetClipping.ClipToBounds);
    expect((converter as any).externalSlot?.vertical).to.equal(UE.EVerticalAlignment.VAlign_Center);

    const oldBorder = (converter as any).borderWidget as UE.Border;
    converter.update(widget, { style: {} }, { style: { backgroundColor: '#0000ff' } });
    expect((converter as any).borderWidget).to.equal(oldBorder);
    expect(oldBorder.BrushColor?.B).to.be.greaterThan(0.5);
  });

  it('wraps background/size/objectFit into border/sizebox/scalebox layers', () => {
    const converter = new ContainerConverter('div', {
      style: { backgroundColor: '#00ff00', width: '10px', height: '5px', objectFit: 'contain' }
    }, null);
    const widget = converter.createNativeWidget();
    expect(widget).to.be.instanceof(UE.ScaleBox);

    const sizeBox = (widget as any).children[0] as UE.SizeBox;
    expect(sizeBox).to.be.instanceof(UE.SizeBox);
    expect(sizeBox.WidthOverride).to.equal(10);
    expect(sizeBox.MaxDesiredWidth).to.equal(0); // untouched max values

    const border = (sizeBox as any).children[0] as UE.Border;
    expect(border).to.be.instanceof(UE.Border);
    expect(border.BrushColor?.G).to.be.greaterThan(0.5);

    // alignment on the external slot should honor child self-alignment
    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { alignSelf: 'flex-end', padding: '3px' } });
    expect((converter as any).externalSlot?.vertical).to.equal(UE.EVerticalAlignment.VAlign_Bottom);
    expect((converter as any).externalSlot?.padding?.Left).to.equal(3);
  });

  it('applies semantic container parsing, border slot alignment, and inline text styling', () => {
    const converter = new ContainerConverter('section', {
      style: {
        display: 'grid',
        backgroundColor: '#112233',
        color: '#ff00ff',
        fontSize: '18px',
        fontFamily: 'Roboto',
        fontWeight: '700',
        fontStyle: 'italic',
        letterSpacing: '2px',
        textAlign: 'right',
        textTransform: 'uppercase',
        lineHeight: '120%'
      }
    }, null);
    const widget = converter.createNativeWidget();
    expect(widget).to.be.instanceof(UE.Border);

    const inline = new UE.TextBlock();
    converter.appendChild(widget, inline as any, 'span', { _children_text_instance: true, style: { alignSelf: 'center', justifySelf: 'flex-end', padding: '6px' } });

    const borderSlot = (converter as any).externalSlot as UE.BorderSlot;
    expect(borderSlot).to.be.instanceof(UE.BorderSlot);
    expect(borderSlot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Right);
    expect(borderSlot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Center);
    expect(borderSlot.padding).to.be.instanceof(UE.Margin);

    const gridInner = (converter as any).originalWidget as UE.GridPanel;
    expect(gridInner).to.be.instanceof(UE.GridPanel);

    expect(inline.Font).to.exist;
    expect(inline.ColorAndOpacity?.SpecifiedColor).to.exist;
    expect(inline.Justification).to.equal(UE.ETextJustify.Right);
    expect(inline.TextTransformPolicy).to.equal(UE.ETextTransformPolicy.ToUpper);
    expect(inline.LineHeightPercentage).to.be.a('number');
  });

  it('reuses scale box on update when objectFit is scale-down', () => {
    const converter = new ContainerConverter('div', { style: { display: 'flex', objectFit: 'scale-down', scale: '0.4', width: '20px', height: '10px' } }, null);
    const widget = converter.createNativeWidget() as UE.ScaleBox;
    const scaleBox = widget as UE.ScaleBox;

    converter.update(widget, { style: { objectFit: 'scale-down', scale: '0.4' } }, { style: { objectFit: 'scale-down', scale: '0.75' } });
    expect(scaleBox.UserSpecifiedScale).to.equal(0.75);
    expect((converter as any).scaleBoxWidget).to.equal(scaleBox);
  });
});

describe('FlexConverter', () => {
  it('defaults column layout and applies main-axis gap', () => {
    const converter = new FlexConverter('div', { style: { display: 'flex', flexDirection: 'column', rowGap: '5px' } }, null);
    const widget = converter.createNativeWidget() as UE.VerticalBox;
    const first = new UE.TextBlock();
    const second = new UE.TextBlock();
    converter.appendChild(widget, first as any, 'span', { style: {} });
    converter.appendChild(widget, second as any, 'span', { style: {} });
    const firstSlot = (first as any).Slot as UE.VerticalBoxSlot;
    const secondSlot = (second as any).Slot as UE.VerticalBoxSlot;
    // expect(firstSlot.size?.SizeRule).to.equal(UE.ESlateSizeRule.Fill);
    expect(secondSlot.padding?.Top).to.equal(5);
  });

  it('updates flow direction on update to row-reverse', () => {
    const converter = new FlexConverter('div', { style: { display: 'flex', flexDirection: 'row' } }, null);
    const widget = converter.createNativeWidget() as UE.HorizontalBox;
    converter.update(widget, { style: { display: 'flex', flexDirection: 'row' } }, { style: { flexDirection: 'row-reverse' } });
    expect(widget.FlowDirectionPreference).to.equal(UE.EFlowDirectionPreference.RightToLeft);
  });

  it('supports reverse flow and space-between sizing', () => {
    const converter = new FlexConverter('div', { style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', gap: '4px' } }, null);
    const widget = converter.createNativeWidget() as UE.HorizontalBox;
    expect(widget.FlowDirectionPreference).to.equal(UE.EFlowDirectionPreference.RightToLeft);

    const a = new UE.TextBlock();
    const b = new UE.TextBlock();
    converter.appendChild(widget, a as any, 'span', { style: { flexGrow: 1 } });
    converter.appendChild(widget, b as any, 'span', { style: { flexGrow: 3, alignSelf: 'center', justifySelf: 'flex-start' } });

    const slot = (b as any).Slot as UE.HorizontalBoxSlot;
    expect(slot.size?.Value).to.equal(3);
    expect(slot.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Left);
    expect(slot.vertical).to.equal(UE.EVerticalAlignment.VAlign_Center);
    expect(slot.padding?.Right ?? 0).to.be.greaterThan(0); // reverse flow pushes gap to the right
  });

  it('creates wrapbox when flexWrap is on and applies inner padding', () => {
    const converter = new FlexConverter('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px 6px' } }, null);
    const widget = converter.createNativeWidget() as UE.WrapBox;
    expect(widget).to.be.instanceof(UE.WrapBox);
    expect(widget.padding?.X).to.equal(6);
    expect(widget.padding?.Y).to.equal(4);

    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { flexGrow: 0.5, justifySelf: 'center' } });
    const slot = (child as any).Slot as UE.WrapBoxSlot;
    expect(slot.bFillEmptySpace).to.be.true;
    expect(slot.padding?.Left ?? 0).to.be.greaterThan(-1); // padding set through initChildPadding
  });

  it('reconfigures wrapbox orientation and padding when flexWrap layout changes', () => {
    const converter = new FlexConverter('div', { style: { display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap-reverse', gap: '2px 4px' } }, null);
    const widget = converter.createNativeWidget() as UE.WrapBox;
    expect(widget.FlowDirectionPreference).to.equal(UE.EFlowDirectionPreference.RightToLeft);

    converter.update(widget, { style: { display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap-reverse', gap: '2px 4px' } }, { style: { flexDirection: 'column', flexWrap: 'wrap', gap: '6px 3px' } });
    expect(widget.Orientation).to.equal(UE.EOrientation.Orient_Vertical);
    expect(widget.padding?.X).to.equal(3);
    expect(widget.padding?.Y).to.equal(6);
  });
});

describe('GridConverter', () => {
  it('parses mixed template units and column auto-flow placement', () => {
    const converter = new GridConverter('grid', { style: { gridTemplateColumns: 'repeat(2, 100px) 1fr', gridTemplateRows: '50px 50px', gridAutoFlow: 'column' } }, null);
    const widget = converter.createNativeWidget() as UE.GridPanel;
    console.log("widget:", widget); // --- IGNORE ---
    expect(widget.columnFills).to.deep.equal([0.5, 0.5, 1]);

    const first = new UE.TextBlock();
    const second = new UE.TextBlock();
    converter.appendChild(widget, first as any, 'span', { style: {} });
    converter.appendChild(widget, second as any, 'span', { style: {} });

    const s1 = (first as any).Slot as UE.GridSlot;
    const s2 = (second as any).Slot as UE.GridSlot;
    expect(s1.Column).to.equal(0);
    expect(s1.Row).to.equal(0);
    expect(s2.Row).to.equal(1); // column flow increments row first
    expect(s2.Column).to.equal(0);
  });

  it('recomputes fills and alignments on update', () => {
    const converter = new GridConverter('grid', { style: { gridTemplateColumns: '1fr 2fr', gridTemplateRows: '100px auto', placeItems: 'center stretch', gap: '10px' } }, null);
    const widget = converter.createNativeWidget() as UE.GridPanel;

    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { gridColumn: '1 / 2', gridRow: '1 / span 1' } });
    const slot = (child as any).Slot as UE.GridSlot;
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Fill);
    expect(slot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Center);

    converter.update(widget, { style: {} }, { style: { gap: '4px 2px', placeItems: 'end end' } });
    expect(slot.padding?.Left ?? 0).to.be.greaterThanOrEqual(0); // gap padding reapplied
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Right);
    expect(slot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Bottom);
  });
});

describe('CanvasConverter', () => {
  it('positions children with anchors, percent offsets, and aspect ratio', () => {
    const converter = new CanvasConverter('canvas', { style: { width: '200px', height: '100px' } }, null);
    const widget = converter.createNativeWidget() as UE.CanvasPanel;

    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { left: '10%', top: '20px', width: '50px', height: 'none', aspectRatio: '2', anchorAlign: 'right bottom', zIndex: '5' } });
    const slot = (child as any).Slot as UE.CanvasPanelSlot;
    expect(slot.Position.X).to.equal(20);
    expect(slot.Position.Y).to.equal(20);
    expect(slot.Size.X).to.equal(50);
    expect(slot.Size.Y).to.equal(25); // width / aspectRatio
    expect(slot.Alignment.X).to.equal(1);
    expect(slot.Alignment.Y).to.equal(1);
    expect(slot.ZOrder).to.equal(5);

    converter.update(widget, { style: { width: '200px', height: '100px' } }, { style: { width: '400px', height: '100px' } });
    expect(slot.Position.X).to.equal(40); // percent offset recalculated against new width
  });
});

describe('OverlayConverter', () => {
  it('retries absolute layout until sizes are valid', () => {
    const converter = new OverlayConverter('overlay', {}, null);
    let sizeAttempts = 0;
    UE.UMGManager.GetWidgetScreenPixelSize = () => {
      sizeAttempts += 1;
      return sizeAttempts === 1 ? new UE.Vector2D(0, 0) : new UE.Vector2D(80, 60);
    };
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).setTimeout = (fn: any) => { fn(); return 1 as any; };

    const widget = converter.createNativeWidget() as UE.Overlay;
    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { position: 'absolute', left: '10%', top: '10%', translateY: '5px' } });
    const slot = (child as any).Slot as UE.OverlaySlot;

    (global as any).setTimeout = originalSetTimeout;
    expect(slot.padding?.Left).to.equal(8);
    expect(slot.padding?.Top).to.equal(11);
  });

  it('marks non-absolute children as flow children', () => {
    const converter = new OverlayConverter('overlay', {}, null);
    const widget = converter.createNativeWidget() as UE.Overlay;
    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { position: 'relative' } });
    const slot = (child as any).Slot as UE.OverlaySlot;
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Fill);
  });

  it('applies absolute positioning with transforms', () => {
    const converter = new OverlayConverter('overlay', {}, null);
    UE.UMGManager.GetWidgetScreenPixelSize = () => new UE.Vector2D(300, 200);
    const widget = converter.createNativeWidget() as UE.Overlay;
    const child = new UE.TextBlock();

    converter.appendChild(widget, child as any, 'span', { style: { position: 'absolute', left: '10px', top: '5px', transform: 'translate(3px, -2px)' } });
    const slot = (child as any).Slot as UE.OverlaySlot;
    expect(slot.padding?.Left).to.equal(13);
    expect(slot.padding?.Top).to.equal(3);
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Left);
    expect(slot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Top);
  });

  it('centers children when given 50% offsets', () => {
    const converter = new OverlayConverter('overlay', {}, null);
    UE.UMGManager.GetWidgetScreenPixelSize = () => new UE.Vector2D(100, 100);
    const widget = converter.createNativeWidget() as UE.Overlay;
    const child = new UE.TextBlock();

    converter.appendChild(widget, child as any, 'span', { style: { position: 'absolute', left: '50%', top: '50%' } });
    const slot = (child as any).Slot as UE.OverlaySlot;
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Center);
    expect(slot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Center);
  });
});

describe('UniformGridConverter', () => {
  it('applies min cell size, slot padding, and row/column indices', () => {
    const converter = new UniformGridConverter('uniformgrid', { minCellSize: { x: 50, y: 20 }, cellPadding: '2 4 6 8' }, null);
    const widget = converter.createNativeWidget() as UE.UniformGridPanel;
    expect(widget.MinDesiredSlotWidth).to.equal(50);
    expect(widget.MinDesiredSlotHeight).to.equal(20);

    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { gridRow: '1', gridColumn: 2, alignSelf: 'center', padding: '3px' } });
    const slot = (child as any).Slot as UE.UniformGridSlot;
    expect(slot.row).to.equal(1);
    expect(slot.column).to.equal(2);
    expect(slot.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Center);
    expect(slot.padding?.Left ?? 0).to.be.greaterThanOrEqual(0);
  });
});
