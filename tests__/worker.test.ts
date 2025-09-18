describe('worker.ts', () => {
    let postMessageSpy: jest.Mock;

    beforeEach(() => {
        postMessageSpy = jest.fn();
        (global as any).self = {postMessage: postMessageSpy};
        jest.resetModules();
    });

    it('替换 CSS 变量', () => {
        const worker = require('../src/worker');
        (worker as any).onmessage!({
            data: {
                cssLinks: [],
                inlineStyles: [{id: 's1', content: '.btn{color:var(--blue)}'}],
                variables: {'--blue': '#1890ff'}
            }
        } as MessageEvent);

        expect(postMessageSpy).toHaveBeenCalled();
        const result = postMessageSpy.mock.calls[0][0];
        expect(result[0].css).toContain('#1890ff');
    });
});
