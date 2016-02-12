'use strict';

/**
 * Validate the arguments that are given to `catchAndMatch`.
 * Return an Error when one of these arguments is not of an expected type.
 * @param {Function} fn
 * @param {Object} matcher
 * @param {Function|undefined} cb
 * @return {Error}
 */
function isIllegalArguments ({ fn, matcher, cb }) {
    if (typeof fn !== 'function') {
        return new Error('Expected fn to be a Function');
    }
    if (typeof cb !== 'function') {
        return new Error('Expected cb to be a Function');
    }
    if (
        !(matcher instanceof RegExp) &&
        ['function', 'string'].indexOf(typeof matcher) === -1 &&
        matcher.constructor !== Error.constructor
    ) {
        return new Error('Expected matcher to be a String/Function/RegExp/Error');
    }
}

/**
 * Determine if the given `err` satisfies the criteria defined by `matcher`:
 *  - if `matcher` is a String, match the error's message against it as a regular expression.
 *  - if `matcher` is a Function, call the function with `err` and return the result.
 *  - if `matcher` is an Error, expect their constructors to be the same.
 * @param {Object} matcher matcher
 * @param {Error} err error to match against
 * @returns {Boolean}
 */
function doesMatch ({ matcher, err }) {
    if (typeof matcher === 'string') {
        return new RegExp(matcher).test(err.message);
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
 * Invoke a function expecting an error to be thrown.
 * If an error is not thrown, call `cb` with an error and return a rejected Promise.
 * @param {Function} fn function to execute within a try/catch
 * @param {RegExp|String|Function|Error} matcher to match error against
 * @param {Function} [cb] callback to invoke on success
 * @returns {Promise} returns resolved Promise on success
 * @throws Error when `fn` does not throw or error does not satisfy `matcher`
 */
function catchAndMatch (fn, matcher, cb) {
    return isIllegalArguments({ fn, matcher, cb })
        .then(fn, err => {
            throw err;
        })
        .then(() => {
            // If we got here the function did not throw an error
            const error = new Error('No error thrown');
            if (cb) cb(error);
            return Promise.reject(error);
        }, (err) => {
            // Error was thrown - check that it satisfies the matcher
            if (doesMatch({ matcher, err })) {
                if (cb) cb();
                return Promise.resolve();
            }
            const error = new Error('Error does not satisfy matcher');
            if (cb) cb(error);
            return Promise.reject(error);
        });
}

/* global define:false window:false */
if (typeof define === 'function' && define.amd) {
    define('catchAndMatch', catchAndMatch);
}
else if (typeof exports === 'object') {
    module.exports = catchAndMatch;
}
else if (typeof window !== 'undefined') {
    window.catchAndMatch = catchAndMatch;
}
else {
    const issuesUrl = 'https://github.com/sdgluck/catch-and-match/issues';
    throw new Error(`Environment is not supported. Please raise an issue (${issuesUrl})`);
}
