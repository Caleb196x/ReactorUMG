import { expect } from 'chai';
import Module from 'module';
import { createElementConverter, ElementConverter } from '../src/reactorUMG/converter';
import * as UE from 'ue';

class FakeConverter extends ElementConverter {
  constructor(type: string, props: any, outer: any) { super(type, props, outer); }
  createNativeWidget(): any { return {}; }
  update(): void {}
  appendChild(): void {}
  removeChild(): void {}
}

describe('converter', () => {
  it('applies common properties when creating and updating widgets', () => {
    const widget: any = {};
    const converter = new FakeConverter('button', {
      style: { cursor: 'pointer', opacity: '0.5', visibility: 'hidden', translate: '2px 3px' },
      toolTip: 'hello',
      disable: true,
      volatil: true,
      pixelSnapping: true,
    }, null);

    converter.createNativeWidget = () => widget as any;
    const created = converter.createWidget();
    expect(created.Cursor).to.equal(UE.EMouseCursor.Hand);
    expect(created.RenderOpacity).to.equal(0.5);
    expect(created.Visibility).to.equal(UE.ESlateVisibility.Hidden);
    expect(created.Translate.Translation.Y).to.equal(3);
    expect(created.ToolTipText).to.equal('hello');
    expect(created.bIsEnabled).to.be.false;
    expect(created.bIsVolatile).to.be.true;
    expect(created.PixelSnapping).to.equal(UE.EWidgetPixelSnapping.SnapToPixel);

    converter.updateWidget(widget as any, { style: { opacity: 0.1 } }, { style: { opacity: 0.9 } });
    expect(widget.RenderOpacity).to.equal(0.9);
  });

  it('creates proper converter implementations per element type', () => {
    const originalLoad = (Module as any)._load;
    class StubConv extends FakeConverter {}
    (Module as any)._load = function (request: string, parent: any, isMain: boolean) {
      if (request === './jsx/style') return { StyleTagConverter: StubConv };
      if (request === './container/container_converter') return { ContainerConverter: StubConv };
      if (request === './jsx/jsx_converter') return { JSXConverter: StubConv };
      if (request === './umg/umg_converter') return { UMGConverter: StubConv };
      return originalLoad.call(this, request, parent, isMain);
    };

    const ignored = createElementConverter('script', {}, null) as any;
    expect((ignored as any).ignore).to.be.true;
    const option = createElementConverter('option', {}, null) as any;
    expect(option.forceAppend).to.be.true;
    expect(createElementConverter('div', {}, null)).to.be.instanceOf(StubConv);
    expect(createElementConverter('button', {}, null)).to.be.instanceOf(StubConv);
    expect(createElementConverter('custom', {}, null)).to.be.instanceOf(StubConv);

    (Module as any)._load = originalLoad;
  });
});
