import { expect } from 'chai';
import { SelectConverter } from '../src/reactorUMG/jsx/select';
import * as UE from 'ue';
import { RGBToLinearColor } from '../src/reactorUMG/parsers/css_color_parser';

describe('SelectConverter', () => {
  it('populates options and selects based on value like a React <select>', () => {
    const changes: any[] = [];
    const converter = new SelectConverter('select', {
      value: 'hard',
      disabled: false,
      focusable: true,
      onChange: (evt: any) => changes.push(evt.target.value),
      style: { color: '#112233', fontSize: '16px' },
    }, null);

    const combo = converter.createNativeWidget() as UE.ComboBoxString;
    expect(combo.bIsFocusable).to.be.true;

    converter.appendChild(combo as any, {} as any, 'option', { value: 'easy', children: 'Easy' });
    converter.appendChild(combo as any, {} as any, 'option', { value: 'hard', children: 'Hard' });
    converter.appendChild(combo as any, {} as any, 'option', { value: 'nightmare', children: 'Nightmare' });

    expect(combo.Options).to.deep.equal(['Easy', 'Hard', 'Nightmare']);
    expect(combo.SelectedOption).to.equal('Hard');
    expect(combo.ForegroundColor?.SpecifiedColor.R).to.equal(RGBToLinearColor[17]);
    expect(combo.Font).to.exist;

    combo.OnSelectionChanged[0]('Nightmare', UE.ESelectInfo.OnKeyPress);
    expect(changes).to.deep.equal(['nightmare']);

    // non-option children are ignored
    converter.appendChild(combo as any, {} as any, 'span', {});
    expect(combo.Options).to.deep.equal(['Easy', 'Hard', 'Nightmare']);
  });

  it('rebinds onChange handlers on update and toggles enabled state', () => {
    const first: any[] = [];
    const next: any[] = [];
    const converter = new SelectConverter('select', { defaultValue: 'a', onChange: (evt: any) => first.push(evt.target.value) }, null);
    const combo = converter.createNativeWidget() as UE.ComboBoxString;

    expect(combo.OnSelectionChanged).to.have.length(1);
    combo.OnSelectionChanged[0]('a', UE.ESelectInfo.OnKeyPress);
    expect(first).to.deep.equal(['a']);

    converter.update(combo as any, {}, { onChange: (evt: any) => next.push(evt.target.value), disabled: true, focusable: false });
    expect(combo.OnSelectionChanged).to.have.length(1);
    combo.OnSelectionChanged[0]('b', UE.ESelectInfo.OnKeyPress);
    expect(next).to.deep.equal(['b']);
    expect(combo.bIsEnabled).to.be.false;
    expect(combo.bIsFocusable).to.be.false;

    // no selection when value not found
    converter.update(combo as any, {}, { value: 'missing' });
    expect(combo.SelectedOption).to.be.undefined;
  });
});
