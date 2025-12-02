import { expect } from 'chai';
import {
  parseWidgetSelfAlignment,
  parseFlexHorizontalAlignmentActions,
  parseFlexVerticalAlignmentActions,
} from '../src/reactorUMG/parsers/alignment_parser';
import { parseBrush } from '../src/reactorUMG/parsers/brush_parser';
import {
  parseCursor,
  parseTransform,
  parseTransformPivot,
  parseTranslate,
  parseRotate,
  parseVisibility,
} from '../src/reactorUMG/parsers/common_props_parser';
import {
  parseBackgroundPosition,
  parseBackgroundImage,
  parseBackgroundColor,
  parseBackgroundRepeat,
  parseBackground,
  parseBackgroundProps,
} from '../src/reactorUMG/parsers/css_background_parser';
import { parseColor, parseToLinearColor } from '../src/reactorUMG/parsers/css_color_parser';
import {
  convertLengthUnitToSlateUnit,
  convertLUToSUWithUnitType,
  parseScale,
  parseAspectRatio,
} from '../src/reactorUMG/parsers/css_length_parser';
import {
  expandPaddingValues,
  convertToUEMargin,
  convertPadding,
  convertMargin,
  convertGap,
} from '../src/reactorUMG/parsers/css_margin_parser';
import {
  parseFontSize,
  parseTextAlign,
  parseFontFaceName,
  parseFontSkewAmount,
  parseFontFamily,
  parseOutline,
  parseFont,
  setupFontStyles,
  hasFontStyles,
} from '../src/reactorUMG/parsers/css_font_parser';
import { ImageLoader } from '../src/reactorUMG/misc/image_loader';
import * as UE from 'ue';

