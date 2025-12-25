/**
 * Development-only logger
 * Logs are only output when NODE_ENV is 'development'
 */

const isDev = process.env.NODE_ENV === 'development';

export const devLog = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    error: (...args: unknown[]) => {
        // Errors are always logged (useful for debugging production issues)
        console.error(...args);
    },
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
};

export default devLog;
