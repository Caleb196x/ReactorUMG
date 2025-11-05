import { safeParseFloat } from "../misc/utils";

type RGBA = { r: number; g: number; b: number; a: number };

// rgb到linear color的转换表
const RGBToLinearColor = [
  0.0,
	0.000303526983548838, 0.000607053967097675, 0.000910580950646512, 0.00121410793419535, 0.00151763491774419,
	0.00182116190129302, 0.00212468888484186, 0.0024282158683907, 0.00273174285193954, 0.00303526983548838,
	0.00334653564113713, 0.00367650719436314, 0.00402471688178252, 0.00439144189356217, 0.00477695332960869,
	0.005181516543916, 0.00560539145834456, 0.00604883284946662, 0.00651209061157708, 0.00699540999852809,
	0.00749903184667767, 0.00802319278093555, 0.0085681254056307, 0.00913405848170623, 0.00972121709156193,
	0.0103298227927056, 0.0109600937612386, 0.0116122449260844, 0.012286488094766, 0.0129830320714536,
	0.0137020827679224, 0.0144438433080002, 0.0152085141260192, 0.0159962930597398, 0.0168073754381669,
	0.0176419541646397, 0.0185002197955389, 0.0193823606149269, 0.0202885627054049, 0.0212190100154473,
	0.0221738844234532, 0.02315336579873, 0.0241576320596103, 0.0251868592288862, 0.0262412214867272,
	0.0273208912212394, 0.0284260390768075, 0.0295568340003534, 0.0307134432856324, 0.0318960326156814,
	0.0331047661035236, 0.0343398063312275, 0.0356013143874111, 0.0368894499032755, 0.0382043710872463,
	0.0395462347582974, 0.0409151963780232, 0.0423114100815264, 0.0437350287071788, 0.0451862038253117,
	0.0466650857658898, 0.0481718236452158, 0.049706565391714, 0.0512694577708345, 0.0528606464091205,
	0.0544802758174765, 0.0561284894136735, 0.0578054295441256, 0.0595112375049707, 0.0612460535624849,
	0.0630100169728596, 0.0648032660013696, 0.0666259379409563, 0.0684781691302512, 0.070360094971063,
	0.0722718499453493, 0.0742135676316953, 0.0761853807213167, 0.0781874210336082, 0.0802198195312533,
	0.0822827063349132, 0.0843762107375113, 0.0865004612181274, 0.0886555854555171, 0.0908417103412699,
	0.0930589619926197, 0.0953074657649191, 0.0975873462637915, 0.0998987273569704, 0.102241732185838,
	0.104616483176675, 0.107023102051626, 0.109461709839399, 0.1119324268857, 0.114435372863418,
	0.116970666782559, 0.119538426999953, 0.122138771228724, 0.124771816547542, 0.127437679409664,
	0.130136475651761, 0.132868320502552, 0.135633328591233, 0.138431613955729, 0.141263290050755,
	0.144128469755705, 0.147027265382362, 0.149959788682454, 0.152926150855031, 0.155926462553701,
	0.158960833893705, 0.162029374458845, 0.16513219330827, 0.168269398983119, 0.171441099513036,
	0.174647402422543, 0.17788841473729, 0.181164242990184, 0.184474993227387, 0.187820771014205,
	0.191201681440861, 0.194617829128147, 0.198069318232982, 0.201556252453853, 0.205078735036156,
	0.208636868777438, 0.212230756032542, 0.215860498718652, 0.219526198320249, 0.223227955893977,
	0.226965872073417, 0.23074004707378, 0.23455058069651, 0.238397572333811, 0.242281120973093,
	0.246201325201334, 0.250158283209375, 0.254152092796134, 0.258182851372752, 0.262250655966664,
	0.266355603225604, 0.270497789421545, 0.274677310454565, 0.278894261856656, 0.283148738795466,
	0.287440836077983, 0.291770648154158, 0.296138269120463, 0.300543792723403, 0.304987312362961,
	0.309468921095997, 0.313988711639584, 0.3185467763743, 0.323143207347467, 0.32777809627633,
	0.332451534551205, 0.337163613238559, 0.341914423084057, 0.346704054515559, 0.351532597646068,
	0.356400142276637, 0.361306777899234, 0.36625259369956, 0.371237678559833, 0.376262121061519,
	0.381326009488037, 0.386429431827418, 0.39157247577492, 0.396755228735618, 0.401977777826949,
	0.407240209881218, 0.41254261144808, 0.417885068796976, 0.423267667919539, 0.428690494531971,
	0.434153634077377, 0.439657171728079, 0.445201192387887, 0.450785780694349, 0.456411021020965,
	0.462076997479369, 0.467783793921492, 0.473531493941681, 0.479320180878805, 0.485149937818323,
	0.491020847594331, 0.496932992791578, 0.502886455747457, 0.50888131855397, 0.514917663059676,
	0.520995570871595, 0.527115123357109, 0.533276401645826, 0.539479486631421, 0.545724458973463,
	0.552011399099209, 0.558340387205378, 0.56471150325991, 0.571124827003694, 0.577580437952282,
	0.584078415397575, 0.590618838409497, 0.597201785837643, 0.603827336312907, 0.610495568249093,
	0.617206559844509, 0.623960389083534, 0.630757133738175, 0.637596871369601, 0.644479679329661,
	0.651405634762384, 0.658374814605461, 0.665387295591707, 0.672443154250516, 0.679542466909286,
	0.686685309694841, 0.693871758534824, 0.701101889159085, 0.708375777101046, 0.71569349769906,
	0.723055126097739, 0.730460737249286, 0.737910405914797, 0.745404206665559, 0.752942213884326,
	0.760524501766589, 0.768151144321824, 0.775822215374732, 0.783537788566466, 0.791297937355839,
	0.799102735020525, 0.806952254658248, 0.81484656918795, 0.822785751350956, 0.830769873712124,
	0.838799008660978, 0.846873228412837, 0.854992605009927, 0.863157210322481, 0.871367116049835,
	0.879622393721502, 0.887923114698241, 0.896269350173118, 0.904661171172551, 0.913098648557343,
	0.921581853023715, 0.930110855104312, 0.938685725169219, 0.947306533426946, 0.955973349925421,
	0.964686244552961, 0.973445287039244, 0.982250546956257, 0.991102093719252, 1.0] as const;

