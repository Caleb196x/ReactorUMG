import Module from 'module';

const enumFactory = <T extends Record<string, number>>(values: T) => values;

class Vector2D {
  constructor(public X = 0, public Y = 0) {}
}

class Margin {
  constructor(public Left = 0, public Top = 0, public Right = 0, public Bottom = 0) {}
}

class SlateChildSize {
  constructor(public Value: number, public SizeRule: number) {}
}

class LinearColor {
  r: number;
  g: number;
  b: number;
  a: number;
  R: number;
  G: number;
  B: number;
  A: number;
  constructor(r = 0, g = 0, b = 0, a = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = a;
  }
}

class SlateColor {
  SpecifiedColor = { R: 0, G: 0, B: 0, A: 0 };
}

class SlateBrushOutlineSettings {
  CornerRadii = { X: 0, Y: 0, Z: 0, W: 0 };
  Color = { SpecifiedColor: { R: 0, G: 0, B: 0, A: 0 } };
  Width = 0;
  RoundingType = 0;
}

class SlateBrush {
  DrawAs = 0;
  Tiling = 0;
  ImageSize = { X: 0, Y: 0 };
  TintColor: SlateColor | null = null;
  Tint: any;
  Margin: Margin | undefined = undefined;
  OutlineSettings: SlateBrushOutlineSettings | null = null;
  ResourceObject: any = null;
}

class WidgetTransform {
  constructor(
    public Translation: Vector2D,
    public Scale: Vector2D,
    public Shear: Vector2D,
    public Angle: number
  ) {}
}

class DeprecateSlateVector2D {
  X = 0;
  Y = 0;
}

class SlateFontInfo {
  Size = 0;
  SkewAmount = 0;
  TypefaceFontName = '';
  bForceMonospaced = false;
  MonospacedWidth = 0;
  FontObject: any = null;
  LetterSpacing = 0;
  OutlineSettings = { OutlineSize: 0, OutlineColor: { R: 0, G: 0, B: 0, A: 0 } };
}

class HorizontalBoxSlot {
  horizontal?: number;
  vertical?: number;
  size?: SlateChildSize;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetSize = (value: SlateChildSize) => { this.size = value; };
}

class VerticalBoxSlot {
  horizontal?: number;
  vertical?: number;
  size?: SlateChildSize;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetSize = (value: SlateChildSize) => { this.size = value; };
}

class TextBlock {
  AutoWrapText = true;
}

class SlateSound {}

class PanelSlot {}

class PanelWidget {
  children: any[] = [];
  AddChild = (child: any) => {
    this.children.push(child);
    return new PanelSlot();
  };
  RemoveChild = (child: any) => {
    this.children = this.children.filter(c => c !== child);
  };
}

class Button extends PanelWidget {
  WidgetStyle: any;
  ColorAndOpacity: LinearColor | null = null;
  BackgroundColor: LinearColor | null = null;
  IsFocusable = true;
  bIsEnabled = true;
  _clickMethod?: number;
  _touchMethod?: number;
  _pressMethod?: number;
  OnClicked = createEventArray();
  OnPressed = createEventArray();
  OnReleased = createEventArray();
  OnHovered = createEventArray();
  OnUnhovered = createEventArray();

  constructor(public outer: any) {
    super();
    this.WidgetStyle = {
      Normal: new SlateBrush(),
      Hovered: new SlateBrush(),
      Pressed: new SlateBrush(),
      Disabled: new SlateBrush(),
      NormalPadding: undefined,
      PressedPadding: undefined,
    };
  }

  SetClickMethod = (m: number) => { this._clickMethod = m; };
  SetTouchMethod = (m: number) => { this._touchMethod = m; };
  SetPressMethod = (m: number) => { this._pressMethod = m; };
}

function createEventArray() {
  const arr: any[] = [];
  return Object.assign(arr, {
    Add: (fn: any) => { arr.push(fn); },
    Remove: (fn: any) => {
      const idx = arr.indexOf(fn);
      if (idx >= 0) arr.splice(idx, 1);
    },
  });
}

