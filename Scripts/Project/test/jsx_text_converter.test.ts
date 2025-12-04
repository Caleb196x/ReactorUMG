import { expect } from 'chai';
import { TextConverter } from '../src/reactorUMG/jsx/text';
import { RGBToLinearColor } from '../src/reactorUMG/parsers/css_color_parser';
import * as UE from 'ue';

describe('TextConverter', () => {
  it('applies typography styles and content to a TextBlock for rich text elements', () => {
    const converter = new TextConverter('p', {
      children: 'Hello Reactor',
      style: { color: '#ff5500', textAlign: 'center', lineHeight: '1.8', textTransform: 'uppercase', fontWeight: '600' },
    }, null);

    const widget = converter.createNativeWidget() as UE.TextBlock;
    expect(widget).to.be.instanceof(UE.TextBlock);
    expect(widget.text).to.equal('Hello Reactor');
    expect(widget.ColorAndOpacity.SpecifiedColor.R).to.equal(RGBToLinearColor[255]);
    expect(widget.Justification).to.equal(UE.ETextJustify.Center);
    expect(widget.LineHeightPercentage).to.equal(1.8);
    expect(widget.TextTransformPolicy).to.equal(UE.ETextTransformPolicy.ToUpper);
  });

  it('creates a WrapBox for label children that contain React elements and honors layout styles', () => {
    const reactChild = { $$typeof: Symbol.for('react.element'), type: 'span', props: { children: 'React piece' } };
    const converter = new TextConverter('label', {
      children: [reactChild, ' trailing'],
      style: { flexDirection: 'column', gap: '8px', textAlign: 'right' },
    }, null);

    const widget = converter.createNativeWidget();
    expect(widget).to.be.instanceof(UE.WrapBox);
    const wrap = widget as UE.WrapBox;
    expect(wrap.Orientation).to.equal(UE.EOrientation.Orient_Vertical);
    expect(wrap.padding?.X).to.equal(8);
    expect(wrap.horizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Right);
  });

  it('updates text content and alignment when props change', () => {
    const converter = new TextConverter('span', { text: 'Old', style: { color: '#ffffff' } }, null);
    const widget = converter.createNativeWidget() as UE.TextBlock;
    expect(widget.text).to.equal('Old');

    converter.update(widget as any, {}, { text: 'New text', lineHeight: '2', textAlign: 'right', textTransform: 'lowercase' });
    expect(widget.text).to.equal('New text');
    expect(widget.LineHeightPercentage).to.equal(2);
    expect(widget.Justification).to.equal(UE.ETextJustify.Right);
    expect(widget.TextTransformPolicy).to.equal(UE.ETextTransformPolicy.ToLower);
  });

  it('normalizes mixed content and respects default styles', () => {
    const converter = new TextConverter('h3', { children: ['Num ', 1, true] }, null);
    const widget = converter.createNativeWidget() as UE.TextBlock;
    expect(widget.text).to.equal('Num 1true');
    expect(widget.LineHeightPercentage).to.equal(1.35);
    expect(widget.Font?.OutlineSettings.OutlineSize).to.exist;
  });

  it('skips updates for invalid text blocks', () => {
    const converter = new TextConverter('span', { text: 'Hello' }, null);
    const invalid: any = { IsPendingKill: () => true, IsValidLowLevelFast: () => false, SetText: () => { throw new Error('should not call'); } };
    converter.update(invalid, {}, { text: 'Should ignore' });
  });

  it('keeps text when lineHeight invalid and uses direct prop overrides', () => {
    const converter = new TextConverter('span', { text: 'Keep', lineHeight: '', color: '#123456', textAlign: 'center' }, null);
    const widget = converter.createNativeWidget() as UE.TextBlock;
    expect(widget.LineHeightPercentage).to.equal(0); // default from stub convertLengthUnitToSlateUnit
    expect(widget.Justification).to.equal(UE.ETextJustify.Center);
    converter.update(widget as any, {}, { textAlign: 'left', lineHeight: null });
    expect(widget.Justification).to.equal(UE.ETextJustify.Left);
  });

  it('disables wrapping and uses monospace defaults for pre', () => {
    const content = 'line1\n  line2';
    const converter = new TextConverter('pre', { children: content }, null);
    const widget = converter.createNativeWidget() as UE.TextBlock;
    expect(widget.AutoWrapText).to.be.false;
    expect(widget.text).to.equal(content);
    expect(widget.Font?.bForceMonospaced).to.be.true;
  });
});
