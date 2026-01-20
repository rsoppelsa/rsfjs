# RSF - Really Simple Framework

A lightweight JavaScript framework for building reactive web applications.

Many websites are developed with frameworks that are overkill. RSF is a low-friction alternative that gets out of your way.

## Why RSF?

- **Everything is JavaScript** - If you're familiar with HTML/CSS/Javascript, you can use RSF immediately
- **JavaScript-native** - Conditionals, control flow, and loops make complex layouts easy
- **Simple reactivity** - Effective state management without the complexity
- **Zero dependencies** - No tooling, no build step, no configuration
- **Tiny footprint** - Single file script, minimal overhead
- **Browser-friendly** - Works in any browser or JavaScript environment with DOM support

## Quick Start

### Hello World

```html
<!DOCTYPE html>
<html>
<head>
    <script src="rsf.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        rsf('#app', r => {
            r.div({ class: 'container' }, r => {
                r.h1({}, 'Hello, RSF!');
                r.p({}, 'Build reactive UIs with ease.');
            });
        });
    </script>
</body>
</html>
```

### Reactive Counter

```javascript
rsf('#app', r => {
    const count = new r.State(0);

    r.div({}, r => {
        r.h2({ watch: [count] }, r => {
            r.text(`Count: ${count.get()}`);
        });
        r.button({ click: () => count.set(count.get() + 1) }, 'Increment');
        r.button({ click: () => count.set(count.get() - 1) }, 'Decrement');
        r.button({ click: () => count.set(0) }, 'Reset');
    });
});
```

### Fetching Data from an API

```javascript
rsf('#app', r => {
    const users = new r.State([]);
    const loading = new r.State(true);
    const error = new r.State(null);

    // Render UI
    r.div({ class: 'users' }, r => {
        r.h1({}, 'Users');

        r.div({ watch: [loading, error, users] }, r => {
            if (loading.get()) {
                r.p({}, 'Loading...');
            } else if (error.get()) {
                r.p({ style: { color: 'red' } }, `Error: ${error.get()}`);
            } else {
                r.ul({}, r => {
                    users.get().forEach(user => {
                        r.li({}, user.name);
                    });
                });
            }
        });
    });

    // Fetch data
    async function fetchUsers() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data = await response.json();
            users.set(data);
            loading.set(false);
        } catch (err) {
            error.set(err.message);
            loading.set(false);
        }
    }
    fetchUsers();
});
```

## Examples and Live Demos

The `/tests` directory contains interactive examples demonstrating RSF features. Each example is a standalone HTML file you can open directly in your browser:

- **[tests/index.html](tests/index.html)** - Examples gallery with links to all demos
- **[tests/hello-world/](tests/hello-world/)** - Basic RSF usage
- **[tests/counter/](tests/counter/)** - Reactive state management
- **[tests/todo-list/](tests/todo-list/)** - Component composition and list rendering
- **[tests/form/](tests/form/)** - Form handling and validation
- **[tests/fetch/](tests/fetch/)** - API data fetching
- **[tests/filtering/](tests/filtering/)** - Search and filtering
- **[tests/html-converter/](tests/html-converter/)** - HTML to RSF converter tool

To run any example, simply open the HTML file in a web browser - no build step or server required!

## Installation

RSF supports multiple module systems and can be used in any JavaScript environment.

### Browser (Script Tag)

```html
<!-- Development -->
<script src="rsf.js"></script>

<!-- Production (minified, ~60% smaller) -->
<script src="rsf.min.js"></script>

<script>
    rsf('#app', r => {
        r.div({}, 'Hello World');
    });
</script>
```

All modules have minified versions available:
- `rsf.min.js` - Core framework (3.6KB)
- `rsf-static.min.js` - Static HTML generation (2.0KB)
- `renderHtmlToRsf.min.js` - HTML converter (2.5KB)
- `renderReactive.min.js` - Reactive helper (301 bytes)

### ES Modules

```javascript
import rsf from './rsf.js';

rsf('#app', r => {
    r.div({}, 'Hello World');
});
```

### CommonJS (Node.js/Webpack)

```javascript
const rsf = require('./rsf.js');

rsf('#app', r => {
    r.div({}, 'Hello World');
});
```