// 预定义颜色名称到 RGBA 的映射表（部分示例）
const namedColors: Record<string, RGBA> = {
  red: { r: 255, g: 0, b: 0, a: 1 },
  green: { r: 0, g: 128, b: 0, a: 1 },
  blue: { r: 0, g: 0, b: 255, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  silver: { r: 192, g: 192, b: 192, a: 1 },
  gray: { r: 128, g: 128, b: 128, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  maroon: { r: 128, g: 0, b: 0, a: 1 },
  purple: { r: 128, g: 0, b: 128, a: 1 },
  fuchsia: { r: 255, g: 0, b: 255, a: 1 },
  lime: { r: 0, g: 255, b: 0, a: 1 },
  olive: { r: 128, g: 128, b: 0, a: 1 },
  yellow: { r: 255, g: 255, b: 0, a: 1 },
  navy: { r: 0, g: 0, b: 128, a: 1 },
  teal: { r: 0, g: 128, b: 128, a: 1 },
  aqua: { r: 0, g: 255, b: 255, a: 1 },
  orange: { r: 255, g: 165, b: 0, a: 1 },
  aliceblue: { r: 240, g: 248, b: 255, a: 1 },
  antiquewhite: { r: 250, g: 235, b: 215, a: 1 },
  aquamarine: { r: 127, g: 255, b: 212, a: 1 },
  azure: { r: 240, g: 255, b: 255, a: 1 },
  beige: { r: 245, g: 245, b: 220, a: 1 },
  bisque: { r: 255, g: 228, b: 196, a: 1 },
  blanchedalmond: { r: 255, g: 235, b: 205, a: 1 },
  blueviolet: { r: 138, g: 43, b: 226, a: 1 },
  brown: { r: 165, g: 42, b: 42, a: 1 },
  burlywood: { r: 222, g: 184, b: 135, a: 1 },
  cadetblue: { r: 95, g: 158, b: 160, a: 1 },
  chartreuse: { r: 127, g: 255, b: 0, a: 1 },
  chocolate: { r: 210, g: 105, b: 30, a: 1 },
  coral: { r: 255, g: 127, b: 80, a: 1 },
  cornflowerblue: { r: 100, g: 149, b: 237, a: 1 },
  cornsilk: { r: 255, g: 248, b: 220, a: 1 },
  crimson: { r: 220, g: 20, b: 60, a: 1 },
  cyan: { r: 0, g: 255, b: 255, a: 1 },
  darkblue: { r: 0, g: 0, b: 139, a: 1 },
  darkcyan: { r: 0, g: 139, b: 139, a: 1 },
  darkgoldenrod: { r: 184, g: 134, b: 11, a: 1 },
  darkgray: { r: 169, g: 169, b: 169, a: 1 },
  darkgreen: { r: 0, g: 100, b: 0, a: 1 },
  darkgrey: { r: 169, g: 169, b: 169, a: 1 },
  darkkhaki: { r: 189, g: 183, b: 107, a: 1 },
  darkmagenta: { r: 139, g: 0, b: 139, a: 1 },
  darkolivegreen: { r: 85, g: 107, b: 47, a: 1 },
  darkorange: { r: 255, g: 140, b: 0, a: 1 },
  darkorchid: { r: 153, g: 50, b: 204, a: 1 },
  darkred: { r: 139, g: 0, b: 0, a: 1 },
  darksalmon: { r: 233, g: 150, b: 122, a: 1 },
  darkseagreen: { r: 143, g: 188, b: 143, a: 1 },
  darkslateblue: { r: 72, g: 61, b: 139, a: 1 },
  darkslategray: { r: 47, g: 79, b: 79, a: 1 },
  darkslategrey: { r: 47, g: 79, b: 79, a: 1 },
  darkturquoise: { r: 0, g: 206, b: 209, a: 1 },
  darkviolet: { r: 148, g: 0, b: 211, a: 1 },
  deeppink: { r: 255, g: 20, b: 147, a: 1 },
  deepskyblue: { r: 0, g: 191, b: 255, a: 1 },
  dimgray: { r: 105, g: 105, b: 105, a: 1 },
  dimgrey: { r: 105, g: 105, b: 105, a: 1 },
  dodgerblue: { r: 30, g: 144, b: 255, a: 1 },
  firebrick: { r: 178, g: 34, b: 34, a: 1 },
  floralwhite: { r: 255, g: 250, b: 240, a: 1 },
  forestgreen: { r: 34, g: 139, b: 34, a: 1 },
  gainsboro: { r: 220, g: 220, b: 220, a: 1 },
  ghostwhite: { r: 248, g: 248, b: 255, a: 1 },
  gold: { r: 255, g: 215, b: 0, a: 1 },
  goldenrod: { r: 218, g: 165, b: 32, a: 1 },
  greenyellow: { r: 173, g: 255, b: 47, a: 1 },
  grey: { r: 128, g: 128, b: 128, a: 1 },
  honeydew: { r: 240, g: 255, b: 240, a: 1 },
  hotpink: { r: 255, g: 105, b: 180, a: 1 },
  indianred: { r: 205, g: 92, b: 92, a: 1 },
  indigo: { r: 75, g: 0, b: 130, a: 1 },
  ivory: { r: 255, g: 255, b: 240, a: 1 },
  khaki: { r: 240, g: 230, b: 140, a: 1 },
  lavender: { r: 230, g: 230, b: 250, a: 1 },
  lavenderblush: { r: 255, g: 240, b: 245, a: 1 },
  lawngreen: { r: 124, g: 252, b: 0, a: 1 },
  lemonchiffon: { r: 255, g: 250, b: 205, a: 1 },
  lightblue: { r: 173, g: 216, b: 230, a: 1 },
  lightcoral: { r: 240, g: 128, b: 128, a: 1 },
  lightcyan: { r: 224, g: 255, b: 255, a: 1 },
  lightgoldenrodyellow: { r: 250, g: 250, b: 210, a: 1 },
  lightgray: { r: 211, g: 211, b: 211, a: 1 },
  lightgreen: { r: 144, g: 238, b: 144, a: 1 },
  lightgrey: { r: 211, g: 211, b: 211, a: 1 },
  lightpink: { r: 255, g: 182, b: 193, a: 1 },
  lightsalmon: { r: 255, g: 160, b: 122, a: 1 },
  lightseagreen: { r: 32, g: 178, b: 170, a: 1 },
  lightskyblue: { r: 135, g: 206, b: 250, a: 1 },
  lightslategray: { r: 119, g: 136, b: 153, a: 1 },
  lightslategrey: { r: 119, g: 136, b: 153, a: 1 },
  lightsteelblue: { r: 176, g: 196, b: 222, a: 1 },
  lightyellow: { r: 255, g: 255, b: 224, a: 1 },
  limegreen: { r: 50, g: 205, b: 50, a: 1 },
  linen: { r: 250, g: 240, b: 230, a: 1 },
  magenta: { r: 255, g: 0, b: 255, a: 1 },
  mediumaquamarine: { r: 102, g: 205, b: 170, a: 1 },
  mediumblue: { r: 0, g: 0, b: 205, a: 1 },
  mediumorchid: { r: 186, g: 85, b: 211, a: 1 },
  mediumpurple: { r: 147, g: 112, b: 219, a: 1 },
  mediumseagreen: { r: 60, g: 179, b: 113, a: 1 },
  mediumslateblue: { r: 123, g: 104, b: 238, a: 1 },
  mediumspringgreen: { r: 0, g: 250, b: 154, a: 1 },
  mediumturquoise: { r: 72, g: 209, b: 204, a: 1 },
  mediumvioletred: { r: 199, g: 21, b: 133, a: 1 },
  midnightblue: { r: 25, g: 25, b: 112, a: 1 },
  mintcream: { r: 245, g: 255, b: 250, a: 1 },
  mistyrose: { r: 255, g: 228, b: 225, a: 1 },
  moccasin: { r: 255, g: 228, b: 181, a: 1 },
  navajowhite: { r: 255, g: 222, b: 173, a: 1 },
  oldlace: { r: 253, g: 245, b: 230, a: 1 },
  olivedrab: { r: 107, g: 142, b: 35, a: 1 },
  orangered: { r: 255, g: 69, b: 0, a: 1 },
  orchid: { r: 218, g: 112, b: 214, a: 1 },
  palegoldenrod: { r: 238, g: 232, b: 170, a: 1 },
  palegreen: { r: 152, g: 251, b: 152, a: 1 },
  paleturquoise: { r: 175, g: 238, b: 238, a: 1 },
  palevioletred: { r: 219, g: 112, b: 147, a: 1 },
  papayawhip: { r: 255, g: 239, b: 213, a: 1 },
  peachpuff: { r: 255, g: 218, b: 185, a: 1 },
  peru: { r: 205, g: 133, b: 63, a: 1 },
  pink: { r: 255, g: 192, b: 203, a: 1 },
  plum: { r: 221, g: 160, b: 221, a: 1 },
  powderblue: { r: 176, g: 224, b: 230, a: 1 },
  rosybrown: { r: 188, g: 143, b: 143, a: 1 },
  royalblue: { r: 65, g: 105, b: 225, a: 1 },
  saddlebrown: { r: 139, g: 69, b: 19, a: 1 },
  salmon: { r: 250, g: 128, b: 114, a: 1 },
  sandybrown: { r: 244, g: 164, b: 96, a: 1 },
  seagreen: { r: 46, g: 139, b: 87, a: 1 },
  seashell: { r: 255, g: 245, b: 238, a: 1 },
  sienna: { r: 160, g: 82, b: 45, a: 1 },
  skyblue: { r: 135, g: 206, b: 235, a: 1 },
  slateblue: { r: 106, g: 90, b: 205, a: 1 },
  slategray: { r: 112, g: 128, b: 144, a: 1 },
  slategrey: { r: 112, g: 128, b: 144, a: 1 },
  snow: { r: 255, g: 250, b: 250, a: 1 },
  springgreen: { r: 0, g: 255, b: 127, a: 1 },
  steelblue: { r: 70, g: 130, b: 180, a: 1 },
  tan: { r: 210, g: 180, b: 140, a: 1 },
  thistle: { r: 216, g: 191, b: 216, a: 1 },
  tomato: { r: 255, g: 99, b: 71, a: 1 },
  turquoise: { r: 64, g: 224, b: 208, a: 1 },
  violet: { r: 238, g: 130, b: 238, a: 1 },
  wheat: { r: 245, g: 222, b: 179, a: 1 },
  whitesmoke: { r: 245, g: 245, b: 245, a: 1 },
  yellowgreen: { r: 154, g: 205, b: 50, a: 1 },
  darkorcid: { r: 153, g: 50, b: 204, a: 1 }
};

/**
 * 将 CSS 颜色值转换为标准化 RGBA 对象
 * @param color 支持所有 CSS 颜色格式的字符串
 * @returns 标准化 RGBA 对象
 */
export function parseColor(color: string): RGBA {
  if (!color) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const trimmed = color.trim().toLowerCase();

  // 1. 处理预定义颜色名称
  if (namedColors[trimmed]) {
    return { ...namedColors[trimmed] };
  }

  // 2. 处理十六进制格式 (#RGB, #RRGGBB, #RRGGBBAA)
  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }

  // 3. 处理 rgb/rgba 格式
  if (trimmed.startsWith('rgb')) {
    return parseRGBFunction(trimmed);
  }

  // 4. 处理 hsl/hsla 格式
  if (trimmed.startsWith('hsl')) {
    return parseHSLFunction(trimmed);
  }

  // 5. 处理特殊值
  if (trimmed === 'currentcolor') {
    console.warn('currentColor cannot be converted to static RGBA');
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  console.warn(`Invalid color format: ${color}`);
  return { r: 0, g: 0, b: 0, a: 1 };
}

export function parseToLinearColor(color : string): RGBA {
  const rgba = parseColor(color);
  return { r: RGBToLinearColor[rgba.r], g: RGBToLinearColor[rgba.g], b: RGBToLinearColor[rgba.b], a: rgba.a }
}

// 解析十六进制颜色 (#rgb, #rrggbb, #rrggbbaa)
function parseHex(hex: string): RGBA {
  if (!hex) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!match) {
    console.warn(`Invalid hex color: ${hex}`);
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  let digits = match[1];
  if (digits.length === 3 || digits.length === 4) {
    digits = digits.split('').map(c => c + c).join('');
  }

  const r = parseInt(digits.slice(0, 2), 16);
  const g = parseInt(digits.slice(2, 4), 16);
  const b = parseInt(digits.slice(4, 6), 16);
  const a = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;

  return {
    r: Number.isNaN(r) ? 1 : r,
    g: Number.isNaN(g) ? 1 : g,
    b: Number.isNaN(b) ? 1 : b,
    a: Number.isNaN(a) ? 1 : a
  };
}

// 解析 rgb/rgba 函数
function parseRGBFunction(rgbStr: string): RGBA {
  const match = rgbStr.match(/rgba?\((.*)\)/i);
  if (!match) {
    throw new Error('Invalid RGB format');
  }

  const inner = match[1].trim();
  if (!inner) {
    throw new Error('Invalid RGB format');
  }

  const { channelTokens, alphaToken } = extractRgbArguments(inner);
  if (channelTokens.length !== 3) {
    throw new Error('Invalid RGB format');
  }

  return {
    r: parseRgbChannelValue(channelTokens[0]),
    g: parseRgbChannelValue(channelTokens[1]),
    b: parseRgbChannelValue(channelTokens[2]),
    a: alphaToken !== undefined ? parseAlphaToken(alphaToken) : 1
  };
}

function extractRgbArguments(inner: string): { channelTokens: string[]; alphaToken?: string } {
  const slashIndex = findTopLevelSlash(inner);
  let alphaToken: string | undefined;
  let channelSection = inner;

  if (slashIndex !== -1) {
    alphaToken = inner.slice(slashIndex + 1).trim();
    channelSection = inner.slice(0, slashIndex).trim();
  }

  const tokens = splitRgbChannelSection(channelSection);
  const channelTokens = tokens.slice(0, 3);

  if (!alphaToken && tokens.length > 3) {
    const extra = tokens.slice(3).join(' ').trim();
    if (extra.length) {
      alphaToken = extra;
    }
  }

  return { channelTokens, alphaToken: alphaToken && alphaToken.length ? alphaToken : undefined };
}

function splitRgbChannelSection(section: string): string[] {
  if (!section) {
    return [];
  }

  const result: string[] = [];
  let current = '';
  let depth = 0;
  const useComma = hasTopLevelComma(section);

  for (let i = 0; i < section.length; i++) {
    const ch = section[i];

    if (ch === '(') {
      depth++;
      current += ch;
      continue;
    }

    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }

    if (depth === 0) {
      if (useComma && ch === ',') {
        if (current.trim().length) {
          result.push(current.trim());
        }
        current = '';
        continue;
      }

      if (!useComma && /\s/.test(ch)) {
        if (current.trim().length) {
          result.push(current.trim());
          current = '';
        }
        continue;
      }
    }

    current += ch;
  }

  if (current.trim().length) {
    result.push(current.trim());
  }

  return result;
}

function hasTopLevelComma(input: string): boolean {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) return true;
  }
  return false;
}

