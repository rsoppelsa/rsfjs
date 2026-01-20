/* global define */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.rsf = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    function rsf(anchor, child, options = {}) {
        const booleanAttributes = [
            'checked', 'disabled', 'required', 'readonly', 'selected',
            'multiple', 'hidden', 'open', 'novalidate', 'autoplay',
            'controls', 'default', 'reversed', 'async', 'defer'
        ];

        const tags = [
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

        const events = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove',
            'keydown', 'keyup', 'keypress', 'focus', 'blur', 'change', 'submit', 'input',
            'touchstart', 'touchend', 'touchmove',
            'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'
        ];

        class State {
            constructor(initialValue, options = {}) {
                this._value = initialValue;
                this._compare = options.compare || ((a, b) => a === b);
                this._debug = options.debug || false;
            }
        
            get() {
                return this._value;
            }
        
            set(newValue, force) {
                if (!this._compare(this._value, newValue) || force) {
                    this._value = newValue;
                    this.notifyElements();
                }
            }

            // value getter
            get value() {
                return this._value;
            }

            // value setter for symmetry
            set value(newValue) {
                this.set(newValue);
            }

            update(updaterFn, force) {
                const currentValue = this.get();
                const newValue = updaterFn(currentValue);
                this.set(newValue, force);
                return this;
            }

            notifyElements() {
                // Find all elements watching this state by querying DOM
                document.querySelectorAll('[data-rsf-watching]').forEach(element => {
                    const watching = element.getAttribute('data-rsf-watching').split(',');
                    if (watching.includes(this._stateId)) {
                        const renderFn = element._rsfRender;
                        if (renderFn) {
                            element.innerHTML = '';
                            const tempR = Object.create(r);
                            tempR._currentElement = element;
                            renderFn(tempR);
                        }
                    }
                });
            }
        }

        let stateIdCounter = 0;

        const r = {
            anchor,
            child,
            options,
            _element: null,
            _currentElement: null,
            _stack: [],
            State,

            init() {
                this._element = document.querySelector(this.anchor);
                if (!this._element) {
                    throw new Error(`RSF: Cannot find anchor element "${this.anchor}"`);
                }
                this._currentElement = this._element;
                return this;
            },

            elem(tag = 'div', props = {}, content) {
                const element = document.createElement(tag);
                const childContent = content;

                if (props.watch) {
                    // Normalize watch to array if single state provided
                    const watchArray = Array.isArray(props.watch) ? props.watch : [props.watch];

                    // Assign unique IDs to states if they don't have them
                    watchArray.forEach(state => {
                        if (!state._stateId) {
                            state._stateId = `state-${stateIdCounter++}`;
                        }
                    });

                    // Store state IDs on element
                    element.setAttribute('data-rsf-watching', watchArray.map(s => s._stateId).join(','));

                    // Store render function
                    element._rsfRender = childContent;

                    delete props.watch;
                }

                const camelToKebab = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

                Object.entries(props).forEach(([key, value]) => {
                    const attr = camelToKebab(key);
                    if (key === 'class') {
                        element.className = value;
                    } else if (key === 'style') {
                        if (typeof value === 'object') {
                            Object.assign(element.style, value);
                        } else {
                            element.setAttribute('style', value);
                        }
                    } else if (events.includes(attr)) {
                        element.addEventListener(attr, (e) => {
                            if (value.prototype) {
                                value.call(element, e, this);
                            } else {
                                value(e, this);
                            }
                        });
                    } else if (booleanAttributes.includes(attr)) {
                        if (value === true) {
                            element.setAttribute(attr, '');
                        } else if (value === false) {
                            element.removeAttribute(attr);
                        }
                    } else {
                        element.setAttribute(attr, value);
                    }
                });

                this._currentElement.appendChild(element);

                if (typeof childContent === 'function') {
                    this._stack.push(this._currentElement);
                    const parentElement = this._currentElement;
                    this._currentElement = element;
                    this._parentElement = parentElement;
                    childContent(this);
                    this._currentElement = this._stack.pop();
                    this._parentElement = this._stack[this._stack.length - 1] || null;
                } else if (childContent !== undefined) {
                    const content = String(childContent);
                    if (props.html === true) {
                        element.innerHTML = content;
                    } else {
                        element.textContent = content;
                    }
                }

                return element;
            },

            text(content) {
                const textNode = document.createTextNode(String(content));
                this._currentElement.appendChild(textNode);
                return textNode;
            },

            render() {
                this.init();
                this._element.innerHTML = '';
                this.child(this);
                return this;
            }
        };

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

        // Add custom tags from options
        if (options.addTags && Array.isArray(options.addTags)) {
            options.addTags.forEach(tag => {
                r[tag] = function (propsOrContent, content) {
                    if (typeof propsOrContent === 'string' || typeof propsOrContent === 'function') {
                        return this.elem(tag, {}, propsOrContent);
                    } else {
                        return this.elem(tag, propsOrContent || {}, content);
                    }
                };
            });
        }

        return r.render();
    }

    return rsf;
}));