/**
 * RSF Static HTML Generator
 *
 * A server-side utility for generating static HTML from RSF code.
 * Use this in Node.js environments to pre-render HTML.
 *
 * Usage (Node.js):
 *   const { createStatic } = require('./rsf-static.js');
 *   const html = createStatic(r => {
 *       r.div({}, 'Hello World');
 *   });
 *
 * Usage (ES Modules):
 *   import { createStatic } from './rsf-static.js';
 *   const html = createStatic(r => {
 *       r.div({}, 'Hello World');
 *   });
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.rsfStatic = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    function createStatic(renderFn) {
        const booleanAttributes = [
            'checked', 'disabled', 'required', 'readonly', 'selected',
            'multiple', 'hidden', 'open', 'novalidate', 'autoplay',
            'controls', 'default', 'reversed', 'async', 'defer'
        ];

        const tags = [
            'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style',
            'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'main', 'nav', 'section',
            'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'ol', 'p', 'pre', 'ul',
            'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark',
            'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var',
            'img', 'audio', 'video', 'track',
            'table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',
            'button', 'datalist', 'fieldset', 'form', 'input', 'label', 'legend', 'meter', 'optgroup', 'option',
            'output', 'progress', 'select', 'textarea',
            'canvas',
            'svg', 'circle', 'rect', 'text', 'path',
            'iframe'
        ];

        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

        let html = '';

        const camelToKebab = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

        const escapeHtml = (text) => {
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const r = {
            elem(tag = 'div', props = {}, content) {
                const childContent = content;

                // Build attribute string
                let attrs = '';
                Object.entries(props).forEach(([key, value]) => {
                    // Skip special RSF properties
                    if (key === 'watch' || key === 'html') return;

                    const attr = camelToKebab(key);

                    if (key === 'style') {
                        if (typeof value === 'object') {
                            const styleStr = Object.entries(value)
                                .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
                                .join('; ');
                            attrs += ` style="${styleStr}"`;
                        } else {
                            attrs += ` style="${escapeHtml(value)}"`;
                        }
                    } else if (booleanAttributes.includes(attr)) {
                        if (value === true) {
                            attrs += ` ${attr}`;
                        }
                    } else if (typeof value === 'function') {
                        // Skip event handlers in static generation
                    } else {
                        attrs += ` ${attr}="${escapeHtml(value)}"`;
                    }
                });

                // Build opening tag
                html += `<${tag}${attrs}>`;

                // Handle content
                if (typeof childContent === 'function') {
                    childContent(this);
                } else if (childContent !== undefined) {
                    if (props.html === true) {
                        html += String(childContent);
                    } else {
                        html += escapeHtml(childContent);
                    }
                }

                // Closing tag (skip for self-closing tags)
                if (!selfClosingTags.includes(tag)) {
                    html += `</${tag}>`;
                }
            },

            text(content) {
                html += escapeHtml(content);
            }
        };

        // Add tag methods
        tags.forEach(tag => {
            // Skip 'text' tag to avoid overriding r.text() method
            if (tag === 'text') return;

            r[tag] = function (propsOrContent, content) {
                if (typeof propsOrContent === 'string' || typeof propsOrContent === 'function') {
                    return this.elem(tag, {}, propsOrContent);
                } else {
                    return this.elem(tag, propsOrContent || {}, content);
                }
            };
        });

        // Execute render function
        renderFn(r);

        return html;
    }

    return { createStatic };
}));
