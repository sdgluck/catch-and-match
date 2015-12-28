'use strict';

/**
 * Invoke a function within a try block expecting an error to be thrown
 * and match the error message against a regular expression.
 *
 * The function returns a Promise on success or you can pass it an optional
 * callback if your test suite uses callbacks to accommodate asynchronicity.
 *
 * Example:
 * ```js
 * const funcThatThrows = () => throw new Error('an error occurred');
 * catchAndMatch(funcThatThrows, /error/, function () {
 *     console.log(
 *         `this is logged because error message
 *          produced by funcThatThrows matches /error/`
 *     );
 * });
 * ```
 *
 * @param {Function} fn function to execute within a try/catch
 * @param {RegExp|String|Function} matcher regular expression to match error message against
 * @param {Function} [cb] error-first callback to invoke on success
 * @returns {Promise}
 * @throws Error
 */
export default function catchAndMatch (fn, matcher, cb = function () {}) {

    if (typeof fn !== 'function') {
        throw new Error('fn should be a function');
    }
    if (!(matcher instanceof RegExp) && ['function', 'string'].indexOf(typeof matcher) === -1) {
        throw new Error('matcher should be a string, function, or regular expression');
    }
    if (typeof cb !== 'function') {
        throw new Error('cb should be a function');
    }

    function doesMatch (matcher, err) {
        if (typeof matcher === 'string') {
            matcher = new RegExp(matcher);
        }
        if (matcher instanceof RegExp) {
            return matcher.test(err.message);
        }
        else if (typeof matcher === 'function') {
            return matcher(err);
        }
    }

    try {
        const result = fn();
        const failed = () => {
            cb(new Error('no error thrown'));
            return Promise.reject('no error thrown');
        };
        if (result && typeof result.then === 'function') {
            return result
                .catch(cb.bind(undefined, undefined))
                .then(failed);
        } else {
            failed();
        }
    } catch (err) {
        if (doesMatch(matcher, err)) {
            cb();
            return Promise.resolve();
        }
        const failMessage = `error message "${err.message}" does not match regex "${matcher.toString()}"`;
        cb(new Error(failMessage));
        return Promise.reject(failMessage);
    }
};