### AMD (RequireJS)

```javascript
require(['rsf'], function(rsf) {
    rsf('#app', r => {
        r.div({}, 'Hello World');
    });
});
```

## Core Concepts

### Elements

Create DOM elements using intuitive tag helpers. Each method returns the actual DOM element:

```javascript
rsf('#app', r => {
    const container = r.div({ class: 'container' }, r => {
        r.h1({}, 'Title');
        r.p({}, 'Paragraph content');
        r.button({ click: () => alert('Clicked!') }, 'Click Me');
    });
    // container is the actual DOM element
});
```

All standard HTML tags are available: `div`, `span`, `p`, `h1`-`h6`, `button`, `input`, `form`, `ul`, `li`, `table`, `tr`, `td`, etc.

For tags not included in the standard list, use `r.elem()`:

```javascript
r.elem('article', { class: 'custom' }, 'Content');
r.elem('details', {}, r => {
    r.elem('summary', {}, 'Click to expand');
    r.p({}, 'Hidden content');
});
```

You can also add custom tags via the `addTags` option:

```javascript
rsf('#app', r => {
    r.article({}, 'Now article is available!');
    r.details({}, r => {
        r.summary({}, 'Click to expand');
        r.p({}, 'Hidden content');
    });
}, {
    addTags: ['article', 'details', 'summary']
});
```

### State Management

RSF provides reactive state management with DOM-based tracking. When state changes, only the elements watching that state are updated:

```javascript
rsf('#app', r => {
    // Create state
    const name = new r.State('World');

    // Watch single state (array optional for single state)
    r.div({ watch: name }, r => {
        r.h1({}, `Hello, ${name.get()}!`);
    });

    // Update state
    r.input({
        value: name.get(),
        input: (e) => name.set(e.target.value)
    });
});
```

#### State Methods

```javascript
const state = new r.State(initialValue, options);

state.get()                           // Get current value
state.set(newValue)                   // Set value and trigger updates
state.update(val => val + 1)          // Update using function
```

#### State Options

```javascript
const obj = new r.State({}, {
    compare: (a, b) => _.isEqual(a, b),  // Custom comparison function
    debug: true                           // Enable debug logging
});
```

#### Reactive Containers with renderReactive

The `renderReactive` helper simplifies creating self-contained reactive components with internal state. It creates a container that automatically re-renders when its state changes:

```javascript
// Include the helper
<script src="rsf.js"></script>
<script src="renderReactive.js"></script>

rsf('#app', r => {
    // Create a reactive counter
    const count = renderReactive(r, 0, (r, state) => {
        r.h2({}, `Count: ${state.get()}`);
        r.button({ click: () => state.set(state.get() + 1) }, 'Increment');
        r.button({ click: () => state.set(0) }, 'Reset');
    });

    // Can update state externally
    setTimeout(() => count.set(100), 5000);
});
```

**Parameters:**
- `r` - RSF framework instance
- `initial` - Initial state value
- `child` - Render function that receives `(r, state)`
- `options` - Optional configuration object
  - `tag` - Container element type (default: `'div'`)
  - `class` - CSS class name
  - `style` - Inline styles (string or object)
  - `watch` - Additional states to watch (will be merged with internal state)
  - Any other valid element attributes

**Returns:** The internal `State` object for external updates

**Example with custom container:**

```javascript
renderReactive(r, { name: '', email: '' }, (r, formData) => {
    r.input({
        type: 'text',
        value: formData.get().name,
        input: (e) => formData.update(data => ({
            ...data,
            name: e.target.value
        }))
    });
    r.input({
        type: 'email',
        value: formData.get().email,
        input: (e) => formData.update(data => ({
            ...data,
            email: e.target.value
        }))
    });
}, {
    tag: 'form',
    class: 'user-form',
    style: { padding: '20px' }
});
```

**Benefits:**
- Encapsulates state within a component
- Reduces boilerplate for simple reactive containers
- Automatically sets up watch relationships
- Returns state for external access when needed

### Styling

Apply styles using strings or objects. Object properties in camelCase are automatically converted to kebab-case:

