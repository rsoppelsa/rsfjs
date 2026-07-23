/**
 * Node tests for rsf-static.js (server-side HTML generation).
 *
 *   npm test          (or: node --test tests/)
 *
 * The other tests in this directory are browser examples - open tests/index.html.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { createStatic } = require('../rsf-static.js');

// ── Basics ───────────────────────────────────────────────────────────────

test('renders an element with attributes and text', () => {
    const html = createStatic(r => r.div({ class: 'box' }, 'hello'));
    assert.strictEqual(html, '<div class="box">hello</div>');
});

test('nests via a content function', () => {
    const html = createStatic(r => r.ul({}, r => { r.li({}, 'a'); r.li({}, 'b'); }));
    assert.strictEqual(html, '<ul><li>a</li><li>b</li></ul>');
});

test('escapes text and attribute values', () => {
    const html = createStatic(r => r.p({ title: '"q"' }, '<script>&'));
    assert.ok(!html.includes('<script>'), 'raw tag must not survive escaping');
    assert.ok(html.includes('&lt;script&gt;&amp;'));
    assert.ok(html.includes('&quot;q&quot;'));
});

test('html:true opts out of escaping', () => {
    const html = createStatic(r => r.div({ html: true }, '<b>x</b>'));
    assert.strictEqual(html, '<div><b>x</b></div>');
});

test('omits event handlers - static output is not interactive', () => {
    const html = createStatic(r => r.button({ click: () => {}, class: 'go' }, 'Go'));
    assert.strictEqual(html, '<button class="go">Go</button>');
});

test('self-closing tags get no closing tag', () => {
    assert.strictEqual(createStatic(r => r.img({ src: 'a.png' })), '<img src="a.png">');
});

test('boolean attributes render bare when true, absent when false', () => {
    assert.strictEqual(createStatic(r => r.input({ disabled: true })), '<input disabled>');
    assert.strictEqual(createStatic(r => r.input({ disabled: false })), '<input>');
});

// ── noscript ─────────────────────────────────────────────────────────────

// rsf.js needs a DOM, so it cannot be exercised here. Its tag list is read from
// source instead - enough to catch the two lists drifting apart.
const tagList = file => {
    const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const block = src.match(/const tags = \[([\s\S]*?)\];/)[1];
    return block.match(/'([a-z0-9]+)'/g).map(s => s.replace(/'/g, ''));
};

test('noscript has a shorthand and renders', () => {
    assert.strictEqual(createStatic(r => r.noscript({}, 'no js')), '<noscript>no js</noscript>');
});

test('noscript is present in both tag lists', () => {
    // Guards the browser side too: a subset check alone cannot notice a tag
    // being dropped from rsf.js, since a shorter list is still a subset.
    assert.ok(tagList('rsf.js').includes('noscript'), 'rsf.js tags must include noscript');
    assert.ok(tagList('rsf-static.js').includes('noscript'), 'rsf-static.js tags must include noscript');
});

test('browser tag list is a subset of the static one', () => {
    // Anything renderable in the browser must also render server-side, or a
    // component works in one environment and silently fails in the other. The
    // static list is deliberately larger (html, head, meta, ... ).
    const missing = tagList('rsf.js').filter(t => !tagList('rsf-static.js').includes(t));
    assert.deepStrictEqual(missing, [], `tags in rsf.js but not rsf-static.js: ${missing}`);
});

// ── State ────────────────────────────────────────────────────────────────

test('State is constructible and reads its initial value', () => {
    const html = createStatic(r => {
        const s = new r.State('ready');
        r.p({}, s.get());
    });
    assert.strictEqual(html, '<p>ready</p>');
});

test('watch blocks render at initial state', () => {
    const html = createStatic(r => {
        const open = new r.State(false);
        r.div({ watch: [open] }, r => r.span({}, open.get() ? 'open' : 'shut'));
    });
    // `watch` is a directive, never an attribute in the output.
    assert.strictEqual(html, '<div><span>shut</span></div>');
});

test('set() updates the value so render-time changes match the browser', () => {
    const html = createStatic(r => {
        const loading = new r.State(false);
        loading.set(true);
        r.p({}, loading.get() ? 'loading' : 'idle');
    });
    assert.strictEqual(html, '<p>loading</p>');
});

test('value accessor and update() behave like the browser State', () => {
    const html = createStatic(r => {
        const n = new r.State(1);
        n.update(v => v + 1);
        n.value = n.value * 10;
        r.p({}, String(n.get()));
    });
    assert.strictEqual(html, '<p>20</p>');
});

test('set() does not attempt to notify - no DOM is present', () => {
    // Would throw on `document` if notifyElements were reachable here.
    assert.doesNotThrow(() => createStatic(r => {
        const s = new r.State(0);
        r.div({ watch: [s] }, r => r.span({}, String(s.get())));
        s.set(1);
    }));
});

test('a realistic stateful component renders', () => {
    // Shaped like the panels in real projects: several States, a watch block,
    // event handlers and conditional branches.
    const Panel = r => {
        const phase = new r.State('intro');
        const name = new r.State('');
        const error = new r.State('');
        r.div({ class: 'panel', watch: [phase, name, error] }, r => {
            if (phase.get() === 'intro') {
                r.label({ for: 'n' }, 'Your name');
                r.input({ id: 'n', value: name.get(), input: () => {} });
                if (error.get()) r.p({ class: 'err' }, error.get());
                r.button({ click: () => {} }, 'Start');
            } else {
                r.p({}, 'done');
            }
        });
    };
    const html = createStatic(Panel);
    assert.ok(html.includes('<label for="n">Your name</label>'));
    assert.ok(html.includes('<button>Start</button>'), 'handler stripped, content kept');
    assert.ok(!html.includes('class="err"'), 'empty error branch not rendered');
    assert.ok(!html.includes('watch'), 'watch must not leak into markup');
});