function findTopLevelSlash(input: string): number {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === '/' && depth === 0) return i;
  }
  return -1;
}

function parseRgbChannelValue(raw: string): number {
  const { value, isPercentage } = parseRgbNumericToken(raw);
  if (isPercentage) {
    return Math.round(clamp(value, 0, 100) * 255 / 100);
  }
  return Math.round(clamp(value, 0, 255));
}

function parseAlphaToken(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed.length) {
    return 1;
  }
  const { value, isPercentage } = parseRgbNumericToken(trimmed);
  const normalized = isPercentage ? value / 100 : value;
  return clampAlpha(normalized);
}

function parseRgbNumericToken(raw: string): { value: number; isPercentage: boolean } {
  const trimmed = raw.trim();
  const isPercentage = trimmed.endsWith('%');
  const numeric = safeParseFloat(isPercentage ? trimmed.slice(0, -1) : trimmed);
  return { value: numeric, isPercentage };
}

// 解析 HSL/HSLA 函数
function parseHSLFunction(hslStr: string): RGBA {
  const match = hslStr.match(/hsla?\(([^)]+)\)/);
  if (!match) throw new Error('Invalid HSL format');

  const components = match[1].split(/[,/]\s*/).map(parseComponent);
  const [h, s, l, a = 1] = components;
  
  const rgb = hslToRgb(
    clampHue(h),
    clampPercentage(s),
    clampPercentage(l)
  );
  
  return {
    r: Math.round(rgb[0] * 255),
    g: Math.round(rgb[1] * 255),
    b: Math.round(rgb[2] * 255),
    a: clampAlpha(a)
  };
}

// HSL 到 RGB 的转换算法
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;
  
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return [
    (r + m),
    (g + m),
    (b + m)
  ];
}

// 辅助函数
const parseComponent = (s: string) => safeParseFloat(s.replace('%', ''));
const clamp = (num: number, min: number, max: number) => Math.min(max, Math.max(min, num));
const clampHue = (h: number) => ((h % 360) + 360) % 360;
const clampPercentage = (n: number) => clamp(n / 100, 0, 1);
const clampAlpha = (a: number) => clamp(a, 0, 1);
