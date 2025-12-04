import { expect } from 'chai';
import { StyleTagConverter } from '../src/reactorUMG/jsx/style';
import { clearAllInlineStyles, getInlineStyles } from '../src/reactorUMG/parsers/inline_style_registry';

describe('StyleTagConverter', () => {
  beforeEach(() => clearAllInlineStyles());

  it('registers inline CSS rules and refreshes them on update', () => {
    const converter = new StyleTagConverter('style', { children: 'p { color: red; } .cta:hover { background-color: blue; }' }, null);
    converter.creatWidget();

    expect(getInlineStyles('type', 'p')).to.deep.equal({ color: 'red' });
    expect(getInlineStyles('class', 'cta', ':hover')).to.deep.equal({ backgroundColor: 'blue' });

    converter.updateWidget(null as any, {}, { children: 'p { color: green; }' });
    expect(getInlineStyles('type', 'p')).to.deep.equal({ color: 'green' });
  });

  it('clears inline styles on dispose', () => {
    const converter = new StyleTagConverter('style', { children: '.badge { color: yellow; }' }, null);
    converter.creatWidget();
    expect(getInlineStyles('class', 'badge')).to.deep.equal({ color: 'yellow' });

    converter.dispose();
    expect(getInlineStyles('class', 'badge')).to.be.undefined;
  });
});
