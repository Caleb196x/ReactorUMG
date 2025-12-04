import { expect } from 'chai';
import * as UE from 'ue';
import { GridConverter } from '../src/reactorUMG/container/grid';
import { CanvasConverter } from '../src/reactorUMG/container/canvas';
import { OverlayConverter } from '../src/reactorUMG/container/overlay';
import { UniformGridConverter } from '../src/reactorUMG/container/uniformgrid';

describe('Container converter extra coverage', () => {
  it('handles grid shorthand templates, auto replacements, placeSelf, and slot fallbacks', () => {
    const converter = new GridConverter('grid', { style: { gridTemplate: 'auto 100px / repeat(2, 50px) auto', gap: '10px 20px', placeItems: 'start end' } }, null);
    const widget = converter.createNativeWidget() as UE.GridPanel;
    expect(widget.columnFills).to.deep.equal([1, 1, 1]);
    expect(widget.rowFills).to.deep.equal([1, 1]);

    const first = new UE.TextBlock();
    const second = new UE.TextBlock();

    converter.appendChild(widget, first as any, 'span', { style: { gridColumn: 'auto', gridRow: 'auto', placeSelf: 'end start', padding: '2px' } });
    converter.appendChild(widget, second as any, 'span', { style: { gridColumnStart: '2', gridColumnEnd: '4', gridRowStart: '1', gridRowEnd: 'auto', alignSelf: 'stretch', justifySelf: 'stretch' } });

    const slot1 = (first as any).Slot as UE.GridSlot;
    expect(slot1.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Left);
    expect(slot1.VerticalAlignment).to.equal(UE.EVerticalAlignment.VAlign_Bottom);

    const slotsArr: any = widget.Slots as any;
    (first as any).Slot = null;
    (second as any).Slot = null;
    (widget as any).Slots = slotsArr;
    (widget as any).Slots.Get = (i: number) => slotsArr[i];

    converter.update(widget, { style: {} }, { style: { gap: '4px 8px', placeItems: 'center end' } });
    expect(slotsArr[0].padding?.Top ?? 0).to.be.greaterThan(0);
    expect(slotsArr[1].HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Right);
  });

  it('supports stretched offsets, height-only sizing, autosize, and pivot alignment for canvas', () => {
    const converter = new CanvasConverter('canvas', { style: { width: '300px', height: '150px' } }, null);
    const widget = converter.createNativeWidget() as UE.CanvasPanel;

    const stretched = new UE.TextBlock();
    converter.appendChild(widget, stretched as any, 'span', { style: { positionAnchor: 'fill', top: '4px', left: '5px', right: '6px', bottom: '7px' } });
    const stretchedSlot = (stretched as any).Slot as UE.CanvasPanelSlot;
    expect(stretchedSlot.Offsets.Left).to.equal(5);
    expect(stretchedSlot.Offsets.Bottom).to.equal(7);

    const heightOnly = new UE.TextBlock();
    converter.appendChild(widget, heightOnly as any, 'span', { style: { height: '80px', width: 'none', aspectRatio: '2', top: '1px', left: '2px', anchorAlign: 'right bottom' } });
    const heightSlot = (heightOnly as any).Slot as UE.CanvasPanelSlot;
    expect(heightSlot.Size.X).to.equal(160);
    expect(heightSlot.Size.Y).to.equal(80);
    expect(heightSlot.Alignment.X).to.equal(1);
    expect(heightSlot.Alignment.Y).to.equal(1);

    const autoSized = new UE.TextBlock();
    converter.appendChild(widget, autoSized as any, 'span', { style: { width: 'none', height: 'none', anchorPivot: '0 1' } });
    const autoSlot = (autoSized as any).Slot as UE.CanvasPanelSlot;
    expect(autoSlot.AutoSize).to.be.true;
    expect(autoSlot.Alignment.X).to.equal(0);
    expect(autoSlot.Alignment.Y).to.equal(1);
  });

  it('aggregates translate functions across transform and translate props for overlay', () => {
    const converter = new OverlayConverter('overlay', {}, null);
    UE.UMGManager.GetWidgetScreenPixelSize = () => new UE.Vector2D(50, 40);
    const widget = converter.createNativeWidget() as UE.Overlay;
    const child = new UE.TextBlock();

    converter.appendChild(widget, child as any, 'span', { style: { position: 'absolute', left: '0px', top: '0px', transform: 'translate3d(1px,2px,0) translateX(3px) translateY(4px)', translate: '5px 6px', translateX: '7px', translateY: '8px' } });
    const slot = (child as any).Slot as UE.OverlaySlot;
    expect(slot.padding?.Left).to.equal(16);
    expect(slot.padding?.Top).to.equal(20);
  });

  it('honors object padding, number/string indices, and update path for uniform grid', () => {
    const converter = new UniformGridConverter('uniformgrid', { minCellSize: { x: 10, y: 20 }, cellPadding: { top: 1, right: 2, bottom: 3, left: 4 } }, null);
    const widget = converter.createNativeWidget() as UE.UniformGridPanel;
    expect(widget.MinDesiredSlotWidth).to.equal(10);
    expect(widget.SlotPadding?.Left).to.equal(1);
    expect(widget.SlotPadding?.Bottom).to.equal(4);

    converter.update(widget, {}, { cellPadding: '5 6 7 8', minCellSize: { x: 30, y: 40 } });
    expect(widget.MinDesiredSlotHeight).to.equal(40);
    expect(widget.SlotPadding?.Top).to.equal(5);
    expect(widget.SlotPadding?.Left).to.equal(8);

    const child = new UE.TextBlock();
    converter.appendChild(widget, child as any, 'span', { style: { gridRow: 2, gridColumn: '3', padding: '1px' } });
    const slot = (child as any).Slot as UE.UniformGridSlot;
    expect(slot.row).to.equal(2);
    expect(slot.column).to.equal(3);
    expect(slot.HorizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Fill);
  });
});
