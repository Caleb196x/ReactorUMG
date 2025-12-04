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

class EventReply {}

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

class TextBlock {
  AutoWrapText = true;
  ColorAndOpacity: any = { SpecifiedColor: { R: 0, G: 0, B: 0, A: 0 } };
  Font: SlateFontInfo | undefined;
  Justification = 0;
  LineHeightPercentage = 0;
  TextTransformPolicy = 0;
  text = '';
  SetText = (v: string) => { this.text = v; };
  SetFont = (font: SlateFontInfo) => { this.Font = font; };
}

class SlateSound {}

class PanelSlot {}

class Widget {
  Slot: PanelSlot | null = null;
}

class PanelWidget extends Widget {
  children: any[] = [];
  AddChild = (child: any) => {
    this.children.push(child);
    return new PanelSlot();
  };
  RemoveChild = (child: any) => {
    this.children = this.children.filter(c => c !== child);
  };
  GetChildrenCount = () => this.children.length;
  GetChildAt = (index: number) => this.children[index];
  GetDesiredSize = () => new Vector2D(0, 0);
}

class ButtonSlot {
  horizontal?: number;
  vertical?: number;
  padding?: Margin;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetPadding = (value: Margin) => { this.padding = value; };
}

class SizeBoxSlot {
  horizontal?: number;
  vertical?: number;
  padding?: Margin;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetPadding = (value: Margin) => { this.padding = value; };
}

class ScaleBoxSlot {
  horizontal?: number;
  vertical?: number;
  padding?: Margin;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetPadding = (value: Margin) => { this.padding = value; };
}

class SizeBox extends PanelWidget {
  WidthOverride = 0;
  HeightOverride = 0;
  MinDesiredWidth = 0;
  MaxDesiredWidth = 0;
  MaxAspectRatio = 0;
  MaxDesiredHeight = 0;
  MinDesiredHeight = 0;
  MinAspectRatio = 0;
  /*
    *When specified, ignore the content's desired size and report the HeightOverride as the Box's desired height.
    */
  SetHeightOverride(InHeightOverride: number) : void { this.HeightOverride = InHeightOverride; }
  SetMaxAspectRatio(InMaxAspectRatio: number) : void { this.MaxAspectRatio = InMaxAspectRatio; }
  SetMinAspectRatio(InMinAspectRatio: number) : void { this.MinAspectRatio = InMinAspectRatio; }

  SetMaxDesiredHeight(InMaxDesiredHeight: number) : void { this.MaxDesiredHeight = InMaxDesiredHeight; }
  SetWidthOverride = (v: number) => { this.WidthOverride = v; };
  SetMinDesiredWidth = (v: number) => { this.MinDesiredWidth = v; };
  SetMaxDesiredWidth = (v: number) => { this.MaxDesiredWidth = v; };
  GetContent = () => this.children[0];
  AddChild = (child: any) => { this.children.push(child); return new SizeBoxSlot(); };
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
  private hasFocus = false;

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

  AddChild = (child: any) => {
    this.children.push(child);
    return new ButtonSlot();
  };

  SetClickMethod = (m: number) => { this._clickMethod = m; };
  SetTouchMethod = (m: number) => { this._touchMethod = m; };
  SetPressMethod = (m: number) => { this._pressMethod = m; };
  SetBackgroundColor = (c: LinearColor) => { this.BackgroundColor = c; };
  SetColorAndOpacity = (c: LinearColor) => { this.ColorAndOpacity = c; };
  SetIsEnabled = (enabled: boolean) => { this.bIsEnabled = enabled; };
  SetKeyboardFocus = () => { this.hasFocus = true; };
  HasKeyboardFocus = () => this.hasFocus;
  HasAnyUserFocus = () => this.hasFocus;
}

class CheckBox extends PanelWidget {
  WidgetStyle: any = { CheckBoxType: 0 };
  checked = false;
  enabled = true;
  OnCheckStateChanged = createEventArray();
  constructor(public outer: any) { super(); }
  SetIsChecked = (v: boolean) => { this.checked = v; };
  SetIsEnabled = (v: boolean) => { this.enabled = v; };
}

