import { expect } from 'chai';
import { StyleTagConverter } from '../src/reactorUMG/jsx/style';
import { getInlineStyles } from '../src/reactorUMG/parsers/inline_style_registry';

describe('StyleTagConverter', () => {
  it('registers inline styles from string, array and dangerouslySetInnerHTML', () => {
    const conv = new StyleTagConverter('style', { children: ['.foo{color:red;}', '.bar{margin:2px;}'] }, null);
    conv.creatWidget();
    expect(getInlineStyles('class', 'foo')?.color).to.equal('red');
    expect(getInlineStyles('class', 'bar')?.margin).to.equal('2px');

    conv.updateWidget(null as any, {}, { dangerouslySetInnerHTML: { __html: '.baz{padding:4px;}' } });
    expect(getInlineStyles('class', 'baz')?.padding).to.equal('4px');

    conv.dispose();
    expect(getInlineStyles('class', 'foo')).to.be.undefined;
  });
});
