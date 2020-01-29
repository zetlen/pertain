/**
 * Throw this to visually indicate Pertain errors in stack traces with a tag.
 */
export default class PertainError extends Error {
  constructor(original: string | Error) {
    super(`[pertain] ${original}`);
    Error.captureStackTrace(this, PertainError);
  }
}