class Slider extends Widget {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  barColor?: any;
  handleColor?: any;
  OnValueChanged = createEventArray();
  constructor(public outer: any) {super();}
  SetValue = (v: number) => { this.value = v; };
  SetMinValue = (v: number) => { this.min = v; };
  SetMaxValue = (v: number) => { this.max = v; };
  SetStepSize = (v: number) => { this.step = v; };
  SetSliderBarColor = (v: any) => { this.barColor = v; };
  SetSliderHandleColor = (v: any) => { this.handleColor = v; };
}

class EditableText extends Widget  {
  text?: string;
  hint?: string;
  enabled = true;
  readOnly = false;
  password = false;
  Font: SlateFontInfo | undefined;
  WidgetStyle: any = { Font: undefined };
  OnTextChanged = createEventArray();
  constructor(public outer: any) {super();}
  SetHintText = (v: any) => { this.hint = v; };
  SetText = (v: any) => { this.text = v; };
  SetIsEnabled = (v: boolean) => { this.enabled = v; };
  SetIsReadOnly = (v: boolean) => { this.readOnly = v; };
  SetIsPassword = (v: boolean) => { this.password = v; };
  SetFont = (font: SlateFontInfo) => { this.Font = font; this.WidgetStyle.Font = font; };
}

class Image extends Widget {
  Brush: SlateBrush = new SlateBrush();
  ColorAndOpacity: LinearColor = new LinearColor(1, 1, 1, 1);
  resource?: any;
  desiredSize?: Vector2D;
  OnMouseButtonDownEvent: any = { Bind: (fn: any) => { this._mouseDown = fn; } };
  private _mouseDown?: Function;
  constructor(public outer: any) {super();}
  SetBrushResourceObject = (obj: any) => { this.resource = obj; };
  SetDesiredSizeOverride = (v: Vector2D) => { this.desiredSize = v; };
  triggerMouseDown = () => this._mouseDown?.();
}

class ScaleBox extends PanelWidget {
  Stretch: number = 0;
  UserSpecifiedScale = 0;
  constructor(public outer: any) { super(); }
  SetStretch = (v: number) => { this.Stretch = v; };
  SetUserSpecifiedScale = (v: number) => { this.UserSpecifiedScale = v; };
  AddChild = (child: any) => { this.children.push(child); return new ScaleBoxSlot(); };
}

class ProgressBar extends Widget {
  WidgetStyle: any = { BackgroundImage: new SlateBrush() };
  FillColorAndOpacity?: LinearColor;
  percent = 0;
  marquee = false;
  constructor(public outer: any) {super();}
  SetFillColorAndOpacity = (c: LinearColor) => { this.FillColorAndOpacity = c; };
  SetIsMarquee = (v: boolean) => { this.marquee = v; };
  SetPercent = (p: number) => { this.percent = p; };
}

const createOptionArray = () => {
  const arr: any[] = [];
  (arr as any).Add = (v: any) => arr.push(v);
  return arr as any;
};

class ComboBoxString extends Widget {
  WidgetStyle: any = { ComboButtonStyle: { ButtonStyle: { Normal: new SlateBrush(), Hovered: new SlateBrush(), Pressed: new SlateBrush(), Disabled: new SlateBrush() } } };
  DefaultOptions: any = createOptionArray();
  Options: string[] = [];
  SelectedOption: string | undefined;
  Font: SlateFontInfo | undefined;
  ForegroundColor: SlateColor | undefined;
  bIsEnabled = true;
  bIsFocusable = true;
  OnSelectionChanged = createEventArray();
  constructor(public outer: any) {super();}
  ClearOptions = () => { this.Options = []; this.DefaultOptions = createOptionArray(); };
  AddOption = (opt: string) => { this.Options.push(opt); };
  SetSelectedOption = (opt: string) => { this.SelectedOption = opt; };
}