```javascript
// String styles
r.div({ style: 'color: blue; font-size: 16px' });

// Object styles (recommended)
r.div({
    style: {
        backgroundColor: 'blue',    // Becomes background-color
        fontSize: '16px',           // Becomes font-size
        padding: '10px'
    }
});
```

### Event Handling

Event handlers receive the event object and the framework instance:

```javascript
r.button({
    click: (e, r) => {
        console.log('Button clicked!');
        e.preventDefault();
    }
}, 'Click Me');

// Access element with traditional function
r.button({
    click: function(e, r) {
        console.log(this.textContent);  // this = button element
    }
}, 'Click Me');
```

Common events: `click`, `input`, `change`, `submit`, `focus`, `blur`, `keydown`, `keyup`, `mouseenter`, `mouseleave`, etc.

**Important:** Don't try to render content directly in event handlers. Instead, update state and let the reactive system handle re-rendering:

```javascript
// ❌ Wrong - trying to render in event handler
r.button({
    click: (e, r) => {
        r.div({}, 'New content');  // This won't work as expected!
    }
}, 'Click');

// ✅ Correct - update state, let watch handle rendering
const content = new r.State('Initial');

r.div({ watch: content }, r => {
    r.text(content.get());
});

r.button({
    click: () => {
        content.set('New content');  // State change triggers re-render
    }
}, 'Click');
```

### Conditional Rendering

Use JavaScript conditionals directly:

```javascript
const isLoggedIn = new r.State(false);

r.div({ watch: [isLoggedIn] }, r => {
    if (isLoggedIn.get()) {
        r.p({}, 'Welcome back!');
        r.button({ click: () => isLoggedIn.set(false) }, 'Logout');
    } else {
        r.p({}, 'Please log in');
        r.button({ click: () => isLoggedIn.set(true) }, 'Login');
    }
});
```

### Lists and Loops

Use JavaScript loops to render lists:

```javascript
const items = new r.State(['Apple', 'Banana', 'Cherry']);

r.ul({ watch: [items] }, r => {
    items.get().forEach((item, index) => {
        r.li({
            class: index % 2 === 0 ? 'even' : 'odd'
        }, item);
    });
});
```

### Component Composition

Create reusable components as functions:

```javascript
const TodoItem = (r, todo, onToggle, onDelete) => {
    r.li({
        class: todo.completed ? 'completed' : '',
        style: {
            textDecoration: todo.completed ? 'line-through' : 'none'
        }
    }, r => {
        r.input({
            type: 'checkbox',
            checked: todo.completed,
            change: (e) => onToggle(todo.id, e.target.checked)
        });
        r.span({}, todo.text);
        r.button({ click: () => onDelete(todo.id) }, 'Delete');
    });
};

const TodoList = (r) => {
    const todos = new r.State([
        { id: 1, text: 'Learn RSF', completed: false },
        { id: 2, text: 'Build app', completed: false }
    ]);

    const toggleTodo = (id, completed) => {
        todos.update(list =>
            list.map(t => t.id === id ? { ...t, completed } : t)
        );
    };

    const deleteTodo = (id) => {
        todos.update(list => list.filter(t => t.id !== id));
    };

    r.div({}, r => {
        r.h2({}, 'Todo List');
        r.ul({ watch: [todos] }, r => {
            todos.get().forEach(todo => {
                TodoItem(r, todo, toggleTodo, deleteTodo);
            });
        });
    });
};

rsf('#app', TodoList);
```

## Advanced Features

### Attributes

RSF properly handles boolean attributes:

```javascript
r.input({ type: 'checkbox', checked: true });      // checked attribute present
r.input({ type: 'checkbox', checked: false });     // checked attribute removed
r.button({ disabled: true }, 'Submit');            // disabled attribute present
r.button({ disabled: false }, 'Submit');           // disabled attribute removed
```

### HTML Content

Render raw HTML (use with caution):

```javascript
r.div({ html: true }, '<strong>Bold</strong> and <em>italic</em>');
```

### Non-Standard Tags

Create elements with any HTML tag using the `elem` method:

```javascript
r.elem('article', { class: 'custom' }, r => {
    r.h2({}, 'Article Title');
    r.p({}, 'Article content...');
});
```

### Watching Multiple States

Watch multiple states in a single element (use array for multiple states):

