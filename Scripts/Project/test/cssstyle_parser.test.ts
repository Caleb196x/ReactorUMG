import { expect } from 'chai';
import {
  convertCssToStyles,
  convertCssToStyles2,
  getAllStyles,
  getStyleFromIdSelector,
  getStyleFromTypeSelector,
  getStylesFromClassSelector,
} from '../src/reactorUMG/parsers/cssstyle_parser';
import {
  clearAllInlineStyles,
  registerInlineStyles,
} from '../src/reactorUMG/parsers/inline_style_registry';

describe('cssstyle_parser.getAllStyles', () => {
  const originalGetter = (globalThis as any).getCssStyleFromGlobalCache;

  afterEach(() => {
    clearAllInlineStyles();
    if (originalGetter === undefined) {
      delete (globalThis as any).getCssStyleFromGlobalCache;
    } else {
      (globalThis as any).getCssStyleFromGlobalCache = originalGetter;
    }
  });

  it('converts css objects and strings to styles', () => {
    const converted = convertCssToStyles({
      base: { color: 'red' },
      hover: { border: '1px solid blue' },
      custom: { padding: 8 },
    });
    expect(converted).to.deep.equal({
      color: 'red',
      hover: { border: '1px solid blue' },
      custom: { padding: 8 },
    });

    const withPrimitiveBase = convertCssToStyles({ base: 'raw', focus: { outline: 'none' } });
    expect(withPrimitiveBase).to.deep.equal({ focus: { outline: 'none' }, base: 'raw' });

    const parsed = convertCssToStyles2('{ margin-top: 4px; padding-left: 2em; }');
    expect(parsed).to.deep.equal({ marginTop: '4px', paddingLeft: '2em' });

    expect(convertCssToStyles2('')).to.deep.equal({});
  });

  it('reads class styles with inline rules and pseudo fallbacks', () => {
    const cssCache: Record<string, any> = {
      '.btn': { color: 'baseColor' },
      '.btn:hover': { color: 'hoverColor' },
      '.primary': { border: '1px solid green' },
    };
    (globalThis as any).getCssStyleFromGlobalCache = (selector: string, pseudo?: string) => {
      const key = pseudo && pseudo !== 'base' ? `${selector}:${pseudo.replace(/^:/, '')}` : selector;
      return cssCache[key];
    };

    registerInlineStyles('unit', [
      { kind: 'class', key: 'btn', pseudo: ':hover', styles: { padding: 12 } },
    ]);

    const baseStyles = getStylesFromClassSelector('btn primary');
    expect(baseStyles).to.deep.equal({ color: 'baseColor', border: '1px solid green' });

    const hoverStyles = getStylesFromClassSelector('btn', ':hover');
    expect(hoverStyles).to.deep.equal({ color: 'hoverColor', padding: 12 });
  });

  it('returns empty object when class selector is missing', () => {
    expect(getStylesFromClassSelector('')).to.deep.equal({});
  });

  it('reads id and type selectors with pseudo fallback stripping colon', () => {
    const cssCache: Record<string, any> = {
      '#root': { color: 'rootBase' },
      '#root:focus': { outline: 'none' },
      button: { padding: 4 },
      'button:hover': { padding: 8 },
    };
    (globalThis as any).getCssStyleFromGlobalCache = (selector: string, pseudo?: string) => {
      const key = pseudo && pseudo !== 'base' ? `${selector}:${pseudo.replace(/^:/, '')}` : selector;
      return cssCache[key];
    };

    registerInlineStyles('id-inline', [{ kind: 'id', key: 'root', pseudo: 'base', styles: { color: 'inlineRoot' } }]);
    registerInlineStyles('type-inline', [{ kind: 'type', key: 'button', pseudo: 'base', styles: { margin: 3 } }]);

    expect(getStyleFromIdSelector('root')).to.deep.equal({ color: 'inlineRoot' });
    expect(getStyleFromIdSelector('root', ':focus')).to.deep.equal({ outline: 'none' });
    expect(getStyleFromTypeSelector('button')).to.deep.equal({ padding: 4, margin: 3 });
    expect(getStyleFromTypeSelector('button', ':hover')).to.deep.equal({ padding: 8 });
  });

  it('falls back when cached selectors omit the colon in pseudo args', () => {
    const cssCache: Record<string, any> = {
      '#modal': { color: 'base' },
      '#modalhover': { opacity: 0.5 },
      nav: { padding: 2 },
      navhover: { margin: 1 },
    };
    (globalThis as any).getCssStyleFromGlobalCache = (selector: string, pseudo?: string) => {
      const key = pseudo && pseudo !== 'base' ? `${selector}${pseudo.replace(/^:/, '')}` : selector;
      return cssCache[key];
    };

    expect(getStyleFromIdSelector('modal', ':hover')).to.deep.equal({ opacity: 0.5 });
    expect(getStyleFromTypeSelector('nav', ':hover')).to.deep.equal({ margin: 1 });
  });

  it('tries the non-colon pseudo fallback when the primary lookup misses', () => {
    (globalThis as any).getCssStyleFromGlobalCache = (_selector: string, pseudo?: string) => {
      if (pseudo === 'hover') {
        return { opacity: 0.2 };
      }
      return undefined;
    };

    expect(getStyleFromTypeSelector('section', ':hover')).to.deep.equal({ opacity: 0.2 });
  });

  it('handles missing selector inputs gracefully', () => {
    expect(getStyleFromIdSelector('', ':hover')).to.deep.equal({});
    expect(getStyleFromTypeSelector('', ':hover')).to.deep.equal({});
  });

  it('falls back for id selectors when colon lookup fails', () => {
    (globalThis as any).getCssStyleFromGlobalCache = (_selector: string, pseudo?: string) => {
      if (pseudo === 'hover') {
        return { background: 'blue' };
      }
      return undefined;
    };

    expect(getStyleFromIdSelector('dialog', ':hover')).to.deep.equal({ background: 'blue' });
  });

  it('returns empty styles when props are missing', () => {
    expect(getAllStyles('div', undefined as any)).to.deep.equal({});
  });

  it('merges styles with correct precedence', () => {
    const cssCache: Record<string, any> = {
      button: { padding: 'typePadding', color: 'typeColor' },
      'button[type="submit"]': { fontWeight: 'bold', padding: 'typeAttrPadding' },
      '.primary': { color: 'classColor', border: '1px solid blue' },
      '.highlight': { border: '1px solid red', padding: 'classPadding' },
      '.container button': { margin: 'descendantMargin', padding: 'descendantPadding' },
      '.container button[disabled="true"]': { opacity: 0.5 },
      '#submitBtn': { color: 'idColor' },
    };

    (globalThis as any).getCssStyleFromGlobalCache = (selector: string) => cssCache[selector];

    const styles = getAllStyles('button', {
      className: 'primary highlight',
      id: 'submitBtn',
      type: 'submit',
      disabled: true,
      style: { color: 'inlineColor', padding: 'inlinePadding' },
      __parentProps: { className: 'container' },
    });

    expect(styles).to.include({
      color: 'inlineColor',
      padding: 'inlinePadding',
      border: '1px solid red',
      margin: 'descendantMargin',
      opacity: 0.5,
      fontWeight: 'bold',
    });
  });
});
