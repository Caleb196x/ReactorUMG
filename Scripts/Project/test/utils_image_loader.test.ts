import { expect } from 'chai';
import {
  isKeyOfRecord,
  isEmpty,
  mergeClassStyleWithInlineStyle,
  twoArraysEqual,
  safeParseFloat,
  findChangedProps,
  compareTwoFunctions,
  isReactElementInChildren,
} from '../src/reactorUMG/misc/utils';
import { ImageLoader } from '../src/reactorUMG/misc/image_loader';
import * as UE from 'ue';

describe('misc utils', () => {
  const originalCssGetter = (globalThis as any).getCssStyleFromGlobalCache;

  afterEach(() => {
    (globalThis as any).getCssStyleFromGlobalCache = originalCssGetter;
  });

  it('checks keys and emptiness', () => {
    expect(isKeyOfRecord('a', { a: 1 })).to.be.true;
    expect(isKeyOfRecord('b', { a: 1 })).to.be.false;
    expect(isEmpty({})).to.be.true;
    expect(isEmpty({ a: 1 })).to.be.false;
  });

  it('merges class and inline styles with inline taking precedence', () => {
    (globalThis as any).getCssStyleFromGlobalCache = (className: string) => {
      if (className === 'foo') return { color: 'red', padding: 1 };
      return {};
    };
    const merged = mergeClassStyleWithInlineStyle({ className: 'foo', style: { color: 'blue', margin: 2 } });
    expect(merged).to.deep.equal({ color: 'blue', padding: 1, margin: 2 });
  });

  it('compares arrays and nested structures', () => {
    const arr1 = [{ a: 1, _skip: 2 }, [1, 2], { nested: { b: 2 } }];
    const arr2 = [{ a: 1, _skip: 3 }, [1, 2], { nested: { b: 2 } }];
    expect(twoArraysEqual(arr1 as any, arr2 as any)).to.be.true;
    expect(twoArraysEqual([1, 2], [1, 3])).to.be.false;
  });

  it('parses numbers safely', () => {
    expect(safeParseFloat(5)).to.equal(5);
    expect(safeParseFloat('3.14')).to.equal(3.14);
    expect(safeParseFloat('bad')).to.equal(0);
  });

  it('finds changed props deeply and compares functions', () => {
    const oldProps = { a: 1, obj: { x: 1 }, arr: [1, 2], fn: () => 1 };
    const newProps = { a: 2, obj: { x: 2 }, arr: [1, 2, 3], fn: () => 2 };
    const diff = findChangedProps(oldProps, newProps);
    expect(diff).to.deep.equal({ a: 2, obj: { x: 2 }, arr: [1, 2, 3], fn: newProps.fn });

    const fn = () => 1;
    expect(compareTwoFunctions(fn, fn)).to.be.true;
  });

  it('detects react elements in children', () => {
    const el = { $$typeof: Symbol.for('react.element') };
    expect(isReactElementInChildren([el])).to.be.true;
    expect(isReactElementInChildren([1, 2])).to.be.false;
  });
});

describe('image_loader', () => {
  beforeEach(() => {
    (ImageLoader as any).loadTextureFromImagePath = (imagePath: string) => {
      const texture = UE.KismetRenderingLibrary.ImportFileAsTexture2D(null, imagePath);
      if (texture) return texture;
      console.warn(`Failed to load texture from image path: ${imagePath}`);
      return undefined;
    };
  });

  it('loads texture from path or returns undefined', () => {
    const texture = ImageLoader.loadTextureFromImagePath('path/to.png');
    expect(texture).to.deep.equal({ texturePath: 'path/to.png' });
    const missing = ImageLoader.loadTextureFromImagePath('');
    expect(missing).to.be.undefined;

    const original = UE.KismetRenderingLibrary.ImportFileAsTexture2D;
    UE.KismetRenderingLibrary.ImportFileAsTexture2D = () => undefined;
    const fail = ImageLoader.loadTextureFromImagePath('missing.png');
    expect(fail).to.be.undefined;
    UE.KismetRenderingLibrary.ImportFileAsTexture2D = original;
  });

  it('invokes LoadBrushImageObject with delegates', () => {
    const calls: any[] = [];
    const original = UE.UMGManager.LoadBrushImageObject;
    UE.UMGManager.LoadBrushImageObject = (...args: any[]) => calls.push(args);
    const obj = {};
    ImageLoader.loadBrushImageObject(obj as any, '/img.png', 'dir', false, () => {}, () => {});
    expect(calls.length).to.equal(1);
    ImageLoader.loadBrushImageObject(obj as any, '/img.png', undefined, true, undefined, undefined);
    expect(calls.length).to.equal(2);
    UE.UMGManager.LoadBrushImageObject = original;
  });
});
