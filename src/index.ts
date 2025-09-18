/// <reference lib="DOM" />

type ListenerType = 'link' | 'style';

interface CssVarsOptions {
    types?: ListenerType[];
    root?: HTMLElement | Document;
    wait?: number;
}

let variables: Record<string, string> = {};
let cssLinks: string[] = [];
let inlineStyles: { id: string; content: string }[] = [];
let observer: MutationObserver | null = null;
let currentRoot: HTMLElement | Document | null = null;
let worker: Worker | null = null;
let types: ListenerType[] = []
let root: HTMLElement | Document = document
let wait: number = 100

// debounce
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: number | undefined;
    return (...args: Parameters<T>) => {
        if (timeout !== undefined) clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}

// 扫描 CSS
function scanStyles() {
    if (types.includes('link')) {
        cssLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(
            (link) => link.href
        );
    }
    if (types.includes('style')) {
        inlineStyles = Array.from(document.querySelectorAll<HTMLStyleElement>('style'))
            .filter((s) => !s.hasAttribute('data-add-by'))
            .map((s, i) => ({
                id: s.dataset.id || `inline-style-${i}`,
                content: s.textContent || ''
            }));
    }
    updateWorker();
}

// 更新 Worker
function updateWorker() {
    if (!worker) return;
    worker.postMessage({cssLinks, inlineStyles, variables});
}

// 初始化 Worker
function initWorker() {
    if (worker) return;
    worker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'});
    worker.onmessage = (e) => {
        const result = e.data as { id: string; css: string; type: ListenerType | 'style' | 'link' }[];
        document.querySelectorAll<HTMLStyleElement>('style[data-add-by="cssWorker"]').forEach((s) => s.remove());

        result.forEach((r) => {
            const style = document.createElement('style');
            style.setAttribute('data-add-by', 'cssWorker');
            style.setAttribute('data-id', r.id);
            style.setAttribute('data-time', new Date().toLocaleString());
            style.textContent = r.css;
            document.head.appendChild(style);
        });
    };
}

/**
 * cssVars 方法
 * @param vars CSS 变量
 * @param options 初始化选项
 * @param clearHistory 是否清空历史变量，默认为 false
 */
export function cssVars(
    vars: Record<string, string>,
    options?: CssVarsOptions,
    clearHistory = false
) {
    types = options?.types || ['link', 'style'];
    root = options?.root || document;
    wait = options?.wait ?? 100;

    // 初始化 Worker
    if (!worker) initWorker();

    // root 变化时重新监听
    if (currentRoot !== root) {
        currentRoot = root;

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        const scanDebounced = debounce(() => scanStyles(), wait);
        observer = new MutationObserver(scanDebounced);
        observer.observe(root, {childList: true, subtree: true});

        scanStyles();
    }

    // 更新 CSS 变量
    variables = clearHistory ? {...vars} : {...variables, ...vars};
    updateWorker();
}
