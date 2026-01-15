// Suppress console logs in production (HTTPS)
if (window.location.protocol === 'https:') {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.warn = noop;
    // Keep console.error for critical issues
}

export {};
