"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UE = require("ue");
const puerts_1 = require("puerts");
const ts = require("typescript");
const tsi = require("../PuertsEditor/TypeScriptInternal");
const MAX_ERRORS = 5;

let bridgeCaller = puerts_1.argv.getByName("BridgeCaller");

function getFileOptionSystem(callObject) {
    const customSystem = {
        args: [],
        newLine: '\n',
        useCaseSensitiveFileNames: true,
        write,
        readFile,
        writeFile,
        resolvePath: tsi.resolvePath,
        fileExists,
        directoryExists: tsi.directoryExists,
        createDirectory: tsi.createDirectory,
        getExecutingFilePath,
        getCurrentDirectory,
        getDirectories,
        readDirectory,
        exit,
    };
    function fileExists(path) {
        let res = UE.FileSystemOperation.FileExists(path);
        return res;
    }
    function write(s) {
        console.log(s);
    }
    function readFile(path, encoding) {
        let data = puerts_1.$ref(undefined);
        const res = UE.FileSystemOperation.ReadFile(path, data);
        if (res) {
            return puerts_1.$unref(data);
        }
        else {
            console.warn("readFile: read file fail! path=" + path + ", stack:" + new Error().stack);
            return undefined;
        }
    }
    function writeFile(path, data, writeByteOrderMark) {
        throw new Error("forbiden!");
    }
    function readDirectory(path, extensions, excludes, includes, depth) {
        return tsi.matchFiles(path, extensions, excludes, includes, true, getCurrentDirectory(), depth, tsi.getAccessibleFileSystemEntries, tsi.realpath);
    }
    function exit(exitCode) {
        throw new Error("exit with code:" + exitCode);
    }
    function getExecutingFilePath() {
        return getCurrentDirectory() + "/node_modules/typescript/lib/tsc.js";
    }
    function getCurrentDirectory() {
        return callObject.GetTsProjectDir();
    }
    function getDirectories(path) {
        let result = [];
        let dirs = UE.FileSystemOperation.GetDirectories(path);
        for (var i = 0; i < dirs.Num(); i++) {
            result.push(dirs.Get(i));
        }
        return result;
    }
    return customSystem;
}

