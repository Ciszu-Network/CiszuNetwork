/**
 * MuzicMania - Global Error Handling & Logging Bridge
 */

export const MuzicError = {
    // Current directory depth for correct asset path resolution
    basePath: (function () {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - (path.endsWith('/') ? 1 : 0);
        // Special case for local file system (e:/...)
        if (window.location.protocol === 'file:') {
            const parts = path.split('/').filter((p) => p.length > 0);
            const rootIndex = parts.findIndex((p) => p.toLowerCase() === 'muzicmania');
            if (rootIndex !== -1) {
                return '../'.repeat(parts.length - rootIndex - 1);
            }
        }
        return '../'.repeat(Math.max(0, depth - 1));
    })(),

    /**
     * Reports an error to the server logs and optionally redirects to 404
     * @param {string} message Error message
     * @param {boolean} fatal If true, redirects to 404.html
     * @param {object} details Additional error info (stack, etc)
     */
    report: function (message, fatal = false, details = null) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            message: message,
            details: details,
            userAgent: navigator.userAgent,
        };

        console.error('[MuzicError]', errorInfo);

        // Ping the server logs via a non-existent URL that carries the info
        // This will show up in the python server logs (redirected to our .txt file)
        const logMsg = encodeURIComponent(
            `[JS_ERROR] ${message} | URL: ${window.location.pathname}`
        );
        const pingImg = new Image();
        pingImg.src = `${this.basePath}INTERNAL_LOG_PING?msg=${logMsg}&fatal=${fatal}`;

        if (fatal) {
            // Give time for the "ping" to hit the server before redirecting
            setTimeout(() => {
                window.location.href = `${this.basePath}404.html?error=${encodeURIComponent(message)}`;
            }, 300);
        }
    },
};

// --- Initialization ---

if (typeof window !== 'undefined') {
    // 1. Capture Global Runtime Errors
    window.onerror = function (message, source, lineno, colno, error) {
        MuzicError.report(message, false, {
            source: source,
            line: lineno,
            column: colno,
            stack: error ? error.stack : 'N/A',
        });
        return false; // Let default browser handling occur too
    };

    // 2. Capture Unhandled Promise Rejections
    window.onunhandledrejection = function (event) {
        MuzicError.report(`Unhandled Rejection: ${event.reason}`, false, {
            reason: event.reason,
        });
    };

    // 3. Optional: Capture Resource Load Failures (Images/Scripts)
    window.addEventListener(
        'error',
        function (event) {
            if (
                event.target &&
                (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT')
            ) {
                // We exclude layout.js and errors.js themselves to avoid loops
                const src = event.target.src || event.target.href;
                if (src && !src.includes('errors.mjs') && !src.includes('layout.mjs')) {
                    MuzicError.report(`Resource failed to load: ${src}`, false);
                }
            }
        },
        true
    );

    // Export to window for global access
    window.MuzicError = MuzicError;
}

console.log('🛡️ MuzicMania Error Sentinel Active (ESM)');