```javascript
const firstName = new r.State('John');
const lastName = new r.State('Doe');

r.div({ watch: [firstName, lastName] }, r => {
    r.text(`Full name: ${firstName.get()} ${lastName.get()}`);
});
```

## API Reference

### Main Function

```javascript
rsf(anchor, renderFunction, options)
```

- **anchor**: CSS selector string for the target element (e.g., `'#app'`)
- **renderFunction**: Function that receives the framework instance `r`
- **options**: Optional configuration object
  - `addTags`: Array of additional HTML tag names to register as helper methods

### State Class

```javascript
new r.State(initialValue, options)
```

**Methods:**
- `get()` - Returns current value
- `set(value)` - Updates value and triggers UI updates
- `update(fn)` - Updates value using a function `(currentValue) => newValue`
- `addListener(element, childFn)` - Internal: Registers element as listener
- `removeListener(element)` - Internal: Removes element as listener

**Options:**
- `compare: (a, b) => boolean` - Custom comparison function (default: `===`)
- `debug: boolean` - Enable console logging for state changes

### Element Properties

Elements accept a props object with the following:

- **Attributes**: Any valid HTML attribute (`id`, `class`, `type`, `href`, etc.)
  - CamelCase property names are automatically converted to kebab-case
  - Example: `dataBsTarget` becomes `data-bs-target`, `ariaLabel` becomes `aria-label`

  ```javascript
  // These are equivalent:
  r.button({ dataBsTarget: '#modal' }, 'Open');
  r.button({ 'data-bs-target': '#modal' }, 'Open');

  r.div({ ariaLabel: 'Main content' });
  r.div({ 'aria-label': 'Main content' });
  ```

- **style**: String or object of CSS styles
- **watch**: State object or array of State objects to watch for changes
- **html**: Boolean, if true treats content as HTML
- **Events**: Event handlers (`click`, `input`, `change`, `submit`, etc.)

### Framework Methods

- **`r.text(content)`** - Create a text node
- **`r.elem(tag, props, content)`** - Create element with specified tag (default: 'div')
- **`r.div()`, `r.span()`, `r.p()`, etc.** - All standard HTML tags

## Practical Examples

### Form Handling

```javascript
rsf('#app', r => {
    const formData = new r.State({ name: '', email: '' });
    const submitted = new r.State(false);

    r.form({
        submit: (e) => {
            e.preventDefault();
            console.log('Submitted:', formData.get());
            submitted.set(true);
        }
    }, r => {
        r.input({
            type: 'text',
            placeholder: 'Name',
            value: formData.get().name,
            input: (e) => formData.update(data => ({
                ...data,
                name: e.target.value
            }))
        });

        r.input({
            type: 'email',
            placeholder: 'Email',
            value: formData.get().email,
            input: (e) => formData.update(data => ({
                ...data,
                email: e.target.value
            }))
        });

        r.button({ type: 'submit' }, 'Submit');

        r.div({ watch: [submitted, formData] }, r => {
            if (submitted.get()) {
                r.p({}, `Thanks, ${formData.get().name}!`);
            }
        });
    });
});
```

### Filtering and Search

```javascript
rsf('#app', r => {
    const allItems = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
    const searchTerm = new r.State('');

    r.div({}, r => {
        r.input({
            type: 'text',
            placeholder: 'Search...',
            input: (e) => searchTerm.set(e.target.value.toLowerCase())
        });

        r.ul({ watch: [searchTerm] }, r => {
            const filtered = allItems.filter(item =>
                item.toLowerCase().includes(searchTerm.get())
            );

            filtered.forEach(item => {
                r.li({}, item);
            });

            if (filtered.length === 0) {
                r.li({ style: { fontStyle: 'italic' } }, 'No results found');
            }
        });
    });
});
```

### Tabs Component

