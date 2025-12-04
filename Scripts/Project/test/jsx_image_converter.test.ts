import { expect } from 'chai';
import { ImageConverter } from '../src/reactorUMG/jsx/img';
import { ImageLoader } from '../src/reactorUMG/misc/image_loader';
import * as UE from 'ue';
import { RGBToLinearColor } from '../src/reactorUMG/parsers/css_color_parser';

describe('ImageConverter', () => {
  const originalLoader = ImageLoader.loadBrushImageObject;

  afterEach(() => {
    ImageLoader.loadBrushImageObject = originalLoader;
  });

  it('builds a clickable image with sizing, tint, and objectFit wrapping like a React <img>', () => {
    const loadCalls: any[] = [];
    let clicked = false;
    ImageLoader.loadBrushImageObject = (image: any, src: string, dir: string, _sync: boolean, onLoad?: Function) => {
      loadCalls.push({ image, src, dir });
      onLoad?.({ path: src });
    };

    const converter = new ImageConverter('img', {
      src: 'Textures/hero.png',
      width: '64',
      height: 32,
      color: '#336699',
      onClick: () => { clicked = true; },
      style: { objectFit: 'cover' },
    }, null);

    const widget = converter.createNativeWidget();
    expect(widget).to.be.instanceof(UE.ScaleBox);
    const scaleBox = widget as UE.ScaleBox;
    expect(loadCalls).to.have.length(1);
    expect(loadCalls[0].src).to.equal('Textures/hero.png');

    const image = scaleBox.children[0] as UE.Image;
    expect(image.Brush.ImageSize.X).to.equal(64);
    expect(image.Brush.ImageSize.Y).to.equal(32);
    expect(image.desiredSize?.X).to.equal(64);
    expect(image.ColorAndOpacity.R).to.equal(RGBToLinearColor[51]);
    expect(image.ColorAndOpacity.G).to.equal(RGBToLinearColor[102]);
    expect(image.ColorAndOpacity.B).to.equal(RGBToLinearColor[153]);

    image.triggerMouseDown();
    expect(clicked).to.be.true;
    expect(scaleBox.Stretch).to.equal(UE.EStretch.ScaleToFill);
  });

  it('updates src, dimensions, color, and objectFit on prop changes', () => {
    const reloaded: string[] = [];
    ImageLoader.loadBrushImageObject = (image: any, src: string, _dir: string, _sync: boolean, onLoad?: Function) => {
      reloaded.push(src);
      onLoad?.({ path: src });
    };

    const converter = new ImageConverter('img', {
      src: 'Textures/initial.png',
      width: 24,
      height: 24,
      style: { objectFit: 'contain' },
    }, null);
    const widget = converter.createNativeWidget();
    const image = (widget as UE.ScaleBox).children[0] as UE.Image;

    converter.update(widget as any, {}, { src: 'Textures/updated.png', width: '128', height: '64', color: '#00ff00', style: { objectFit: 'none' } });

    expect(reloaded).to.deep.equal(['Textures/initial.png', 'Textures/updated.png']);
    expect(image.Brush.ImageSize.X).to.equal(128);
    expect(image.Brush.ImageSize.Y).to.equal(64);
    expect(image.ColorAndOpacity.G).to.equal(RGBToLinearColor[255]);
    expect((widget as UE.ScaleBox).Stretch).to.equal(UE.EStretch.None);
  });
});
