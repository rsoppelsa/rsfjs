/**
 * RSF HTML to RSF Converter Utility
 *
 * A developer tool for converting HTML to RSF code.
 * Include this script in your page to enable the HTML to RSF converter UI.
 *
 * Usage:
 *   <script src="rsf.js"></script>
 *   <script src="renderHtmlToRsf.js"></script>
 *
 *   rsf('#app', r => {
 *       renderHtmlToRsf(r);
 *   });
 */

function renderHtmlToRsf(r) {
    // Parse HTML to RSF code
    function parseHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html.trim(), 'text/html');

        function nodeToRsf(node, indent = 0) {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent.trim();
                if (!text) return null;
                const spaces = ' '.repeat(indent);
                return `${spaces}r.text("${text}")`;
            }

            if (node.nodeType !== 1) return null; // Skip non-element nodes

            const tag = node.tagName.toLowerCase();
            const hasAttributes = node.attributes.length > 0;

            // Build attributes object if needed
            let attrs = {};
            if (hasAttributes) {
                Array.from(node.attributes).forEach(attr => {
                    if (attr.name === 'class') {
                        attrs.class = attr.value;
                    } else {
                        attrs[attr.name] = attr.value;
                    }
                });
            }

            const spaces = ' '.repeat(indent);

            // Check children
            const children = Array.from(node.childNodes)
                .map(child => nodeToRsf(child, indent + 4))
                .filter(Boolean);

            // If there's only one child and it's pure text (no r.text wrapper needed)
            if (children.length === 1 && node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
                const text = node.firstChild.textContent.trim();
                if (text) {
                    if (Object.keys(attrs).length === 0) {
                        return `${spaces}r.${tag}("${text}")`;
                    } else {
                        return `${spaces}r.${tag}(${JSON.stringify(attrs)}, "${text}")`;
                    }
                }
            }

            // Multiple children or single non-text child
            if (children.length > 0) {
                const childrenStr = children.map(c => c + ';').join('\n');
                if (Object.keys(attrs).length === 0) {
                    return `${spaces}r.${tag}((r) => {\n${childrenStr}\n${spaces}})`;
                } else {
                    return `${spaces}r.${tag}(${JSON.stringify(attrs)}, (r) => {\n${childrenStr}\n${spaces}})`;
                }
            }

            // No children
            if (Object.keys(attrs).length === 0) {
                return `${spaces}r.${tag}()`;
            } else {
                return `${spaces}r.${tag}(${JSON.stringify(attrs)})`;
            }
        }

        try {
            // Get all root level elements
            const rootElements = Array.from(doc.body.children);
            if (rootElements.length === 0) {
                return '// No valid HTML elements found';
            }

            // Convert each root element and join them with semicolons
            const rsfCode = rootElements
                .map(el => nodeToRsf(el))
                .join(';\n\n');

            return rsfCode + ';';
        } catch (error) {
            return `// Error parsing HTML: ${error.message}`;
        }
    }

    // Create the UI
    r.div({ style: { maxWidth: '800px', margin: '20px auto', padding: '20px' } }, (r) => {
        r.div({ style: { marginBottom: '16px' } }, (r) => {
            r.h2({ style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#2c3e50' } }, "HTML to RSF Converter");
            r.div((r) => {
                r.label({
                    style: {
                        display: 'block',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: '#2c3e50'
                    }
                }, "Paste HTML here:");
                r.textarea({
                    style: {
                        width: '100%',
                        height: '150px',
                        padding: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        backgroundColor: '#f8fafc',
                        boxSizing: 'border-box'
                    },
                    id: 'html-input',
                    placeholder: '<div><span>hello, world</span></div>'
                });
            });
        });

        r.div({ style: { width: '100%' } }, (r) => {
            r.button({
                style: {
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginTop: '12px',
                    marginBottom: '12px'
                },
                click: () => {
                    const input = document.getElementById('html-input').value;
                    const output = parseHTML(input);
                    document.getElementById('rsf-output').textContent = output;
                }
            }, "Convert to RSF");
        });

        r.div((r) => {
            r.label({ style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#2c3e50' } }, "RSF Code:");
            r.pre({
                style: {
                    width: '100%',
                    minHeight: '150px',
                    padding: '12px',
                    backgroundColor: '#2c3e50',
                    color: '#ecf0f1',
                    border: 'none',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                }
            }, (r) => {
                r.code({ id: 'rsf-output' });
            });
        });
    });
}
