import { expect } from 'chai';
import {
  clearAllInlineStyles,
  clearInlineStylesForSource,
  getInlineStyles,
  normalizePseudo,
  parseInlineCss,
  registerInlineStyles,
} from '../src/reactorUMG/parsers/inline_style_registry';
import { convertCssToStyles2 } from '../src/reactorUMG/parsers/cssstyle_parser';

describe('inline_style_registry', () => {
  afterEach(() => {
    clearAllInlineStyles();
  });

  it('normalizes pseudo selectors consistently', () => {
    expect(normalizePseudo()).to.equal('base');
    expect(normalizePseudo('  ')).to.equal('base');
    expect(normalizePseudo('hover')).to.equal(':hover');
    expect(normalizePseudo(':active')).to.equal(':active');
  });

  it('registers inline styles per source and clears correctly', () => {
    registerInlineStyles('sourceA', [
      { kind: 'class', key: 'btn', pseudo: 'hover', styles: { color: 'red' } },
    ]);
    registerInlineStyles('sourceB', [
      { kind: 'class', key: 'btn', pseudo: ':hover', styles: { border: '1px solid black' } },
    ]);

    const merged = getInlineStyles('class', 'btn', ':hover');
    expect(merged).to.deep.equal({ color: 'red', border: '1px solid black' });

    clearInlineStylesForSource('sourceA');
    const afterClear = getInlineStyles('class', 'btn', ':hover');
    expect(afterClear).to.deep.equal({ border: '1px solid black' });
  });

  it('parses inline css text into structured rules', () => {
    const cssText = `
      .btn:hover, #root {
        color: red;
        padding-left: 8px;
      }
      button[disabled] {
        opacity: 0.4;
      }
    `;

    const rules = parseInlineCss(cssText, convertCssToStyles2);

    expect(rules).to.deep.include({
      kind: 'class',
      key: 'btn',
      pseudo: ':hover',
      styles: { color: 'red', paddingLeft: '8px' },
    });
    expect(rules).to.deep.include({
      kind: 'id',
      key: 'root',
      pseudo: 'base',
      styles: { color: 'red', paddingLeft: '8px' },
    });
    expect(rules).to.deep.include({
      kind: 'type',
      key: 'button[disabled]',
      pseudo: 'base',
      styles: { opacity: '0.4' },
    });
  });
});
