const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'Envato-Elements-Footage-Picker.user.js'), 'utf8');
const core = source.slice(source.indexOf('    const UI ='), source.indexOf("    if (location.hostname === 'filesta.com')"));
const id = '12345678-1234-1234-1234-123456789abc';
const key = 'envato_picker_filesta_web_' + id;
const url = 'https://elements.envato.com/example-ABC1234';
const file = 'https://video-downloads.elements.envatousercontent.com/file.mov?token=test';

function harness(options = {}) {
    let time = 0, links = [], clicks = 0, downloads = [], stop = false;
    const storage = new Map();
    class Input {
        constructor() { this.placeholder = 'Вставьте URL элемента Envato Elements, который вы хотите загрузить'; }
        set value(v) { this._value = v; }
        get value() { return this._value; }
        dispatchEvent() {}
        getBoundingClientRect() { return { width: 300 }; }
    }
    const input = new Input();
    const page = { open() { throw new Error('Unexpected popup'); } };
    const originalOpen = page.open;
    const button = { disabled: false, textContent: 'Начать загрузку', click() {
        clicks++;
        if (!options.noLink) links = [{ href: file }];
        if (!options.noLink) assert.equal(page.open(file), null);
    } };
    const document = {
        body: { append() {} },
        createElement() { return { style: {}, setAttribute() {}, textContent: '' }; },
        querySelectorAll(selector) {
            if (selector === 'input[placeholder]') return options.noForm ? [] : [input];
            if (selector === 'button') return [button];
            if (selector === '[role="alert"] a[href]') return links;
            return [];
        },
    };
    const context = { URL, URLSearchParams, console, document, HTMLInputElement: Input, Event: class {}, window: page,
        Date: class extends Date { static now() { return time; } },
        setInterval: () => 1, clearInterval() {},
        setTimeout(callback, ms) { time += ms; return setImmediate(callback); },
        GM: {
            async getValue(k, fallback) { return k.endsWith('_stop') ? stop : structuredClone(storage.get(k) ?? fallback); },
            async setValue(k, value) { storage.set(k, structuredClone(value)); },
        },
        GM_download(details) {
            downloads.push({ url: details.url, name: details.name });
            assert.equal(details.headers, undefined, 'No service credentials on the file request');
            if (options.stopAfterFirst) stop = true;
            if (options.downloadError) details.onerror(); else details.onload();
        },
    };
    vm.createContext(context);
    vm.runInContext(core + '\nthis.api={normalizeDownloadEntries,isFilestaVideoLink,filestaFilename,runFilestaWorker};', context);
    return { ...context.api, storage, downloads, get clicks() { return clicks; },
        async run(items) {
            storage.set(key, { id, items, state: 'queued', message: '' });
            await context.api.runFilestaWorker(id);
            assert.equal(page.open, originalOpen, 'Restore popup behavior after the worker finishes');
            return storage.get(key);
        },
    };
}

test('normalization rejects foreign URLs and deduplicates tracking parameters', () => {
    const h = harness();
    const items = h.normalizeDownloadEntries([[url + '?tracking=1', 'one'], [url + '#preview', 'two'], ['https://evil.example/x', 'bad'], ['http://elements.envato.com/x', 'bad']]);
    assert.equal(items.length, 1); assert.equal(items[0].url, url);
});
test('file allowlist rejects host lookalikes and credentials', () => {
    const h = harness();
    assert.equal(h.isFilestaVideoLink(file), true);
    for (const bad of ['https://elements.envatousercontent.com.evil.test/a.mov', 'javascript:alert(1)', 'https://user@video-downloads.elements.envatousercontent.com/a.mov']) assert.equal(h.isFilestaVideoLink(bad), false);
    assert.equal(h.filestaFilename(file, 'CON'), '_CON.mov');
    assert.equal(h.filestaFilename(file, '../Clip:1'), '.._Clip_1.mov');
});
test('two items run sequentially through the form and finish only after download callbacks', async () => {
    const h = harness(); const result = await h.run(h.normalizeDownloadEntries([[url, 'One'], [url + 'B', 'Two']]));
    assert.equal(h.clicks, 2); assert.equal(h.downloads.length, 2);
    assert.equal(result.state, 'complete'); assert.ok(result.items.every(i => i.status === 'done'));
    assert.ok(!JSON.stringify(result).includes('token=test'), 'Never persist signed file URLs');
});
test('file failure stops the batch and preserves unsubmitted entries', async () => {
    const h = harness({ downloadError: true }); const result = await h.run(h.normalizeDownloadEntries([[url, 'One'], [url + 'B', 'Two']]));
    assert.equal(result.state, 'blocked'); assert.equal(result.items[0].status, 'failed');
    assert.equal(result.items[1].status, 'queued'); assert.equal(h.clicks, 1);
});
test('missing form blocks without consuming a request', async () => {
    const h = harness({ noForm: true }); const result = await h.run(h.normalizeDownloadEntries([[url, 'One']]));
    assert.equal(result.state, 'blocked'); assert.equal(h.clicks, 0);
});
test('missing file link needs review and never auto-resubmits', async () => {
    const h = harness({ noLink: true }); const result = await h.run(h.normalizeDownloadEntries([[url, 'One']]));
    assert.equal(result.state, 'blocked'); assert.equal(result.items[0].status, 'review'); assert.equal(h.clicks, 1);
});
test('an interrupted submitted item is not submitted again on reload', async () => {
    const h = harness(); const items = h.normalizeDownloadEntries([[url, 'One']]); items[0].status = 'preparing';
    const result = await h.run(items);
    assert.equal(result.items[0].status, 'review'); assert.equal(h.clicks, 0);
});
test('stop finishes current file but leaves the rest waiting', async () => {
    const h = harness({ stopAfterFirst: true }); const result = await h.run(h.normalizeDownloadEntries([[url, 'One'], [url + 'B', 'Two']]));
    assert.equal(result.state, 'paused'); assert.equal(result.items[0].status, 'done'); assert.equal(result.items[1].status, 'queued'); assert.equal(h.clicks, 1);
});