class WrapBoxSlot {
  bFillEmptySpace = false;
  padding?: Margin;
  fillSpanWhenLessThan?: number;
  SetHorizontalAlignment = (_: number) => {};
  SetVerticalAlignment = (_: number) => {};
  SetPadding = (p: Margin) => { this.padding = p; };
  SetFillEmptySpace = (v: boolean) => { this.bFillEmptySpace = v; };
  SetFillSpanWhenLessThan = (v: number) => { this.fillSpanWhenLessThan = v; };
}

class WrapBox extends PanelWidget {
  Orientation = 0;
  padding?: Vector2D;
  horizontalAlignment?: number;
  constructor(public outer: any) { super(); }
  AddChildToWrapBox = (child: any) => {
    this.children.push(child);
    const slot = new WrapBoxSlot();
    (child as any).Slot = slot;
    (this as any).Slots = (this as any).Slots || [];
    (this as any).Slots.push(slot);
    return slot;
  };
  SetInnerSlotPadding = (v: Vector2D) => { this.padding = v; };
  SetHorizontalAlignment = (v: number) => { this.horizontalAlignment = v; };
}

class HorizontalBoxSlot {
  horizontal?: number;
  vertical?: number;
  size?: SlateChildSize;
  padding?: Margin;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetSize = (value: SlateChildSize) => { this.size = value; };
  SetPadding = (value: Margin) => { this.padding = value; };
}

class VerticalBoxSlot {
  horizontal?: number;
  vertical?: number;
  size?: SlateChildSize;
  padding?: Margin;
  SetHorizontalAlignment = (value: number) => { this.horizontal = value; };
  SetVerticalAlignment = (value: number) => { this.vertical = value; };
  SetSize = (value: SlateChildSize) => { this.size = value; };
  SetPadding = (value: Margin) => { this.padding = value; };
}

class HorizontalBox extends PanelWidget {
  FlowDirectionPreference: number = 0;
  constructor(public outer: any) { super(); }
  AddChildToHorizontalBox = (child: any) => {
    this.children.push(child);
    const slot = new HorizontalBoxSlot();
    (child as any).Slot = slot;
    (this as any).Slots = (this as any).Slots || [];
    (this as any).Slots.push(slot);
    return slot;
  };
}

class VerticalBox extends PanelWidget {
  constructor(public outer: any) { super(); }
  AddChildToVerticalBox = (child: any) => {
    this.children.push(child);
    const slot = new VerticalBoxSlot();
    (child as any).Slot = slot;
    (this as any).Slots = (this as any).Slots || [];
    (this as any).Slots.push(slot);
    return slot;
  };
}

class MultiLineEditableText extends Widget {
  text?: any;
  hint?: any;
  readOnly = false;
  enabled = true;
  Font: SlateFontInfo | undefined;
  WidgetStyle: any = { ColorAndOpacity: new SlateColor() };
  OnTextChanged = createEventArray();
  OnTextCommitted = createEventArray();
  constructor(public outer: any) {super();}
  SetText = (v: any) => { this.text = v; };
  SetHintText = (v: any) => { this.hint = v; };
  SetIsReadOnly = (v: boolean) => { this.readOnly = v; };
  SetIsEnabled = (v: boolean) => { this.enabled = v; };
  SetFont = (font: SlateFontInfo) => { this.Font = font; };
  GetFont = () => this.Font;
}

class Key {
  constructor(public name: string) {}
}

class Anchors {
  Minimum: Vector2D;
  Maximum: Vector2D;
  constructor(min: Vector2D, max: Vector2D) {
    this.Minimum = min;
    this.Maximum = max;
  }
}

class CanvasPanelSlot extends PanelSlot {
  Position: Vector2D = new Vector2D();
  Offsets: Margin = new Margin();
  Size: Vector2D = new Vector2D();
  Alignment: Vector2D = new Vector2D(0.5, 0.5);
  ZOrder = 0;
  AutoSize = false;
  Anchors?: Anchors;
  padding?: Margin;
  SetPosition = (v: Vector2D) => { this.Position = v; };
  SetOffsets = (v: Margin) => { this.Offsets = v; };
  SetSize = (v: Vector2D) => { this.Size = v; };
  SetAutoSize = (v: boolean) => { this.AutoSize = v; };
  SetAlignment = (v: Vector2D) => { this.Alignment = v; };
  SetAnchors = (a: Anchors) => { this.Anchors = a; };
  SetZOrder = (v: number) => { this.ZOrder = v; };
  SetPadding = (v: Margin) => { this.padding = v; };
}

