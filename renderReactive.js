/**
 * Renders a reactive container that automatically re-renders when its internal state changes
 * @param {Object} r - RSF object
 * @param {*} initial - Initial state value
 * @param {Function} child - Render function (r, state) that receives the state
 * @param {Object} options - Configuration options (tag, class, style, etc.)
 * @returns {State} - The state object for external updates
 */
function renderReactive(r, initial, child, options = {}) {
    // Create internal state
    const state = new r.State(initial);

    // Extract tag (default to div) and remaining props
    const tag = options.tag || 'div';
    const props = { ...options };
    delete props.tag;

    // Add state to watch array
    if (props.watch) {
        props.watch.push(state);
    } else {
        props.watch = [state];
    }

    // Render the container with watched state
    r[tag](props, (r) => {
        child(r, state);
    });

    // Return state for external access
    return state;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = renderReactive;
} else if (typeof window !== 'undefined') {
    // Make globally available in browser
    window.renderReactive = renderReactive;
}
