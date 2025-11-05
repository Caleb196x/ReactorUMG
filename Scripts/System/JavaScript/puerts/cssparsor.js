// ---- utils ----
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function toCamel(prop) {
  // background-color -> backgroundColor, -webkit-transition -> WebkitTransition
  return prop
    .trim()
    .replace(/^-([a-z])/, (_, c) => c.toUpperCase())
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function mergeInto(target, src) {
  for (const k in src) target[k] = src[k];
  return target;
}

// 在不进入 () 和 [] 的情况下，找到第一个 ':' 作为伪类/伪元素起点
function splitBaseAndPseudo(selector) {
  let paren = 0, bracket = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === "(") paren++;
    else if (ch === ")") paren = Math.max(0, paren - 1);
    else if (ch === "[") bracket++;
    else if (ch === "]") bracket = Math.max(0, bracket - 1);
    else if (ch === ":" && paren === 0 && bracket === 0) {
      const base = selector.slice(0, i).trim();
      const pseudo = selector.slice(i).trim();
      return { base, pseudo };
    }
  }
  return { base: selector.trim().replace('.', ''), pseudo: "base" };
}

function parseDeclarations(block) {
  const out = {};
  // 支持像 content: "a:b"; url(data:xx;yy) 这类；简化处理：按分号分，丢弃空项
  // 对于属性值里包含分号的极端情况，不在此简化范围
  const parts = block.split(";");
  for (const part of parts) {
    if (!part.trim()) continue;
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const prop = toCamel(part.slice(0, idx).trim());
    const value = part.slice(idx + 1).trim();
    if (prop) out[prop] = value;
  }
  return out;
}

// 把 "a, b, c" 的选择器列表拆开并清理
function splitSelectors(selText) {
  // 简单拆分：不在括号/中括号内按逗号切分
  const list = [];
  let buf = "", paren = 0, bracket = 0;
  for (let i = 0; i < selText.length; i++) {
    const ch = selText[i];
    if (ch === "(") paren++;
    else if (ch === ")") paren = Math.max(0, paren - 1);
    else if (ch === "[") bracket++;
    else if (ch === "]") bracket = Math.max(0, bracket - 1);

    if (ch === "," && paren === 0 && bracket === 0) {
      if (buf.trim()) list.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) list.push(buf.trim());
  return list;
}

// ---- 核心：CSS 块级解析（支持 @media 嵌套） ----
export function parseCSS(cssText, filePath='') {
  const css = stripComments(cssText);
  const root = {}; // 输出对象

  var scopeName = undefined;
  if (!filePath) {
    scopeName = toScopedName(filePath);
  }
  
  // key: class name in css, value: class name with scope
  const selectorScopeMap = {};

  function parseBlock(text, intoObj) {
    let i = 0;
    while (i < text.length) {
      // 跳过空白
      while (i < text.length && /\s/.test(text[i])) i++;
      if (i >= text.length) break;

      // 读选择器/at-rule 头部，直到 '{'
      let headerStart = i;
      while (i < text.length && text[i] !== "{") i++;
      if (i >= text.length) break;
      const header = text.slice(headerStart, i).trim();
      i++; // 跳过 '{'

      // 读块体（支持嵌套）
      let depth = 1;
      let bodyStart = i;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") depth--;
        i++;
      }
      const body = text.slice(bodyStart, i - 1); // 去掉配对的 '}'

      // 处理当前规则
      if (/^@media\b/i.test(header)) {
        const mq = header.replace(/^@media\s*/i, "").trim();
        const mqKey = `@media ${mq}`;
        if (!intoObj[mqKey]) intoObj[mqKey] = {};
        parseBlock(body, intoObj[mqKey]); // 递归解析媒体内的规则
      } else {
        // 普通选择器列表
        const selectors = splitSelectors(header);
        const decls = parseDeclarations(body);

        for (const sel of selectors) {
          const { baseWithoutScope, pseudo } = splitBaseAndPseudo(sel);
          var base = baseWithoutScope;
          if (scopeName) {
            base = `${baseWithoutScope}_${scopeName}`;
            selectorScopeMap[baseWithoutScope] = base;
          }
          
          if (!base) continue;
          if (!intoObj[base]) intoObj[base] = {};
          if (!intoObj[base][pseudo]) {
            // base 需要是对象
            if (pseudo === "base" && typeof intoObj[base].base !== "object") {
              intoObj[base].base = {};
            } else if (pseudo !== "base" && typeof intoObj[base][pseudo] !== "object") {
              intoObj[base][pseudo] = {};
            }
          }
          if (pseudo === "base") {
            mergeInto(intoObj[base].base, decls);
          } else {
            mergeInto(intoObj[base][pseudo], decls);
          }
        }
      }
      // i 当前指向 '}' 之后，继续下一个规则
    }
  }

  parseBlock(css, root);
  return {"__selectors": selectorScopeMap, "data": root};
}

// ---- 便捷读取 API ----
export function getStyle(map, selector, pseudo = "base", mediaQuery = null) {
  const scope = mediaQuery ? map[`@media ${mediaQuery}`] : map;
  if (!scope) return undefined;
  const node = scope[selector];
  if (!node) return undefined;
  return node[pseudo];
}

/**
 * 将 "../a/b/c/filename" -> "filename_<uniqueid>"
 * - 规格化路径中的 ".", ".."、多重斜杠与反斜杠
 * - uniqueid 为对规格化后的全路径做 FNV-1a(32-bit) 的 base36 字符串
 */
export function toScopedName(inputPath) {
  const norm = normalizePath(inputPath);
  const base = getBaseNameNoExt(norm);
  const id = fnv1aBase36(norm); // 基于“规格化后的完整路径”生成稳定ID
  return `uniquescope_${base}_${id}`;
}

// ---- helpers ----
function normalizePath(p) {
  if (typeof p !== 'string') p = String(p ?? '');
  // 统一分隔符
  const parts = p.replace(/\\/g, '/').split('/');
  const stack = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      // 父级：有就弹出；没有就保留（相对路径前缀）
      if (stack.length && stack[stack.length - 1] !== '..') {
        stack.pop();
      } else {
        stack.push('..');
      }
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

function getBaseNameNoExt(p) {
  const segments = p.split('/');
  let last = segments[segments.length - 1] || '';
  // 去掉查询/哈希（防御性）
  last = last.split('#')[0].split('?')[0];
  // 去掉扩展名（只移除最后一个 . 之后的）
  const dot = last.lastIndexOf('.');
  if (dot > 0) last = last.slice(0, dot);
  return last || 'file';
}

// FNV-1a 32-bit -> base36
function fnv1aBase36(str) {
  let h = 0x811c9dc5; // offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // 乘以 FNV prime 16777619 (用移位加法避免大数)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  // 转成固定长度（可按需调 6~8 位）
  const s = h.toString(36);
  return s.padStart(7, '0').slice(0, 7); // 统一长度，方便对齐
}