describe('parser modules', () => {
  describe('alignment_parser', () => {
    it('parses widget self alignment for row and column', () => {
      const resRow = parseWidgetSelfAlignment({
        flexDirection: 'row',
        alignSelf: 'center',
        justifySelf: 'stretch',
        padding: '4px 2px',
      });
      expect(resRow.vertical).to.equal(UE.EVerticalAlignment.VAlign_Center);
      expect(resRow.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Fill);
      expect(resRow.padding.Top).to.equal(4);
      expect(resRow.padding.Left).to.equal(2);

      const resCol = parseWidgetSelfAlignment({
        flexDirection: 'column',
        alignSelf: 'flex-end',
      });
      expect(resCol.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Right);
    });

    it('creates flex alignment actions for horizontal and vertical slots', () => {
      const hActions = parseFlexHorizontalAlignmentActions();
      const hSlot = new UE.HorizontalBoxSlot();
      hActions.justifySelf.center(hSlot);
      expect(hSlot.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Center);
      hActions.alignSelf.bottom(hSlot);
      expect(hSlot.vertical).to.equal(UE.EVerticalAlignment.VAlign_Bottom);
      hActions.spaceBetween(hSlot, 2);
      expect(hSlot.size?.Value).to.equal(2);
      expect(hSlot.size?.SizeRule).to.equal(UE.ESlateSizeRule.Fill);

      const vActions = parseFlexVerticalAlignmentActions();
      const vSlot = new UE.VerticalBoxSlot();
      vActions.justifySelf.center(vSlot);
      expect(vSlot.vertical).to.equal(UE.EVerticalAlignment.VAlign_Center);
      vActions.alignSelf.end(vSlot);
      expect(vSlot.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Right);
      vActions.spaceBetween(vSlot, 3);
      expect(vSlot.size?.Value).to.equal(3);
    });

    it('covers all justify/align mapping branches', () => {
      const h = parseFlexHorizontalAlignmentActions();
      const slot = new UE.HorizontalBoxSlot();
      h.justifySelf['flex-start'](slot);
      h.justifySelf['flex-end'](slot);
      h.alignSelf['flex-start'](slot);
      h.alignSelf['flex-end'](slot);
      h.alignSelf.start(slot);
      h.alignSelf.stretch(slot);

      const v = parseFlexVerticalAlignmentActions();
      const vSlot = new UE.VerticalBoxSlot();
      v.justifySelf['flex-start'](vSlot);
      v.justifySelf['flex-end'](vSlot);
      v.alignSelf.stretch(vSlot);
      v.alignSelf.start(vSlot);
      v.alignSelf.end(vSlot);
    });
  });

  describe('css_margin_parser', () => {
    it('expands padding values', () => {
      expect(expandPaddingValues([])).to.deep.equal([0, 0, 0, 0]);
      expect(expandPaddingValues([1])).to.deep.equal([1, 1, 1, 1]);
      expect(expandPaddingValues([1, 2])).to.deep.equal([1, 2, 1, 2]);
      expect(expandPaddingValues([1, 2, 3])).to.deep.equal([1, 2, 3, 2]);
    });

    it('converts padding/margin and applies overrides', () => {
      const m = convertToUEMargin({}, '1px 2px', undefined, '3px', undefined, '4px');
      expect(m.Left).to.equal(4);
      expect(m.Top).to.equal(1);
      expect(m.Right).to.equal(3);
      expect(m.Bottom).to.equal(1);

      const p = convertPadding({ padding: '5px 6px 7px 8px' });
      expect(p.Left).to.equal(8);
      expect(convertMargin({ margin: '2px' }).Top).to.equal(2);
    });

    it('converts gap values', () => {
      expect(convertGap('4px 8px', {}).X).to.equal(8);
      expect(convertGap(['2px', '6px'], {}).Y).to.equal(2);
      expect(convertGap(5, {}).X).to.equal(5);
    });
  });

  describe('css_length_parser', () => {
    it('converts various length units', () => {
      expect(convertLengthUnitToSlateUnit('10px', {})).to.equal(10);
      expect(convertLengthUnitToSlateUnit('50%', {}, 200)).to.equal(100);
      expect(convertLengthUnitToSlateUnit('2em', { fontSize: '10px' })).to.equal(20);
      expect(convertLengthUnitToSlateUnit('1.5rem', {})).to.equal(0);
      expect(convertLengthUnitToSlateUnit('10vh', {}, undefined, new UE.Vector2D(0, 100))).to.equal(10);
      expect(convertLengthUnitToSlateUnit('10vw', {}, undefined, new UE.Vector2D(200, 0))).to.equal(20);
      expect(convertLengthUnitToSlateUnit('thin', {})).to.equal(12);
      expect(convertLengthUnitToSlateUnit(15, {})).to.equal(15);
      expect(convertLengthUnitToSlateUnit('25%', {})).to.equal(0);
      expect(convertLengthUnitToSlateUnit('medium', {})).to.equal(16);
      expect(convertLengthUnitToSlateUnit('bad%', {})).to.equal(0);
      expect(convertLengthUnitToSlateUnit('5', {})).to.equal(5);
    });

    it('returns value and unit type for CSS units', () => {
      expect(convertLUToSUWithUnitType('12px')).to.deep.equal({ type: 'px', value: 12 });
      expect(convertLUToSUWithUnitType('2em', 10)).to.deep.equal({ type: 'px', value: 2 });
      expect(convertLUToSUWithUnitType('auto')).to.deep.equal({ type: 'auto', value: 0 });
      expect(convertLUToSUWithUnitType('thin')).to.deep.equal({ type: 'px', value: 12 });
      expect(convertLUToSUWithUnitType('medium')).to.deep.equal({ type: 'px', value: 16 });
      expect(convertLUToSUWithUnitType('thick')).to.deep.equal({ type: 'px', value: 20 });
      expect(convertLUToSUWithUnitType('3')).to.deep.equal({ type: 'px', value: 3 });
      expect(convertLUToSUWithUnitType('weird')).to.deep.equal({ type: 'fr', value: 1 });
    });

    it('parses scale and aspect ratio', () => {
      expect(parseScale('2 3').X).to.equal(2);
      expect(parseScale(1.5).Y).to.equal(1.5);
      expect(parseAspectRatio('16/9')).to.be.closeTo(16 / 9, 0.0001);
      expect(parseAspectRatio('0.5')).to.equal(0.5);
      expect(parseAspectRatio('invalid')).to.equal(1);
      expect(parseScale('')).to.deep.include({ X: 1, Y: 1 });
    });
  });

  describe('css_color_parser', () => {
    it('parses named, hex, rgb and hsl colors', () => {
      expect(parseColor('red')).to.deep.equal({ r: 255, g: 0, b: 0, a: 1 });
      expect(parseColor('#0f08')).to.deep.equal({ r: 0, g: 255, b: 0, a: 0.5333333333333333 });
      expect(parseColor('rgb(100% 0 0 / 50%)')).to.deep.equal({ r: 255, g: 0, b: 0, a: 0.5 });
      const hsl = parseColor('hsl(120, 100%, 25%)');
      expect(hsl.g).to.be.greaterThan(100);
    });

    it('converts to linear color mapping', () => {
      const lin = parseToLinearColor('#0000ff');
      expect(lin.b).to.equal(1);
      expect(lin.r).to.equal(0);
    });
  });

  describe('css_font_parser', () => {
    it('parses font properties and outline', () => {
      expect(parseFontSize('20px', {})).to.equal(20);
      expect(parseTextAlign('right')).to.equal(UE.ETextJustify.Right);
      expect(parseFontFaceName('italic', 'bold')).to.equal('Bold Italic');
      expect(parseFontSkewAmount('oblique 30deg')).to.be.closeTo(Math.PI / 6, 0.0001);
      expect(parseFontFamily(`"Roboto", 'Courier New', monospace`).slice(0, 2)).to.deep.equal(['Roboto', 'Courier New']);

      const outline = parseOutline('2px solid red', {});
      expect(outline.outlineWidth).to.equal(2);
      expect(outline.outlineStyle).to.equal('solid');
      expect(outline.outlineColor?.r).to.equal(1);

      const fontRes = parseFont({
        fontSize: '12px',
        color: 'blue',
        textAlign: 'center',
        letterSpacing: '2px',
        wordSpacing: '4px',
        fontFamily: 'Roboto, monospace',
        fontStyle: 'italic',
        fontWeight: 'bold',
        outline: '3px dashed #000',
        outlineColor: 'rgb(255 0 0 / 50%)',
        outlineWidth: '6px',
      });
      expect(fontRes?.fontFaceName).to.equal('Bold Italic');
      expect(fontRes?.outlineWidth).to.equal(6);
      expect(fontRes?.fontSkewAmount).to.be.at.least(0);
    });

    it('configures SlateFontInfo via setupFontStyles', () => {
      const fontInfo = new UE.SlateFontInfo();
      const outer = new UE.TextBlock();
      setupFontStyles(outer as any, fontInfo, {
        fontSize: 18,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontFamily: 'Roboto, monospace',
        letterSpacing: '3px',
        wordSpacing: '5px',
        outline: '1px solid #fff',
        outlineColor: '#000',
        outlineWidth: 2,
        whiteSpace: 'nowrap',
      });
      expect(fontInfo.Size).to.equal(18);
      expect(fontInfo.LetterSpacing).to.equal(5);
      expect(outer.AutoWrapText).to.be.false;
    });

    it('detects presence of font styles', () => {
      expect(hasFontStyles({ fontWeight: 'bold' })).to.be.true;
      expect(hasFontStyles({})).to.be.false;
    });
  });

  describe('css_background_parser', () => {
    it('parses background position variants', () => {
      const center = parseBackgroundPosition('center');
      expect(center.horizontal).to.equal(UE.EHorizontalAlignment.HAlign_Center);
      const two = parseBackgroundPosition('left 10px');
      expect(two.padding.Left).to.equal(0);
      const three = parseBackgroundPosition('top left 5px');
      expect(three.vertical).to.equal(UE.EVerticalAlignment.VAlign_Center);
      expect(three.padding.Left).to.equal(0);

      const numeric = parseBackgroundPosition('10px 20px');
      expect(numeric.padding.Left).to.equal(0);
      expect(numeric.padding.Top).to.equal(0);

      const four = parseBackgroundPosition('left 10px top 5px');
      expect(four.padding.Left).to.equal(10);
      expect(four.padding.Top).to.equal(5);

      const keywordPair = parseBackgroundPosition('right bottom');
      expect(keywordPair.horizontal).to.be.a('number');
      expect(keywordPair.vertical).to.be.a('number');

      const keywordNumber = parseBackgroundPosition('right 20px');
      expect(keywordNumber.horizontal).to.be.a('number');
      const numberKeyword = parseBackgroundPosition('20% bottom');
      expect(numberKeyword.vertical).to.be.a('number');
    });

    it('parses background image and repeat/size', () => {
      let loadedPath: string | undefined;
      (ImageLoader as any).loadTextureFromImagePath = (path: string) => {
        loadedPath = path;
        return { texturePath: path };
      };
      const brush = parseBackgroundImage('url("/foo.png")', '20 30');
      expect(loadedPath).to.equal('/foo.png');
      expect(brush?.ResourceObject).to.deep.equal({ texturePath: '/foo.png' });
      parseBackgroundRepeat('repeat-x', brush!);
      expect(brush?.Tiling).to.equal(UE.ESlateBrushTileType.Horizontal);

      const repeatAll = parseBackgroundRepeat('repeat', new UE.SlateBrush());
      expect(repeatAll.Tiling).to.equal(UE.ESlateBrushTileType.Both);
      const repeatY = parseBackgroundRepeat('repeat-y', new UE.SlateBrush());
      expect(repeatY.Tiling).to.equal(UE.ESlateBrushTileType.Vertical);

      (ImageLoader as any).loadTextureFromImagePath = () => undefined;
      expect(parseBackgroundImage('file.txt', '')).to.equal(null);
      expect(parseBackgroundImage('in:valid.png', '')).to.equal(null);
    });

    it('parses color and composed background props', () => {
      const color = parseBackgroundColor('rgba(10, 20, 30, 0.4)');
      expect(color.R).to.be.greaterThan(0);

      const result = parseBackground('url("/x.jpg") no-repeat center');
      expect(result.image).to.exist;
      expect(result.position).to.be.undefined;

      const props = parseBackgroundProps({
        background: 'red',
        backgroundImage: 'url("/y.png")',
        backgroundRepeat: 'repeat',
      });
      expect(props.color).to.exist;
      expect(props.image).to.exist;
    });

    it('parses background size keywords', () => {
      const cover = parseBackgroundImage('url("/cover.png")', 'cover');
      expect(cover?.Tiling).to.equal(UE.ESlateBrushTileType.NoTile);
      const contain = parseBackgroundImage('url("/contain.png")', 'contain');
      expect(contain?.Tiling).to.equal(UE.ESlateBrushTileType.Both);
    });
  });

  describe('brush_parser', () => {
    it('parses brush draw types, tiling, padding, margin and outline', () => {
      (ImageLoader as any).loadTextureFromImagePath = () => ({ texturePath: 'tex.png' });
      const brush = parseBrush({
        color: '#ff0000',
        drawType: 'border',
        tiling: 'repeat-y',
        padding: '1px 2px',
        margin: '3px',
        image: 'tex.png',
        imageSize: { x: 10, y: 12 },
        outline: { cornerRadio: { top: 1, bottom: 2, left: 3, right: 4 }, outlineColor: 'blue', width: 5, type: 'fix-radius' },
      } as any);

      expect(brush.DrawAs).to.equal(UE.ESlateBrushDrawType.Border);
      expect(brush.Tiling).to.equal(UE.ESlateBrushTileType.Vertical);
      expect(brush.Margin?.Left).to.equal(3);
      expect((brush.OutlineSettings as any).Width).to.equal(5);
      expect((brush.TintColor as any).SpecifiedColor.R).to.equal(1);

      const fallback = parseBrush({ tiling: 'unknown', drawType: 'unknown' } as any);
      expect(fallback.DrawAs).to.equal(UE.ESlateBrushDrawType.Image);
      expect(fallback.Tiling).to.equal(UE.ESlateBrushTileType.NoTile);

      const rounded = parseBrush({ drawType: 'rounded-box', tiling: 'no-repeat' } as any);
      expect(rounded.DrawAs).to.equal(UE.ESlateBrushDrawType.RoundedBox);
      expect(rounded.Tiling).to.equal(UE.ESlateBrushTileType.NoTile);

      const outlineType = parseBrush({ outline: { type: 'half-height-radius', outlineColor: '#000' } } as any);
      expect((outlineType.OutlineSettings as any).RoundingType).to.equal(UE.ESlateBrushRoundingType.HalfHeightRadius);

      const box = parseBrush({ drawType: 'box' } as any);
      expect(box.DrawAs).to.equal(UE.ESlateBrushDrawType.Box);
    });
  });

  describe('common_props_parser', () => {
    it('parses cursor, translate/rotate/transform and visibility', () => {
      expect(parseCursor('pointer')).to.equal(UE.EMouseCursor.Hand);

      const transform = parseTransform('translate(10px, 5px) scale(2) rotate(90deg)');
      expect(transform?.Translation.X).to.equal(10);
      expect(transform?.Scale.X).to.equal(2);
      expect(transform?.Angle).to.equal(90);

      const pivot = parseTransformPivot('left top');
      expect(pivot?.X).to.equal(0);
      expect(pivot?.Y).to.equal(0);

      const translate = parseTranslate('5px 6px');
      expect(translate.Translation.Y).to.equal(6);

      const rotate = parseRotate('180deg');
      expect(rotate.Angle).to.equal(180);

      expect(parseVisibility('hidden')).to.equal(UE.ESlateVisibility.Hidden);
      expect(parseVisibility('visible', 'self-children-invisible')).to.equal(UE.ESlateVisibility.Visible);
    });

    it('covers additional transform and visibility branches', () => {
      const pivotPercent = parseTransformPivot('50% 25%');
      expect(pivotPercent?.X).to.equal(0.5);
      expect(pivotPercent?.Y).to.equal(0.25);

      expect(parseTranslate(undefined as any).Translation.X).to.equal(0);
      expect(parseRotate('bad').Angle).to.equal(0);
      expect(parseVisibility('collapse')).to.equal(UE.ESlateVisibility.Collapsed);
      expect(parseVisibility('visible', 'self-invisible')).to.equal(UE.ESlateVisibility.Visible);

      const complex = parseTransform('matrix(1,2,3,4,5,6) skew(10deg 5deg)');
      expect(complex?.Shear.X).to.not.equal(undefined);

      const pivotSingle = parseTransformPivot('25%');
      expect(pivotSingle?.Y).to.equal(0.25);
      expect(parseRotate('1rad').Angle).to.be.closeTo(57.295, 0.01);

      const multi = parseTransform('translate3d(1px,2px,3px) scale3d(2,3,4) rotateZ(45deg) translateX(4px) translateY(5px) matrix3d(1,2,0,0,3,4,0,0,0,0,1,0,6,7,0,1)');
      expect(multi?.Translation.X).to.equal(6);
      expect(multi?.Translation.Y).to.equal(7);
      expect(multi?.Scale.X).to.equal(1);
      expect(multi?.Scale.Y).to.equal(4);
    });
  });
});