class CanvasPanel extends PanelWidget {
  Slots: CanvasPanelSlot[] = [];
  constructor(public outer: any) { super(); }
  AddChildToCanvas = (child: any) => {
    this.children.push(child);
    const slot = new CanvasPanelSlot();
    this.Slots.push(slot);
    (child as any).Slot = slot;
    return slot;
  };
}

class GridSlot extends PanelSlot {
  Row = 0;
  Column = 0;
  RowSpan = 1;
  ColumnSpan = 1;
  HorizontalAlignment?: number;
  VerticalAlignment?: number;
  padding?: Margin;
  SetRow = (v: number) => { this.Row = v; };
  SetColumn = (v: number) => { this.Column = v; };
  SetRowSpan = (v: number) => { this.RowSpan = v; };
  SetColumnSpan = (v: number) => { this.ColumnSpan = v; };
  SetHorizontalAlignment = (v: number) => { console.log("GridSlot SetHorizontalAlignment called with value:", v); this.HorizontalAlignment = v; };
  SetVerticalAlignment = (v: number) => { console.log("GridSlot SetVerticalAlignment called with value:", v); this.VerticalAlignment = v; };
  SetPadding = (v: Margin) => { this.padding = v; };
}

class GridPanel extends PanelWidget {
  columnFills: number[] = [];
  rowFills: number[] = [];
  Slots: GridSlot[] = [];
  constructor(public outer: any) { super(); }
  AddChildToGrid = (child: any) => {
    this.children.push(child);
    const slot = new GridSlot();
    this.Slots.push(slot);
    (child as any).Slot = slot;
    return slot;
  };
  GetChildrenCount = () => this.children.length;
  GetChildAt = (i: number) => this.children[i];
  SetColumnFill = (i: number, v: number) => { this.columnFills[i] = v; };
  SetRowFill = (i: number, v: number) => { this.rowFills[i] = v; };
}

class OverlaySlot extends PanelSlot {
  HorizontalAlignment?: number;
  VerticalAlignment?: number;
  padding?: Margin;
  SetHorizontalAlignment = (v: number) => { this.HorizontalAlignment = v; };
  SetVerticalAlignment = (v: number) => { this.VerticalAlignment = v; };
  SetPadding = (v: Margin) => { this.padding = v; };
}

class Overlay extends PanelWidget {
  constructor(public outer: any) { super(); }
  AddChildToOverlay = (child: any) => { 
    this.children.push(child); 
    const slot = new OverlaySlot(); 
    (child as any).Slot = slot;
    (this as any).Slots = (this as any).Slots || [];
    (this as any).Slots.push(slot);
    return slot; 
  };
}

class UniformGridSlot extends PanelSlot {
  row = 0;
  column = 0;
  HorizontalAlignment?: number;
  VerticalAlignment?: number;
  padding?: Margin;
  SetRow = (v: number) => { this.row = v; };
  SetColumn = (v: number) => { this.column = v; };
  SetHorizontalAlignment = (v: number) => { this.HorizontalAlignment = v; };
  SetVerticalAlignment = (v: number) => { this.VerticalAlignment = v; };
  SetPadding = (v: Margin) => { this.padding = v; };
}

class UniformGridPanel extends PanelWidget {
  MinDesiredSlotWidth = 0;
  MinDesiredSlotHeight = 0;
  SlotPadding?: Margin;
  Slots: UniformGridSlot[] = [];
  constructor(public outer: any) { super(); }
  SetMinDesiredSlotWidth = (v: number) => { this.MinDesiredSlotWidth = v; };
  SetMinDesiredSlotHeight = (v: number) => { this.MinDesiredSlotHeight = v; };
  SetSlotPadding = (p: Margin) => { this.SlotPadding = p; };
  AddChildToUniformGrid = (child: any) => { 
    this.children.push(child); 
    const s = new UniformGridSlot(); 
    this.Slots.push(s); 
    (child as any).Slot = s;
    return s; 
  };
}