function logErrors(allDiagnostics, compileErrorReporter) {
    allDiagnostics.forEach(diagnostic => {
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (diagnostic.file) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            console.error(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            compileErrorReporter.CompileReportDelegate.Execute(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        }
        else {
            console.error(`  Error: ${message}`);
            compileErrorReporter.CompileReportDelegate.Execute(`  Error: ${message}`);
        }
    });
}

function readAndParseConfigFile(customSystem, configFilePath) {
    let readResult = ts.readConfigFile(configFilePath, customSystem.readFile);
    return ts.parseJsonConfigFileContent(readResult.config, {
        useCaseSensitiveFileNames: true,
        readDirectory: customSystem.readDirectory,
        fileExists: customSystem.fileExists,
        readFile: customSystem.readFile,
        trace: s => console.log(s)
    }, customSystem.getCurrentDirectory());
}

function compileInternal(service, sourceFilePath, program, compileErrorReporter) {
    if (!program) {
        let beginTime = new Date().getTime();
        program = getProgramFromService();
        console.log("incremental compile " + sourceFilePath + " using " + (new Date().getTime() - beginTime) + "ms");
    }
    let sourceFile = program.getSourceFile(sourceFilePath);
    if (sourceFile) {
        const diagnostics = [
            ...program.getSyntacticDiagnostics(sourceFile),
            ...program.getSemanticDiagnostics(sourceFile)
        ];
        if (diagnostics.length > 0) {
            logErrors(diagnostics, compileErrorReporter);
        } else {
            if (!sourceFile.isDeclarationFile) {
                let emitOutput = service.getEmitOutput(sourceFilePath);
                if (!emitOutput.emitSkipped) {
                    emitOutput.outputFiles.forEach(output => {
                        console.log(`compileInternal: write ${output.name} ...`);
                        UE.FileSystemOperation.WriteFile(output.name, output.text);
                    });
                }
            }
        }
    }
}

function convertTArrayToJSArray(array) {
    if (array.length === 0) {
        return [];
    }
    let jsArray = [];
    for (let i = 0; i < array.Num(); i++) {
        jsArray.push(array.Get(i));
    }
    
    return jsArray;
}

function compile(callObject) {
    if (!callObject) {
        console.error("callObject is null");
        return;
    }

    let compileErrorReporter = callObject.CompileErrorReporter;

    let customSystem = getFileOptionSystem(callObject);

    const configFilePath = tsi.combinePaths(callObject.GetTsProjectDir(), "tsconfig.json");
    let { filesFromConfig, options } = readAndParseConfigFile(customSystem, configFilePath);
    const scriptDir = callObject.GetTsScriptHomeFullDir();
    let fileNames = UE.FileSystemOperation.GetFilesRecursively(scriptDir);
    fileNames = convertTArrayToJSArray(fileNames);
    if (fileNames.length === 0) {
        console.warn("Not found any script file, give up compiling")
        compileErrorReporter.CompileReportDelegate.Execute("Not found any script file, give up compiling");
        return;
    }

    console.log("start compile..", JSON.stringify({ fileNames: fileNames, options: options }));
    const fileVersions = {};
    let beginTime = new Date().getTime();
    fileNames.forEach(fileName => {
        fileVersions[fileName] = { version: UE.FileSystemOperation.FileMD5Hash(fileName), processed: false, isBP: false };
    });
    console.log("calc md5 using " + (new Date().getTime() - beginTime) + "ms");

    const scriptSnapshotsCache = new Map();

    const CSS_MODULE_SUFFIX = ".module.css";
    const CSS_MODULE_DECLARATION_TEXT = "declare const classes: { readonly [key: string]: string };\nexport default classes;\n";
    const cssModuleSnapshot = ts.ScriptSnapshot.fromString(CSS_MODULE_DECLARATION_TEXT);
    const cssModuleVirtualFiles = new Map();

    const assetDeclarationMap = new Map([
        [".css", "declare const styles: { [className: string]: any };\nexport default styles;\n"],
        [".scss", "declare const styles: { [className: string]: any };\nexport default styles;\n"],
        [".png", "declare const resource: string;\nexport default resource;\n"],
        [".jpg", "declare const resource: string;\nexport default resource;\n"],
        [".jpeg", "declare const resource: string;\nexport default resource;\n"],
        [".bmp", "declare const resource: string;\nexport default resource;\n"],
        [".tga", "declare const resource: string;\nexport default resource;\n"],
        [".atlas", "declare const resource: string;\nexport default resource;\n"],
        [".skel", "declare const resource: string;\nexport default resource;\n"],
        [".riv", "declare const resource: string;\nexport default resource;\n"],
        [".json", "declare const resource: any;\nexport default resource;\n"]
    ]);
    const assetVirtualFiles = new Map();

    const moduleResolutionHost = {
        fileExists: path => !!getCssModuleVirtualInfo(path) || !!getAssetVirtualInfo(path) || fileExistsSafe(path),
        readFile: path => {
            const cssInfo = getCssModuleVirtualInfo(path);
            if (cssInfo) {
                return CSS_MODULE_DECLARATION_TEXT;
            }
            const assetInfo = getAssetVirtualInfo(path);
            if (assetInfo) {
                return assetInfo.declarationText;
            }
            return customSystem.readFile(path);
        },
        directoryExists: path => customSystem.directoryExists(path),
        getCurrentDirectory: () => customSystem.getCurrentDirectory(),
        getDirectories: path => customSystem.getDirectories(path),
        realpath: path => tsi.realpath(path),
        useCaseSensitiveFileNames: customSystem.useCaseSensitiveFileNames
    };

    function isCssModuleImport(moduleName) {
        return typeof moduleName === "string" && moduleName.endsWith(CSS_MODULE_SUFFIX);
    }

    function fileExistsSafe(path) {
        if (!path) {
            return false;
        }
        if (customSystem.fileExists(path)) {
            return true;
        }
        const normalized = tsi.normalizePath(path);
        if (normalized !== path && customSystem.fileExists(normalized)) {
            return true;
        }
        const winPath = normalized.replace(/\//g, "\\");
        if (winPath !== path && customSystem.fileExists(winPath)) {
            return true;
        }
        return false;
    }

    function ensureCssModuleVirtualFile(cssFilePath) {
        if (!cssFilePath) {
            return undefined;
        }
        if (!fileExistsSafe(cssFilePath)) {
            return undefined;
        }
        const normalized = tsi.normalizePath(cssFilePath);
        const virtualPath = normalized + ".d.ts";
        const version = String(UE.FileSystemOperation.FileMD5Hash(normalized));
        const cached = cssModuleVirtualFiles.get(virtualPath);
        if (!cached || cached.version !== version) {
            cssModuleVirtualFiles.set(virtualPath, {
                cssPath: normalized,
                version,
                snapshot: cssModuleSnapshot
            });
        }
        return virtualPath;
    }

    function getCssModuleVirtualInfo(fileName) {
        if (!fileName) {
            return undefined;
        }
        return cssModuleVirtualFiles.get(tsi.normalizePath(fileName));
    }

    function getAssetDeclarationText(assetPath) {
        if (!assetPath) {
            return undefined;
        }
        if (assetPath.endsWith(CSS_MODULE_SUFFIX)) {
            return undefined;
        }
        const lower = assetPath.toLowerCase();
        for (const [ext, decl] of assetDeclarationMap.entries()) {
            if (lower.endsWith(ext)) {
                return decl;
            }
        }
        return undefined;
    }

    function ensureAssetVirtualFile(assetFilePath) {
        if (!assetFilePath) {
            return undefined;
        }
        const declarationText = getAssetDeclarationText(assetFilePath);
        if (!declarationText) {
            return undefined;
        }
        if (!fileExistsSafe(assetFilePath)) {
            return undefined;
        }
        const normalized = tsi.normalizePath(assetFilePath);
        const virtualPath = normalized + ".d.ts";
        const version = String(UE.FileSystemOperation.FileMD5Hash(normalized));
        const cached = assetVirtualFiles.get(virtualPath);
        if (!cached || cached.version !== version) {
            assetVirtualFiles.set(virtualPath, {
                version,
                declarationText,
                snapshot: ts.ScriptSnapshot.fromString(declarationText)
            });
        }
        return virtualPath;
    }

    function getAssetVirtualInfo(fileName) {
        if (!fileName) {
            return undefined;
        }
        return assetVirtualFiles.get(tsi.normalizePath(fileName));
    }

    function findExistingModuleFilePath(moduleName, containingFile, resolutionResult) {
        if (typeof moduleName !== "string") {
            return undefined;
        }
        const fallbackSuffixes = [
            ".ts",
            ".tsx",
            ".d.ts",
            ".js",
            ".jsx",
            "/index.ts",
            "/index.tsx",
            "/index.d.ts",
            "/index.js",
            "/index.jsx",
            "\\index.ts",
            "\\index.tsx",
            "\\index.d.ts",
            "\\index.js",
            "\\index.jsx",
            "/package.json",
            "\\package.json"
        ];
        if (resolutionResult && resolutionResult.failedLookupLocations) {
            for (const location of resolutionResult.failedLookupLocations) {
                for (const suffix of fallbackSuffixes) {
                    if (location.endsWith(suffix)) {
                        const potential = location.slice(0, location.length - suffix.length);
                        if (fileExistsSafe(potential)) {
                            return potential;
                        }
                    }
                }
                if (fileExistsSafe(location)) {
                    return location;
                }
            }
        }
        if (moduleName.startsWith(".") || moduleName.startsWith("/")) {
            const baseDir = tsi.getDirectoryPath(containingFile);
            const normalized = tsi.resolvePath(baseDir, moduleName);
            if (fileExistsSafe(normalized)) {
                return normalized;
            }
        } else if (fileExistsSafe(moduleName)) {
            return tsi.normalizePath(moduleName);
        }
        return undefined;
    }

    function resolveModuleNameForHost(moduleName, containingFile, redirectedReference, optionsOverride) {
        if (typeof moduleName !== "string") {
            return undefined;
        }
        const compilerOptions = optionsOverride || options;
        const resolutionResult = ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost, undefined, redirectedReference);
        if (resolutionResult && resolutionResult.resolvedModule) {
            return resolutionResult.resolvedModule;
        }
        const candidate = findExistingModuleFilePath(moduleName, containingFile, resolutionResult);
        if (isCssModuleImport(moduleName)) {
            const virtualFile = ensureCssModuleVirtualFile(candidate);
            if (virtualFile) {
                return {
                    resolvedFileName: virtualFile,
                    extension: ts.Extension.Dts,
                    isExternalLibraryImport: false
                };
            }
            return undefined;
        }
        const assetVirtualFile = ensureAssetVirtualFile(candidate);
        if (!assetVirtualFile) {
            return undefined;
        }
        return {
            resolvedFileName: assetVirtualFile,
            extension: ts.Extension.Dts,
            isExternalLibraryImport: false
        };
    }

    function getDefaultLibLocation() {
        return tsi.getDirectoryPath(tsi.normalizePath(customSystem.getExecutingFilePath()));
    }

    const servicesHost = {
        getScriptFileNames: () => fileNames,
        getScriptVersion: fileName => {
            const cssInfo = getCssModuleVirtualInfo(fileName);
            if (cssInfo) {
                return cssInfo.version;
            }
            const assetInfo = getAssetVirtualInfo(fileName);
            if (assetInfo) {
                return assetInfo.version;
            }
            if (fileName in fileVersions) {
                return fileVersions[fileName] && fileVersions[fileName].version.toString();
            }
            const md5 = UE.FileSystemOperation.FileMD5Hash(fileName);
            fileVersions[fileName] = { version: md5, processed: false };
            return md5;
        },
        getScriptSnapshot: fileName => {
            const cssInfo = getCssModuleVirtualInfo(fileName);
            if (cssInfo) {
                return cssInfo.snapshot;
            }
            const assetInfo = getAssetVirtualInfo(fileName);
            if (assetInfo) {
                return assetInfo.snapshot;
            }
            if (!customSystem.fileExists(fileName)) {
                compileErrorReporter.CompileReportDelegate.Execute(fileName + " file not existed.");
                console.error("getScriptSnapshot: file not existed! path=" + fileName);
                return undefined;
            }
            if (!(fileName in fileVersions)) {
                fileVersions[fileName] = { version: UE.FileSystemOperation.FileMD5Hash(fileName), processed: false };
            }
            if (!scriptSnapshotsCache.has(fileName)) {
                const sourceFile = customSystem.readFile(fileName);
                if (!sourceFile) {
                    compileErrorReporter.CompileReportDelegate.Execute("read file failed! path=" + fileName);
                    console.error("getScriptSnapshot: read file failed! path=" + fileName);
                    return undefined;
                }
                scriptSnapshotsCache.set(fileName, {
                    version: fileVersions[fileName].version,
                    scriptSnapshot: ts.ScriptSnapshot.fromString(sourceFile)
                });
            }
            let scriptSnapshotsInfo = scriptSnapshotsCache.get(fileName);
            if (scriptSnapshotsInfo.version != fileVersions[fileName].version) {
                const sourceFile = customSystem.readFile(fileName);
                if (!sourceFile) {
                    compileErrorReporter.CompileReportDelegate.Execute("read file failed! path=" + fileName);
                    console.error("getScriptSnapshot: read file failed! path=" + fileName);
                    return undefined;
                }
                scriptSnapshotsInfo.version = fileVersions[fileName].version;
                scriptSnapshotsInfo.scriptSnapshot = ts.ScriptSnapshot.fromString(sourceFile);
            }
            return scriptSnapshotsInfo.scriptSnapshot;
        },
        getCurrentDirectory: customSystem.getCurrentDirectory,
        getCompilationSettings: () => options,
        getDefaultLibFileName: options => tsi.combinePaths(getDefaultLibLocation(), ts.getDefaultLibFileName(options)),
        fileExists: fileName => !!getCssModuleVirtualInfo(fileName) || !!getAssetVirtualInfo(fileName) || fileExistsSafe(fileName),
        readFile: fileName => {
            const cssInfo = getCssModuleVirtualInfo(fileName);
            if (cssInfo) {
                return CSS_MODULE_DECLARATION_TEXT;
            }
            const assetInfo = getAssetVirtualInfo(fileName);
            if (assetInfo) {
                return assetInfo.declarationText;
            }
            return customSystem.readFile(fileName);
        },
        readDirectory: customSystem.readDirectory,
        directoryExists: customSystem.directoryExists,
        getDirectories: customSystem.getDirectories,
        resolveModuleNames: (moduleNames, containingFile, reusedNames, redirectedReference, optionsOverride) => {
            return moduleNames.map(moduleName => resolveModuleNameForHost(moduleName, containingFile, redirectedReference, optionsOverride));
        },
        resolveModuleNameLiterals: (moduleLiterals, containingFile, redirectedReference, optionsOverride) => {
            return moduleLiterals.map(lit => {
                const resolvedModule = resolveModuleNameForHost(lit.text, containingFile, redirectedReference, optionsOverride);
                return resolvedModule ? { resolvedModule } : undefined;
            });
        },
    }

    let service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    let getProgramErrorCount = 0;
    function getProgramFromService() {
        while (true) {
            try {
                return service.getProgram();
            }
            catch (e) {
                console.error(e);
                // Add a mechanism to exit after exceeding maximum error count
                if (!getProgramErrorCount) {
                    getProgramErrorCount = 1;
                } else {
                    getProgramErrorCount++;
                }
                
                // Exit after 5 consecutive errors
                if (getProgramErrorCount >= MAX_ERRORS) {
                    compileErrorReporter.CompileReportDelegate.Execute("Exceeded maximum error count (5). Exiting compilation process.");
                    console.error("Exceeded maximum error count (5). Exiting compilation process.");
                    throw new Error("Maximum error count exceeded during compilation");
                }
            }
            //异常了重新创建Language Service，有可能不断失败,UE的文件读取偶尔会失败，失败后ts增量编译会不断的在tryReuseStructureFromOldProgram那断言失败
            service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

        }
    }

    beginTime = new Date().getTime();
    let program = getProgramFromService();
    console.log("full compile using " + (new Date().getTime() - beginTime) + "ms");
    fileNames.forEach(fileName => {
        if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) {
            compileInternal(service, fileName, program, compileErrorReporter);
        }
    });

    compileErrorReporter = undefined;
}

bridgeCaller.MainCaller.Bind(compile);
puerts_1.argv.remove("BridgeCaller", bridgeCaller);
