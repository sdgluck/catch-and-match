'use strict';

/**
 * Validate arguments given to `catchAndMatch`.
 * @param {Function} fn
 * @param {Object} matcher
 * @param {Function|undefined} cb
 */
function validateArguments (fn, matcher, cb) {
    if (typeof fn !== 'function') {
        throw new Error('fn should be a function');
    }
    if (
        !(matcher instanceof RegExp) &&
        ['function', 'string'].indexOf(typeof matcher) === -1 &&
        matcher.constructor !== Error.constructor
    ) {
        throw new Error('matcher should be a string, function, regular expression, or Error');
    }
    if (cb && typeof cb !== 'function') {
        throw new Error('cb should be a function');
    }
}

/**
 * Determine if the given error satisfies the matcher defined by `_matcher`.
 * @param {Object} _matcher matcher
 * @param {Error} err error to match against
 * @returns {Boolean}
 */
function doesMatch (_matcher, err) {
    const matcher = typeof _matcher === 'string' ?
        new RegExp(_matcher) :
        _matcher;
    if (matcher instanceof RegExp) {
        return matcher.test(err.message);
    }
    else if (typeof matcher === 'function') {
        return matcher(err);
    }
    else if (matcher.constructor === Error.constructor) {
        return err instanceof matcher;
    }
    return false;
}

/**
 * Invoke a function within a try block expecting an error to be thrown
 * and match the error message against a regular expression. The function returns a
 * Promise on success or you can pass it an optional callback if your test suite uses
 * callbacks to accommodate asynchronicity.
 * @param {Function} fn function to execute within a try/catch
 * @param {RegExp|String|Function|Error} matcher to match error against
 * @param {Function} [cb] callback to invoke on success
 * @returns {Promise|undefined} returns resolved Promise on success
 * @throws Error when `fn` does not throw or error does not satisfy `matcher`
 */
function catchAndMatch (fn, matcher, cb) {

    validateArguments(fn, matcher, cb);

    return Promise
        .resolve()
        .then(fn)
        .then(() => {
            const error = new Error('no error thrown');
            if (cb) cb(error);
            return Promise.reject(error);
        }, (err) => {
            if (doesMatch(matcher, err)) {
                if (cb) cb();
                return Promise.resolve();
            }
            const error = new Error('error does not satisfy matcher');
            if (cb) cb(error);
            return Promise.reject(error);
        });
}

/* global define:false window:false */
if (typeof define === 'function' && define.amd) {
    define('catchAndMatch', catchAndMatch);
}
else if (typeof module === 'object' && module.exports) {
    module.exports = catchAndMatch;
}
else {
    window.catchAndMatch = catchAndMatch;
}