```javascript
rsf('#app', r => {
    const activeTab = new r.State('home');

    const tabs = [
        { id: 'home', label: 'Home', content: 'Welcome to the home page!' },
        { id: 'about', label: 'About', content: 'Learn more about us.' },
        { id: 'contact', label: 'Contact', content: 'Get in touch!' }
    ];

    r.div({ class: 'tabs' }, r => {
        // Tab buttons
        r.div({ class: 'tab-buttons' }, r => {
            tabs.forEach(tab => {
                r.button({
                    watch: [activeTab],
                    class: activeTab.get() === tab.id ? 'active' : '',
                    click: () => activeTab.set(tab.id)
                }, tab.label);
            });
        });

        // Tab content
        r.div({ class: 'tab-content', watch: [activeTab] }, r => {
            const active = tabs.find(t => t.id === activeTab.get());
            r.p({}, active.content);
        });
    });
});
```

## Server-Side Static HTML Generation

RSF provides a separate module for generating static HTML in Node.js environments.

**Installation:**

Require the `rsf-static.js` module in your Node.js application:

```javascript
const { createStatic } = require('./rsf-static.js');
const fs = require('fs');
```

**Usage:**

```javascript
const { createStatic } = require('./rsf-static.js');
const fs = require('fs');

// Generate static HTML
const html = createStatic((r) => {
    r.html({}, r => {
        r.head({}, r => {
            r.title({}, 'My Page');
            r.meta({ charset: 'utf-8' });
        });
        r.body({}, r => {
            r.h1({}, 'Hello from Node.js');
            r.p({}, 'This was generated server-side!');
            r.div({ class: 'content', style: { color: 'blue' } }, r => {
                r.p({}, 'Supports all RSF features except state management.');
            });
        });
    });
});

fs.writeFileSync('output.html', html);
console.log('Generated HTML file!');
```

**ES Modules:**

```javascript
import { createStatic } from './rsf-static.js';

const html = createStatic(r => {
    r.div({}, 'Hello World');
});
```

**Features:**
- Full RSF syntax support
- HTML escaping for security
- Self-closing tags handled correctly
- CamelCase to kebab-case conversion
- State and event handlers are ignored (not applicable for static HTML)

**Use cases:**
- Static site generation
- Email templates
- Server-side rendering
- Pre-rendering for SEO

## Developer Tools

### HTML to RSF Converter

RSF provides an optional utility for converting HTML to RSF code, useful during development and migration.

**Include the utility:**

```html
<script src="rsf.js"></script>
<script src="renderHtmlToRsf.js"></script>
```

**Use the converter in your application:**

```javascript
rsf('#app', r => {
    renderHtmlToRsf(r);
});
```

This renders an interactive UI where you can:
- Paste HTML code
- Convert it to RSF syntax
- Copy the generated code

**Example:**

```html
<!DOCTYPE html>
<html>
<head>
    <script src="rsf.js"></script>
    <script src="renderHtmlToRsf.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        rsf('#app', r => {
            renderHtmlToRsf(r);
        });
    </script>
</body>
</html>
```

**Perfect for:**
- Converting existing HTML to RSF
- Learning RSF syntax by example
- Migrating legacy projects
- Quick prototyping

**Note:** This is a developer tool and should not be included in production builds.

## Implementation Details

RSF uses several techniques to stay lightweight and efficient:

1. **DOM-based State Tracking**: Uses `data-rsf-watching` attributes to track which elements depend on which states
2. **Stack Management**: Maintains an internal stack to track element context during rendering
3. **Minimal Re-rendering**: Only updates elements that watch changed states
4. **Direct DOM Manipulation**: No virtual DOM overhead

## Best Practices

1. **State Placement**: Keep state at the appropriate level in your component hierarchy
2. **Event Handlers**: Use arrow functions unless you need element context via `this`
3. **Watch Arrays**: Only use `watch` on elements that need to react to state changes
4. **Custom Comparators**: Use custom comparison functions for complex objects/arrays
5. **Debug Mode**: Enable debug mode during development to track state changes
6. **Component Functions**: Break complex UIs into reusable component functions
7. **Update Method**: Use `state.update()` for derived state calculations

## Debugging

Enable debug mode for any state to log changes to the console:

```javascript
const debugState = new r.State(0, { debug: true });
debugState.set(5);  // Logs: State changed from 0 to 5
```

## Browser Compatibility

RSF uses ES5/ES6 features with broad browser support:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills for features like `Object.assign`)

## License

MIT License - feel free to use in personal and commercial projects.

## Contributing

Bug reports and feature requests are welcome! Please feel free to submit issues.