class BorderSlot extends PanelSlot {
  HorizontalAlignment?: number;
  VerticalAlignment?: number;
  padding?: Margin;
  SetHorizontalAlignment = (v: number) => { this.HorizontalAlignment = v; };
  SetVerticalAlignment = (v: number) => { this.VerticalAlignment = v; };
  SetPadding = (v: Margin) => { this.padding = v; };
}

class Border extends PanelWidget {
  Brush?: any;
  BrushColor?: LinearColor;
  ContentColorAndOpacity?: LinearColor;
  DesiredSizeScale?: any;
  HorizontalAlignment?: number;
  VerticalAlignment?: number;
  Padding?: Margin;
  constructor(public outer: any) { super(); }
  SetBrush = (b: any) => { this.Brush = b; };
  SetBrushColor = (c: any) => { this.BrushColor = c; };
  SetContentColorAndOpacity = (c: LinearColor) => { this.ContentColorAndOpacity = c; };
  SetDesiredSizeScale = (v: any) => { this.DesiredSizeScale = v; };
  SetHorizontalAlignment = (v: number) => { this.HorizontalAlignment = v; };
  SetVerticalAlignment = (v: number) => { this.VerticalAlignment = v; };
  SetPadding = (p: Margin) => { this.Padding = p; };
  AddChild = (child: any) => { this.children.push(child); return new BorderSlot(); };
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
const ESlateCheckBoxType = enumFactory({ CheckBox: 0 });
const EOrientation = enumFactory({ Orient_Horizontal: 0, Orient_Vertical: 1 });
const EFlowDirectionPreference = enumFactory({ LeftToRight: 0, RightToLeft: 1 });
const EStretch = enumFactory({
  ScaleToFit: 0,
  ScaleToFill: 1,
  Fill: 2,
  None: 3,
  UserSpecifiedWithClipping: 4,
});
const ESelectInfo = enumFactory({ OnKeyPress: 0 });
const ETextCommit = enumFactory({ Default: 0, OnUserMovedFocus: 1 });
const ETextTransformPolicy = enumFactory({ None: 0, ToUpper: 1, ToLower: 2 });
const EWidgetClipping = enumFactory({
  Inherit: 0,
  ClipToBounds: 1,
  ClipToBoundsWithoutIntersecting: 2,
  ClipToBoundsAlways: 3,
  OnDemand: 4,
});

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
  ButtonSlot,
  EditableText,
  CheckBox,
  SizeBox,
  SizeBoxSlot,
  Slider,
  Image,
  ScaleBox,
  ScaleBoxSlot,
  ProgressBar,
  ComboBoxString,
  WrapBox,
  WrapBoxSlot,
  HorizontalBox,
  VerticalBox,
  Anchors,
  CanvasPanel,
  CanvasPanelSlot,
  GridPanel,
  GridSlot,
  Overlay,
  OverlaySlot,
  UniformGridPanel,
  UniformGridSlot,
  Border,
  BorderSlot,
  Widget,
  MultiLineEditableText,
  Key,
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
  ESlateCheckBoxType,
  EOrientation,
  EFlowDirectionPreference,
  EStretch,
  ESelectInfo,
  ETextCommit,
  ETextTransformPolicy,
  EWidgetClipping,
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
    SynchronizeSlotProperties: () => {},
    GetWidgetScreenPixelSize: (_: any) => new Vector2D(10, 10),
    GetCurrentWorld: () => undefined,
  },
  KismetRenderingLibrary: {
    ImportFileAsTexture2D: (_: any, path: string) => (path ? { texturePath: path } : undefined),
  },
  GameplayStatics: {
    GetPlayerController: () => undefined,
  },
  EventReply,
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
