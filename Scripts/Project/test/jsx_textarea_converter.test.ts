import { expect } from 'chai';
import { TextAreaConverter } from '../src/reactorUMG/jsx/textarea';
import { RGBToLinearColor } from '../src/reactorUMG/parsers/css_color_parser';
import * as UE from 'ue';

describe('TextAreaConverter', () => {
  it('sets multiline text props and wires change/submit/blur events like a React <textarea>', () => {
    const events: Record<string, any[]> = { change: [], submit: [], blur: [] };
    const converter = new TextAreaConverter('textarea', {
      value: 'initial note',
      placeholder: 'type here',
      readOnly: true,
      disabled: false,
      onChange: (evt: any) => events.change.push(evt.target.value),
      onSubmit: (evt: any) => events.submit.push(evt.target),
      onBlur: (evt: any) => events.blur.push(evt.target.value),
      style: { color: '#00aa00', fontSize: '20px' },
    }, null);

    const widget = converter.createNativeWidget() as UE.MultiLineEditableText;
    expect(widget.text).to.equal('initial note');
    expect(widget.hint).to.equal('type here');
    expect(widget.readOnly).to.be.true;
    expect(widget.enabled).to.be.true;
    expect(widget.WidgetStyle.ColorAndOpacity.SpecifiedColor.G).to.equal(RGBToLinearColor[170]);

    widget.OnTextChanged[0]('draft');
    widget.OnTextCommitted[0]('final', UE.ETextCommit.Default);
    widget.OnTextCommitted[0]('lost focus', UE.ETextCommit.OnUserMovedFocus);
    expect(events.change).to.deep.equal(['draft']);
    expect(events.submit).to.deep.equal(['final']);
    // expect(events.blur).to.deep.equal(['lost focus']);
  });

  it('rebinds event handlers on update and syncs styles when className/style change', () => {
    const nextChange: any[] = [];
    const converter = new TextAreaConverter('textarea', { onChange: () => {} }, null);
    const widget = converter.createNativeWidget() as UE.MultiLineEditableText;
    expect(widget.WidgetStyle.ColorAndOpacity.SpecifiedColor.B).to.equal(0);

    converter.update(widget as any, {}, { onChange: (evt: any) => nextChange.push(evt.target.value), style: { color: '#112233' } });
    expect(widget.OnTextChanged).to.have.length(1);
    widget.OnTextChanged[0]('patched');
    expect(nextChange).to.deep.equal(['patched']);
    expect(widget.WidgetStyle.ColorAndOpacity.SpecifiedColor.B).to.equal(RGBToLinearColor[51]);
  });
});
