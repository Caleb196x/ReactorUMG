import { expect } from 'chai';
import { InputJSXConverter } from '../src/reactorUMG/jsx/input';
import * as UE from 'ue';

describe('InputJSXConverter', () => {
  it('behaves like a text input: placeholder, default value, change events, and password flag', () => {
    const changeEvents: any[] = [];
    const converter = new InputJSXConverter('input', {
      type: 'password',
      name: 'username',
      placeholder: 'Enter name',
      defaultValue: 'guest',
      readOnly: false,
      onChange: (evt: any) => changeEvents.push(evt),
      style: { fontSize: '18px' },
    }, null);

    const widget = converter.createNativeWidget() as UE.EditableText;
    expect(widget).to.be.instanceof(UE.EditableText);
    expect(widget.hint).to.equal('Enter name');
    expect(widget.text).to.equal('guest');
    expect(widget.password).to.be.true;

    widget.OnTextChanged[0]('player1');
    expect(changeEvents).to.have.length(1);
    expect(changeEvents[0].target).to.deep.include({ name: 'username', type: 'password', value: 'player1' });
    expect(widget.Font).to.exist;
  });

  it('connects checkbox change handlers and replaces them on update', () => {
    const initialEvents: any[] = [];
    const updatedEvents: any[] = [];
    const converter = new InputJSXConverter('input', { type: 'checkbox', checked: true, onChange: (evt: any) => initialEvents.push(evt) }, null);

    const widget = converter.createNativeWidget() as UE.CheckBox;
    expect(widget.checked).to.be.true;
    expect(widget.OnCheckStateChanged).to.have.length(1);

    widget.OnCheckStateChanged[0](false);
    expect(initialEvents[0].target.checked).to.be.false;

    converter.update(widget as any, {}, { onChange: (evt: any) => updatedEvents.push(evt), checked: false });
    expect(widget.checked).to.be.false;
    expect(widget.OnCheckStateChanged).to.have.length(1);
    widget.OnCheckStateChanged[0](true);
    expect(updatedEvents[0].target.checked).to.be.true;
  });

  it('prevents radio buttons from unchecking themselves and forwards change events', () => {
    const changeEvents: any[] = [];
    const converter = new InputJSXConverter('input', { type: 'radio', name: 'difficulty', checked: true, onChange: (evt: any) => changeEvents.push(evt) }, null);
    const widget = converter.createNativeWidget() as UE.CheckBox;

    expect(widget.WidgetStyle.CheckBoxType).to.equal(UE.ESlateCheckBoxType.CheckBox);
    widget.OnCheckStateChanged[0](true);
    expect(changeEvents[0].target).to.deep.equal({ name: 'difficulty', type: 'radio', checked: true });

    widget.OnCheckStateChanged[0](false);
    expect(widget.checked).to.be.true; // radio auto-restores checked state
  });

  it('wraps range inputs with a sized box and wires slider values and events', () => {
    const sliderEvents: any[] = [];
    const converter = new InputJSXConverter('input', { type: 'range', value: 0.25, min: 0, max: 1, step: 0.05, onChange: (evt: any) => sliderEvents.push(evt) }, null);
    const widget = converter.createNativeWidget();

    expect(widget).to.be.instanceof(UE.SizeBox);
    const slider = (widget as UE.SizeBox).GetContent();
    expect(slider).to.be.instanceof(UE.Slider);
    expect((widget as UE.SizeBox).WidthOverride).to.equal(240);

    (slider as UE.Slider).OnValueChanged[0](0.75);
    expect(sliderEvents[0].target.value).to.equal(0.75);

    converter.update(slider as any, {}, { onChange: (evt: any) => sliderEvents.push({ updated: evt.target.value }), value: 0.5 });
    expect((slider as UE.Slider).OnValueChanged).to.have.length(1);
    (slider as UE.Slider).OnValueChanged[0](0.5);
    expect(sliderEvents[1]).to.deep.equal({ updated: 0.5 });
  });
});
