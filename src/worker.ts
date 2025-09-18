/// <reference lib="WebWorker" />
export {};

declare const self: DedicatedWorkerGlobalScope;

let cssCache: Record<string, string> = {};

self.onmessage = (e: MessageEvent) => {
    const {cssLinks, inlineStyles, variables} = e.data as {
        cssLinks: string[];
        inlineStyles: { id: string; content: string }[];
        variables: Record<string, string>;
    };

    const results: { id: string; css: string; type: 'link' | 'style' }[] = [];
    let index = 0;

    function processCss(cssText: string): string {
        // 去注释 + 去空行
        cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*[\r\n]+/gm, '');
        // 替换 CSS 变量
        cssText = cssText.replace(/var\((--[^)\s]+)\)/g, (_, varName) =>
            variables.hasOwnProperty(varName) ? variables[varName] : `var(${varName})`
        );
        return cssText;
    }

    function loadNext() {
        if (index >= cssLinks.length) {
            // 同步处理 style 标签
            for (const s of inlineStyles) {
                const css = processCss(s.content);
                results.push({id: s.id, css, type: 'style'});
            }

            self.postMessage(results);
            return;
        }

        const link = cssLinks[index];
        const xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let cssText = processCss(xhr.responseText);
                    cssCache[link] = cssText;
                    results.push({id: link, css: cssText, type: 'link'});
                }
                index++;
                loadNext();
            }
        };
        xhr.send();
    }

    loadNext();
};
