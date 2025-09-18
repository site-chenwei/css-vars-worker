/**
 * @jest-environment jsdom
 */
describe('index.ts', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        (window as any).Worker = class {
            onmessage: any;
            postMessage = jest.fn();
        };
    });

    it('setCssVariables 触发更新', () => {
        const {setCssVariables} = require('../src/index');
        setCssVariables({'--primary': '#00aa00'});
        const worker = (window as any).Worker.prototype;
        expect(worker.postMessage).toHaveBeenCalled();
    });
});
