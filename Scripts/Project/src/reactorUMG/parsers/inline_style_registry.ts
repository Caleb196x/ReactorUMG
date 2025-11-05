type SelectorKind = 'class' | 'id' | 'type';

interface BucketEntry {
    sourceId: string;
    styles: Record<string, any>;
}

interface SourceEntry {
    bucketKey: string;
    styles: Record<string, any>;
}

interface ParsedRule {
    kind: SelectorKind;
    key: string;
    pseudo: string;
    styles: Record<string, any>;
}

const inlineStyleBuckets = new Map<string, BucketEntry[]>();
const sourceEntries = new Map<string, SourceEntry[]>();

function buildBucketKey(kind: SelectorKind, key: string, pseudo: string): string {
    return `${kind}:${key}|${pseudo}`;
}

export function normalizePseudo(pseudo?: string): string {
    if (!pseudo || pseudo === 'base') {
        return 'base';
    }

    const trimmed = pseudo.trim();
    if (!trimmed) {
        return 'base';
    }

    return trimmed.startsWith(':') ? trimmed : `:${trimmed}`;
}

export function clearInlineStylesForSource(sourceId: string): void {
    const entries = sourceEntries.get(sourceId);
    if (!entries || entries.length === 0) {
        sourceEntries.delete(sourceId);
        return;
    }

    for (const { bucketKey, styles } of entries) {
        const bucket = inlineStyleBuckets.get(bucketKey);
        if (!bucket) continue;

        const nextBucket = bucket.filter(entry => entry.sourceId !== sourceId || entry.styles !== styles);
        if (nextBucket.length === 0) {
            inlineStyleBuckets.delete(bucketKey);
        } else {
            inlineStyleBuckets.set(bucketKey, nextBucket);
        }
    }

    sourceEntries.delete(sourceId);
}

export function registerInlineStyles(sourceId: string, rules: ParsedRule[]): void {
    clearInlineStylesForSource(sourceId);
    if (!rules || rules.length === 0) {
        return;
    }

    const recorded: SourceEntry[] = [];
    for (const rule of rules) {
        if (!rule.key || !rule.styles) continue;
        const pseudo = normalizePseudo(rule.pseudo);
        const bucketKey = buildBucketKey(rule.kind, rule.key, pseudo);
        let bucket = inlineStyleBuckets.get(bucketKey);
        if (!bucket) {
            bucket = [];
            inlineStyleBuckets.set(bucketKey, bucket);
        }

        const stylesCopy = { ...rule.styles };
        bucket.push({ sourceId, styles: stylesCopy });
        recorded.push({ bucketKey, styles: stylesCopy });
    }

    if (recorded.length > 0) {
        sourceEntries.set(sourceId, recorded);
    }
}

export function getInlineStyles(kind: SelectorKind, key: string, pseudo?: string): Record<string, any> | undefined {
    if (!key) {
        return undefined;
    }

    const normalizedPseudo = normalizePseudo(pseudo);
    const bucketKey = buildBucketKey(kind, key, normalizedPseudo);
    let bucket = inlineStyleBuckets.get(bucketKey);

    if (!bucket && normalizedPseudo.startsWith(':')) {
        const fallbackKey = buildBucketKey(kind, key, normalizedPseudo.slice(1));
        bucket = inlineStyleBuckets.get(fallbackKey);
    }

    if (!bucket || bucket.length === 0) {
        return undefined;
    }

    const result: Record<string, any> = {};
    for (const entry of bucket) {
        Object.assign(result, entry.styles);
    }

    return result;
}

export function parseInlineCss(cssText: string, declarationParser: (block: string) => Record<string, any>): ParsedRule[] {
    if (!cssText || typeof cssText !== 'string') {
        return [];
    }

    const sanitized = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    const regex = /([^{}]+)\{([^{}]*)\}/g;
    const rules: ParsedRule[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sanitized)) !== null) {
        const selectorGroup = match[1].trim();
        const declarationBlock = match[2].trim();
        if (!selectorGroup || !declarationBlock) continue;

        const declarationMap = declarationParser(declarationBlock);
        if (!declarationMap || Object.keys(declarationMap).length === 0) continue;

        const selectors = selectorGroup.split(',').map(sel => sel.trim()).filter(Boolean);
        for (const selector of selectors) {
            if (!selector) continue;
            const { kind, key, pseudo } = dissectSelector(selector);
            if (!key) continue;
            rules.push({
                kind,
                key,
                pseudo,
                styles: { ...declarationMap }
            });
        }
    }

    return rules;
}

function dissectSelector(selector: string): { kind: SelectorKind; key: string; pseudo: string } {
    let base = selector;
    let pseudo = 'base';

    const separatorIndex = findPseudoSeparator(selector);
    if (separatorIndex >= 0) {
        base = selector.slice(0, separatorIndex).trim();
        pseudo = selector.slice(separatorIndex).trim() || 'base';
    } else {
        base = selector.trim();
    }

    if (!base) {
        return { kind: 'type', key: '', pseudo };
    }

    if (base.startsWith('.')) {
        return { kind: 'class', key: base.slice(1).trim(), pseudo };
    }

    if (base.startsWith('#')) {
        return { kind: 'id', key: base.slice(1).trim(), pseudo };
    }

    return { kind: 'type', key: base.toLowerCase(), pseudo };
}

function findPseudoSeparator(selector: string): number {
    let paren = 0;
    let bracket = 0;
    for (let i = 0; i < selector.length; i++) {
        const ch = selector[i];
        if (ch === '(') {
            paren++;
        } else if (ch === ')') {
            paren = Math.max(0, paren - 1);
        } else if (ch === '[') {
            bracket++;
        } else if (ch === ']') {
            bracket = Math.max(0, bracket - 1);
        } else if (ch === ':' && paren === 0 && bracket === 0) {
            return i;
        }
    }
    return -1;
}

export function clearAllInlineStyles(): void {
    inlineStyleBuckets.clear();
    sourceEntries.clear();
}

export type { SelectorKind, ParsedRule };
