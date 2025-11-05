/*
* Tencent is pleased to support the open source community by making Puerts available.
* Copyright (C) 2020 Tencent.  All rights reserved.
* Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
* This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
*/

var global = global || (function () { return this; }());
(function (global) {
    "use strict";
    let puerts = global.puerts = global.puerts || {};
    
    let sendRequestSync = puerts.sendRequestSync;

    function normalize(name) {
        if ('./' === name.substr(0,2)) {
            name = name.substr(2);
        }
        return name;
    }

    let evalScript = global.__tgjsEvalScript || function(script, debugPath) {
        return eval(script);
    }
    global.__tgjsEvalScript = undefined;
    
    let loadModule = global.__tgjsLoadModule;
    global.__tgjsLoadModule = undefined;
    
    let searchModule = global.__tgjsSearchModule;
    global.__tgjsSearchModule = undefined;
    
    let org_require = global.require;
    
    let findModule = global.__tgjsFindModule;
    global.__tgjsFindModule = undefined;

    let readImageAsTexture = global.__tgjsReadImageFileAsTexture2D;
    global.__tgjsReadImageFileAsTexture2D = undefined;

    let readFileContent = global.__tgjsReadFileContent;
    global.__tgjsReadFileContent = undefined;
    
    let tmpModuleStorage = [];

    // global style css data example: 
    // 
    // {
    //   "__selectors": {".btn": "uniquescope_.btn_<hashid>"}
    //   "uniquescope_.btn_<hashid>": {
    //     "base": { backgroundColor: "#09f", color: "#fff" },
    //     ":hover": { backgroundColor: "#07c" },
    //     "::before": { content: '"• "' }
    //   },
    //   "@media (max-width: 600px)": {
    //     "uniquescope_.btn_<hashid>": {
    //       "base": { fontSize: "14px" },
    //       ":hover": { backgroundColor: "#05a" }
    //     }
    //   }
    // }
    let GlobalStyleClassesCache = {};
    
    function addModule(m) {
        for (var i = 0; i < tmpModuleStorage.length; i++) {
            if (!tmpModuleStorage[i]) {
                tmpModuleStorage[i] = m;
                return i;
            }
        }
        return tmpModuleStorage.push(m) - 1;
    }

    function getCssStyleFromGlobalCache(className, pseudo = "base", mediaQuery = null) {
        if (!className) return undefined;
        
        if (className.startsWith("uniquescope_")) {
            // module css
            const res = getStyle(GlobalStyleClassesCache, className, pseudo, mediaQuery);
            if (res) return res;
        } else {
            // global
            if ('__selectors' in GlobalStyleClassesCache) {
                const classNameWithScope = GlobalStyleClassesCache['__selectors'][className];

                if (classNameWithScope) {
                    const res = getStyle(GlobalStyleClassesCache, classNameWithScope, pseudo, mediaQuery);
                    if (res) return res;
                }
            }
        }

        return undefined;
    }

    function registerStyleClass(className, content) {
        if (styleClassesCache[className]) {
            console.warn(`style class ${className} already registered, will override it`);
            return;
        }

        styleClassesCache[className] = content;
    }

    function parseCssStyle(filePath) {
        let cssContent = readFileContent(filePath);
        const parsedData = parseCSSInternal(cssContent, filePath);
        const isModuleCss = filePath.endsWith(".module.css");

        // 非module css下，合并'__selector'，用于全局检索，如果selector中存在同名，则会覆盖。
        let selectorsMap = parsedData['__selectors'];
        if (!isModuleCss) {
            if (!GlobalStyleClassesCache['__selectors']) {
                GlobalStyleClassesCache['__selectors'] = {};
            }

            Object.assign(GlobalStyleClassesCache['__selectors'], selectorsMap);
        } else {
            const moduleSelectors = {};
            for (const key in selectorsMap) {
                if (!Object.prototype.hasOwnProperty.call(selectorsMap, key)) continue;
                const scopedName = selectorsMap[key];
                if (!scopedName) continue;

                const trimmed = key.trim();
                if (!trimmed.startsWith(".")) continue;

                const className = trimmed.slice(1);
                if (!className) continue;
                const exportKey = toCamel(className);
                moduleSelectors[exportKey] = scopedName;
            }
            selectorsMap = moduleSelectors;
        }

        Object.assign(GlobalStyleClassesCache, parsedData['data']);

        return selectorsMap;
    }

    // extract the style class from the CSS file
    function extractStyleClassFromFile(filePath) {
        let cssContent = readFileContent(filePath);
        // Remove comments and extra white space
        cssContent = cssContent.replace(/\/\*[\s\S]*?\*\//g, '')
                         .replace(/\s+/g, ' ')
                         .trim();

        // Match each CSS rule block
        // fixme@Caleb196x: 无法支持带下划线的名称
        const ruleRegex = /\.([a-zA-Z0-9_-]+)\s*{([^}]*)}/g;
        let match;

        while ((match = ruleRegex.exec(cssContent)) !== null) {
            const className = match[1];
            let styleContent = match[2].trim();

            // Ensure the style content is surrounded by curly braces
            if (!styleContent.startsWith('{')) {
                styleContent = '{' + styleContent + '}';
            }

            // Store to cache
            registerStyleClass(className, styleContent);
        }

        // Handle @media queries
        const mediaQueryRegex = /@media\s+([^{]+)\s*{([^}]*(?:{[^}]*}[^}]*)*)}/g;
        let mediaMatch;
        
        while ((mediaMatch = mediaQueryRegex.exec(cssContent)) !== null) {
            const mediaCondition = mediaMatch[1].trim().replace(/\s+/g, '_');
            const mediaKey = `media__${mediaCondition}`;
            const mediaContent = mediaMatch[2].trim();
            
            // Process rules inside the media query
            const nestedRuleRegex = /\.([a-zA-Z0-9_-]+)\s*{([^}]*)}/g;
            let nestedMatch;
            
            // Create an object to hold all the class styles for this media query
            const mediaStyles = {};
            
            while ((nestedMatch = nestedRuleRegex.exec(mediaContent)) !== null) {
                const className = nestedMatch[1];
                let styleContent = nestedMatch[2].trim();
                
                // Ensure the style content is properly formatted
                if (!styleContent.startsWith('{')) {
                    styleContent = '{' + styleContent + '}';
                }
                
                mediaStyles[className] = styleContent;
            }
            
            // Register the media query with all its styles
            registerStyleClass(mediaKey, mediaStyles);
        }

        console.log(styleClassesCache);
    }
    
    function getModuleBySID(id) {
        return tmpModuleStorage[id];
    }

    let moduleCache = Object.create(null);
    let buildinModule = Object.create(null);
    function executeModule(fullPath, script, debugPath, sid, isESM, bytecode) {
        sid = (typeof sid == 'undefined') ? 0 : sid;
        let fullPathInJs = fullPath.replace(/\\/g, '\\\\');
        let fullDirInJs = (fullPath.indexOf('/') != -1) ? fullPath.substring(0, fullPath.lastIndexOf("/")) : fullPath.substring(0, fullPath.lastIndexOf("\\")).replace(/\\/g, '\\\\');
        let exports = {};
        let module = puerts.getModuleBySID(sid);
        module.exports = exports;
        let wrapped = evalScript(
            // Wrap the script in the same way NodeJS does it. It is important since IDEs (VSCode) will use this wrapper pattern
            // to enable stepping through original source in-place.
            (isESM || bytecode) ? script: "(function (exports, require, module, __filename, __dirname) { " + script + "\n});", 
            debugPath, isESM, fullPath, bytecode
        )
        if (isESM) return wrapped;
        wrapped(exports, puerts.genRequire(fullDirInJs), module, fullPathInJs, fullDirInJs)
        return module.exports;
    }
    
    function getESMMain(script) {
        let packageConfigure = JSON.parse(script);
        return (packageConfigure && packageConfigure.type === "module") ? packageConfigure.main : undefined;
    }
    
    function getSourceLengthFromBytecode(buf, isESM) {
        let sourceHash = (new Uint32Array(buf))[2];
        //console.log(`sourceHash:${sourceHash}`);
        const kModuleFlagMask = (1 << 31);
        const mask = isESM ? kModuleFlagMask : 0;

        // Remove the mask to get the original length
        const length = sourceHash & ~mask;

        return length;
    }
    
    let baseString
    function generateEmptyCode(length) {
        if (baseString === undefined) {
            baseString = " ".repeat(128*1024);
        }
        if (length <= baseString.length) {
            return baseString.slice(0, length);
        } else {
            const fullString = baseString.repeat(Math.floor(length / baseString.length));
            const remainingLength = length % baseString.length;
            return fullString.concat(baseString.slice(0, remainingLength));
        }
    }
    
    function genRequire(requiringDir, outerIsESM) {
        let localModuleCache = Object.create(null);
        function require(moduleName) {
            if (org_require) {
                try {
                    return org_require(moduleName);
                } catch (e) {}
            }
            moduleName = normalize(moduleName);
            let forceReload = false;
            if ((moduleName in localModuleCache)) {
                let m = localModuleCache[moduleName];
                if (m && !m.__forceReload) {
                    return localModuleCache[moduleName].exports;
                } else {
                    forceReload = true;
                }
            }
            if (moduleName in buildinModule) return buildinModule[moduleName];
            let nativeModule = findModule(moduleName);
            if (nativeModule) {
                buildinModule[moduleName] = nativeModule;
                return nativeModule;
            }
            let moduleInfo = searchModule(moduleName, requiringDir);
            if (!moduleInfo) {
                delete localModuleCache[moduleName];
                throw new Error(`can not find ${moduleName} in ${requiringDir}`);
            }
            
            let [fullPath, debugPath] = moduleInfo;
            if(debugPath.startsWith("Pak: ")){
                debugPath = fullPath
            }
            
            let key = fullPath;
            if ((key in moduleCache) && !forceReload) {
                const module = moduleCache[key];
                if (module && !module.__forceReload) {
                    localModuleCache[moduleName] = module;
                    return module.exports;
                }
            }

            let m = {"exports":{}};
            localModuleCache[moduleName] = m;
            moduleCache[key] = m;
            let sid = addModule(m);
            let isESM = outerIsESM === true || fullPath.endsWith(".mjs") || fullPath.endsWith(".mbc");
            if (fullPath.endsWith(".cjs") || fullPath.endsWith(".cbc")) isESM = false;
            
            const isPictureFile = fullPath.endsWith('.png') || fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg');
            const isCssFile = fullPath.endsWith('.css') || fullPath.endsWith('.scss');
            const isAnimFile = fullPath.endsWith('.atlas') || fullPath.endsWith('.skel') || fullPath.endsWith('.riv');
            
            let script = undefined;
            let bytecode = undefined;
            if (!isPictureFile && !isCssFile && !isAnimFile) {
                script = isESM ? undefined : loadModule(fullPath);
                bytecode = undefined;
            if (fullPath.endsWith(".mbc") || fullPath.endsWith(".cbc")) {
                bytecode = script;
                script = generateEmptyCode(getSourceLengthFromBytecode(bytecode));
            }
            } else {
                console.log("picture file, css file and anim file will not be loaded");
            }

            try {
                if (fullPath.endsWith(".json") && fullPath.endsWith("package.json")) {
                    let packageConfigure = JSON.parse(script);
                    
                    if (fullPath.endsWith("package.json")) {
                        isESM = packageConfigure.type === "module"
                        let url = packageConfigure.main || "index.js";
                        if (isESM) {
                            let packageExports = packageConfigure.exports && packageConfigure.exports["."];
                            if (packageExports)
                                url =
                                    (packageExports["default"] && packageExports["default"]["require"]) ||
                                    (packageExports["require"] && packageExports["require"]["default"]) ||
                                    packageExports["require"];                        
                            if (!url) {
                                throw new Error("can not require a esm in cjs module!");
                            }
                        }
                        let fullDirInJs = (fullPath.indexOf('/') != -1) ? fullPath.substring(0, fullPath.lastIndexOf("/")) : fullPath.substring(0, fullPath.lastIndexOf("\\")).replace(/\\/g, '\\\\');
                        let tmpRequire = genRequire(fullDirInJs, isESM);
                        let r = tmpRequire(url);
                        
                        m.exports = r;
                    } else {
                        m.exports = packageConfigure;
                    }
                } else if (isPictureFile) {
                    // support import image
                    // todo@Caleb196x: 导入性能优化x10
                    // todo@Caleb196x: 通过hash判断文件内容是否发生改变
                    // let texture = readImageAsTexture(fullPath); 
                    m.exports = {'default': fullPath};
                } else if (isCssFile) {
                    // support import css
                    const parsedRes = parseCssStyle(fullPath);
                    m.exports = {'default': parsedRes};
                } else if (isAnimFile) {
                    // support import spine
                    m.exports = {'default': fullPath};
                }
                else {
                    let r = executeModule(fullPath, script, debugPath, sid, isESM, bytecode);
                    if (isESM) {
                        m.exports = r;
                    }
                }
            } catch(e) {
                console.log("read file:  " + fullPath + " with exception " + e);
                localModuleCache[moduleName] = undefined;
                moduleCache[key] = undefined;
                throw e;
            } finally {
                tmpModuleStorage[sid] = undefined;
            }

            return m.exports;
        }

        return require;
    }
    
    function registerBuildinModule(name, module) {
        buildinModule[name] = module;
    }
    
    function forceReload(reloadModuleKey) {
        if (reloadModuleKey) {
            reloadModuleKey = normalize(reloadModuleKey);
        }
        let reloaded = false;
        for(var moduleKey in moduleCache) {
            if (!reloadModuleKey || (reloadModuleKey === moduleKey)) {
                const module = moduleCache[moduleKey];
                if (module) {
                    module.__forceReload = true;
                reloaded = true;
                if (reloadModuleKey) break;
                }
            }
        }
        if (!reloaded && reloadModuleKey) {
            console.warn(`can not reload the unloaded module: ${reloadModuleKey}!`);
        }
    }
    
    function getModuleByUrl(url) {
        if (url) {
            url = normalize(url);
            return moduleCache[url];
        }
    }
    
    /*  ================================================ */

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
        return { base: selector.trim(), pseudo: "base" };
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
    function parseCSSInternal(cssText, filePath='') {
        const css = stripComments(cssText);
        const root = {}; // 输出对象

        var scopeName = undefined;
        if (filePath) {
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
                var { base, pseudo } = splitBaseAndPseudo(sel);
                var baseWithoutScope = base;
                if (scopeName) {
                    base = `${scopeName}_${baseWithoutScope}`;
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
    function getStyle(map, selector, pseudo = "base", mediaQuery = null) {
        const scope = mediaQuery ? map[`@media ${mediaQuery}`] : map;
        if (!scope) return undefined;
        const node = scope[selector];
        if (!node) return undefined;
        if (pseudo !== "base") {
            if (node["base"] && node[pseudo]) {
                return cascadeStyles(node["base"], node[pseudo]);
            }
        } else {
            return node[pseudo];
        }
    }

    /**
     * 合并两个CSS属性对象，模拟层叠规则
     * @param {object} base - 基础样式
     * @param {object} override - 覆盖样式（如伪类样式）
     * @returns {object} 合并后的样式对象
     */
    function cascadeStyles(base, override) {
        const result = { ...base };

        for (const [key, value] of Object.entries(override)) {
            const baseVal = base[key];

            // 判断是否有 !important
            const overrideImportant = typeof value === 'string' && value.includes('!important');
            const baseImportant = typeof baseVal === 'string' && baseVal.includes('!important');

            // 规则：
            // 1. override有!important，则覆盖
            // 2. base有!important但override没有，则保持base
            // 3. 否则正常覆盖
            if (overrideImportant || !baseImportant) {
            result[key] = value;
            }
        }

        return result;
    }


    /**
     * 将 "../a/b/c/filename" -> "filename_<uniqueid>"
     * - 规格化路径中的 ".", ".."、多重斜杠与反斜杠
     * - uniqueid 为对规格化后的全路径做 FNV-1a(32-bit) 的 base36 字符串
     */
    function toScopedName(inputPath) {
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
    /* ================================================ */

    registerBuildinModule("puerts", puerts)

    puerts.genRequire = genRequire;
    
    puerts.getESMMain = getESMMain;
    
    puerts.__require = genRequire("");
    
    global.require = puerts.__require;
    
    puerts.getModuleBySID = getModuleBySID;
    
    puerts.registerBuildinModule = registerBuildinModule;

    puerts.loadModule = loadModule;
    
    puerts.forceReload = forceReload;
    
    puerts.getModuleByUrl = getModuleByUrl;
    
    puerts.generateEmptyCode = generateEmptyCode;

    global.getCssStyleFromGlobalCache = getCssStyleFromGlobalCache;
}(global));