const EHorizontalAlignment = enumFactory({
  HAlign_Fill: 0,
  HAlign_Left: 1,
  HAlign_Right: 2,
  HAlign_Center: 3,
});

const EVerticalAlignment = enumFactory({
  VAlign_Fill: 0,
  VAlign_Top: 1,
  VAlign_Bottom: 2,
  VAlign_Center: 3,
});

const ESlateSizeRule = enumFactory({ Automatic: 0, Fill: 1 });

const ESlateBrushDrawType = enumFactory({
  NoDrawType: 0,
  Image: 1,
  Box: 2,
  Border: 3,
  RoundedBox: 4,
});

const ESlateBrushTileType = enumFactory({
  NoTile: 0,
  Horizontal: 1,
  Vertical: 2,
  Both: 3,
});

const ESlateBrushRoundingType = enumFactory({
  FixedRadius: 0,
  HalfHeightRadius: 1,
});

const ETextJustify = enumFactory({ Left: 0, Center: 1, Right: 2 });

const ESlateVisibility = enumFactory({
  Visible: 0,
  Hidden: 1,
  Collapsed: 2,
  SelfHitTestInvisible: 3,
  HitTestInvisible: 4,
});

const EMouseCursor = enumFactory({
  Default: 0,
  None: 1,
  TextEditBeam: 2,
  ResizeLeftRight: 3,
  ResizeUpDown: 4,
  ResizeSouthEast: 5,
  ResizeSouthWest: 6,
  Crosshairs: 7,
  Hand: 8,
  GrabHand: 9,
  GrabHandClosed: 10,
  SlashedCircle: 11,
  EyeDropper: 12,
});

const EWidgetPixelSnapping = enumFactory({ SnapToPixel: 0, Disabled: 1 });
const EButtonClickMethod = enumFactory({ DownAndUp: 0, MouseDown: 1, MouseUp: 2, PreciseClick: 3 });
const EButtonTouchMethod = enumFactory({ DownAndUp: 0, Down: 1, PreciseTap: 2 });
const EButtonPressMethod = enumFactory({ DownAndUp: 0, ButtonPress: 1, ButtonRelease: 2 });

const UEStub = {
  Vector2D,
  Margin,
  SlateChildSize,
  LinearColor,
  SlateBrush,
  SlateColor,
  SlateBrushOutlineSettings,
  WidgetTransform,
  DeprecateSlateVector2D,
  SlateFontInfo,
  HorizontalBoxSlot,
  VerticalBoxSlot,
  TextBlock,
  EHorizontalAlignment,
  EVerticalAlignment,
  ESlateSizeRule,
  ESlateBrushDrawType,
  ESlateBrushTileType,
  ESlateBrushRoundingType,
  ETextJustify,
  ESlateVisibility,
  EMouseCursor,
  EWidgetPixelSnapping,
  EButtonClickMethod,
  EButtonTouchMethod,
  EButtonPressMethod,
  PanelWidget,
  PanelSlot,
  Button,
  SlateSound,
  Object: class {},
  Texture2D: class {},
  BuiltinString: class {},
  NewArray: () => {
    const arr: any[] = [];
    (arr as any).Add = (v: any) => arr.push(v);
    return arr as any;
  },
  UMGManager: {
    FindFontFamily: () => ({ family: 'stub-font' }),
    LoadBrushImageObject: () => {},
    SynchronizeWidgetProperties: () => {},
  },
  KismetRenderingLibrary: {
    ImportFileAsTexture2D: (_: any, path: string) => (path ? { texturePath: path } : undefined),
  },
};

const puertsStub = {
  toDelegate: (_: any, fn: any) => fn,
  merge: (_target: any, src: any) => Object.assign(_target, src),
};

const ModuleLoad = (Module as any)._load as typeof Module._load;
(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  if (request === 'ue') {
    return UEStub;
  }
  if (request === 'puerts') {
    return puertsStub;
  }
  return ModuleLoad.call(this, request, parent, isMain);
};

// also expose globally if code accesses global UE
(globalThis as any).UE = UEStub;
(globalThis as any).getCssStyleFromGlobalCache = () => ({});
