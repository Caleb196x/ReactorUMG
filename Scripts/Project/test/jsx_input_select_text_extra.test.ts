import { expect } from 'chai';
import { InputJSXConverter } from '../src/reactorUMG/jsx/input';
import { SelectConverter } from '../src/reactorUMG/jsx/select';
import { TextConverter } from '../src/reactorUMG/jsx/text';
import { registerInlineStyles, clearAllInlineStyles } from '../src/reactorUMG/parsers/inline_style_registry';
import * as UE from 'ue';

describe('InputJSXConverter extras', () => {
  afterEach(() => {
    clearAllInlineStyles();
  });

  it('prevents radio from unchecking itself and rebinds checkbox change', () => {
    const radioChanges: any[] = [];
    const converter = new InputJSXConverter('input', { type: 'radio', checked: true, onChange: (e: any) => radioChanges.push(e.target.checked) }, null);
    const widget = converter.createNativeWidget() as UE.CheckBox;
    expect(widget.checked).to.be.true;

    // simulate trying to uncheck radio
    widget.OnCheckStateChanged[0](false);
    expect(widget.checked).to.be.true; // re-checked internally
    expect(radioChanges).to.deep.equal([]); // uncheck prevented; no new change fired

    const checkChanges: any[] = [];
    const checkboxConv = new InputJSXConverter('input', { type: 'checkbox', checked: false, onChange: (e: any) => checkChanges.push(e.target.checked) }, null);
    const checkWidget = checkboxConv.createNativeWidget() as UE.CheckBox;
    expect(checkWidget.OnCheckStateChanged).to.have.length(1);
    checkboxConv.update(checkWidget, {}, { onChange: (e: any) => checkChanges.push(e.target.checked) });
    expect(checkWidget.OnCheckStateChanged).to.have.length(1); // re-bound
    checkWidget.OnCheckStateChanged[0](true);
    expect(checkChanges).to.deep.equal([true]);
  });

  it('wraps range inputs in a size box and updates slider props and handlers', () => {
    const changes: any[] = [];
    const converter = new InputJSXConverter('input', {
      type: 'range',
      value: 10,
      min: 0,
      max: 20,
      step: 2,
      sliderBarColor: 'red',
      sliderHandleColor: 'blue',
      onChange: (e: any) => changes.push(e.target.value),
    }, null);

    const wrapper = converter.createNativeWidget() as UE.SizeBox;
    expect(wrapper).to.be.instanceof(UE.SizeBox);
    expect(wrapper.WidthOverride).to.equal(240);
    const slider = wrapper.GetContent() as UE.Slider;
    expect(slider.value).to.equal(10);
    expect(slider.barColor).to.equal('red');
    slider.OnValueChanged[0](12);
    expect(changes).to.deep.equal([12]);

    converter.update(wrapper as any, {}, { value: 5, sliderBarColor: 'green', onChange: (e: any) => changes.push(e.target.value) });
    expect(slider.value).to.equal(5);
    expect(slider.barColor).to.equal('green');
    slider.OnValueChanged[0](7);
    expect(changes).to.deep.equal([12, 7]);

    // update using wrapper to hit resolveSliderInstance-from-sizebox path
    converter.update(wrapper as any, {}, { value: 9 });
    expect(slider.value).to.equal(9);
  });

  it('applies editable text styles and rebinds onChange', () => {
    const changes: any[] = [];
    const converter = new InputJSXConverter('input', {
      type: 'text',
      placeholder: 'ph',
      defaultValue: 'def',
      disabled: true,
      readOnly: true,
      style: { fontSize: '18px', color: '#ff0000' },
      onChange: (e: any) => changes.push(e.target.value),
    }, null);
    const text = converter.createNativeWidget() as UE.EditableText;
    expect(text.hint).to.equal('ph');
    expect(text.text).to.equal('def');
    expect(text.enabled).to.be.false;
    expect(text.readOnly).to.be.true;
    expect(text.Font?.OutlineSettings.OutlineSize).to.exist;

    converter.update(text as any, {}, { onChange: (e: any) => changes.push(`u:${e.target.value}`) });
    expect(text.OnTextChanged).to.have.length(1);
    text.OnTextChanged[0]('changed');
    expect(changes).to.deep.equal(['u:changed']);
  });

  it('creates plain text input without handlers gracefully', () => {
    const converter = new InputJSXConverter('input', { type: 'text', placeholder: 'p' }, null);
    const widget = converter.createNativeWidget() as UE.EditableText;
    expect(widget.hint).to.equal('p');
    expect(widget.OnTextChanged.length).to.equal(0);
  });

  it('sets password type when requested and resolves slider without wrapper', () => {
    const pass = new InputJSXConverter('input', { type: 'password' }, null);
    const pwWidget = pass.createNativeWidget() as UE.EditableText;
    expect(pwWidget.password).to.be.true;

    const sliderConv = new InputJSXConverter('input', { type: 'range', value: 1 }, null);
    const wrapper = sliderConv.createNativeWidget() as UE.SizeBox;
    const slider = wrapper.GetContent() as UE.Slider;
    sliderConv.update(slider as any, {}, { value: 3, sliderHandleColor: 'c' });
    expect(slider.value).to.equal(3);
    expect(slider.handleColor).to.equal('c');

    const wrapperAgain = sliderConv.createNativeWidget() as UE.SizeBox;
    expect(wrapperAgain).to.equal(wrapper);
  });

  it('rebinds radio change handler on update path', () => {
    const first: any[] = [];
    const second: any[] = [];
    const converter = new InputJSXConverter('input', { type: 'radio', checked: true, onChange: (e: any) => first.push(e.target.checked) }, null);
    const widget = converter.createNativeWidget() as UE.CheckBox;
    converter.update(widget as any, { type: 'radio', onChange: converter }, { onChange: (e: any) => second.push(e.target.checked) });
    widget.OnCheckStateChanged[0](true);
    expect(first).to.deep.equal([]);
    expect(second).to.deep.equal([true]);
  });
});

describe('SelectConverter extras', () => {
  afterEach(() => {
    clearAllInlineStyles();
  });

  it('applies combo button pseudo-state brushes and text styles', () => {
    registerInlineStyles('sel', [
      { kind: 'class', key: 'sel', pseudo: ':hover', styles: { backgroundImage: 'url("/hover.png")' } },
      { kind: 'class', key: 'sel', pseudo: ':active', styles: { backgroundImage: 'url("/active.png")' } },
      { kind: 'class', key: 'sel', pseudo: ':disabled', styles: { backgroundImage: 'url("/disabled.png")' } },
    ]);

    const converter = new SelectConverter('select', {
      className: 'sel',
      style: { backgroundImage: 'url("/normal.png")', color: '#00ff00' },
    }, null);
    const combo = converter.createNativeWidget() as UE.ComboBoxString;
    expect(combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Normal.ResourceObject.texturePath).to.equal('/normal.png');
    // Pseudo styles fallback to normal in stubbed getAllStyles; ensure brushes exist
    expect(combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Hovered.ResourceObject.texturePath).to.exist;
    expect(combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Pressed.ResourceObject.texturePath).to.exist;
    expect(combo.WidgetStyle.ComboButtonStyle.ButtonStyle.Disabled.ResourceObject.texturePath).to.exist;
    expect(combo.ForegroundColor?.SpecifiedColor.G).to.equal(1);
  });
});

describe('TextConverter extras', () => {
  it('uses padding as gaps for horizontal wrap boxes and overrides styles via props', () => {
    const child = { $$typeof: Symbol.for('react.element'), type: 'span', props: { children: 'c' } };
    const converter = new TextConverter('label', {
      children: [child, 't'],
      style: { padding: '1px 2px 3px 4px', textAlign: 'left' },
    }, null);
    const widget = converter.createNativeWidget() as UE.WrapBox;
    expect(widget.padding?.X).to.equal(4);
    expect(widget.padding?.Y).to.equal(2);
    expect(widget.horizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Left);

    converter.update(widget, { children: [child, 't'] }, { children: [child], style: { padding: '2px 6px 8px 10px', textAlign: 'center' } });
    expect(widget.padding?.X).to.equal(10);
    expect(widget.padding?.Y).to.equal(6);
    expect(widget.horizontalAlignment).to.equal(UE.EHorizontalAlignment.HAlign_Center);
  });

  it('handles append/remove child slots for wrap box', () => {
    const child = { $$typeof: Symbol.for('react.element'), type: 'span', props: { children: 'c' } };
    const converter = new TextConverter('label', { children: [child] }, null);
    const wrap = converter.createNativeWidget() as UE.WrapBox;
    const childWidget: any = {};
    converter.appendChild(wrap, childWidget, 'span', {});
    expect(wrap.children).to.include(childWidget);
    converter.removeChild(wrap, childWidget);
    expect(wrap.children).to.not.include(childWidget);
  });

  it('skips font setup when no font styles are present', () => {
    const converter = new TextConverter('span', { text: 'Plain', style: {} }, null);
    const widget = converter.createNativeWidget() as UE.TextBlock;
    expect(widget.Font).to.be.undefined;
  });
});
