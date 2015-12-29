'use strict';

/**
 * Invoke a function within a try block expecting an error to be thrown
 * and match the error message against a regular expression. The function returns a
 * Promise on success or you can pass it an optional callback if your test suite uses
 * callbacks to accommodate asynchronicity.
 *
 * @param {Function} fn function to execute within a try/catch
 * @param {RegExp|String|Function|Error} matcher to match error against
 * @param {Function} [cb] callback to invoke on success
 * @returns {Promise|undefined} returns resolved Promise on success
 * @throws Error when `fn` does not throw or error does not satisfy `matcher`
 */
export default function catchAndMatch (fn, matcher, cb) {

    if (typeof fn !== 'function') {
        throw new Error('fn should be a function');
    }
    if (!(matcher instanceof RegExp) && ['function', 'string'].indexOf(typeof matcher) === -1) {
        throw new Error('matcher should be a string, function, or regular expression');
    }
    if (cb && typeof cb !== 'function') {
        throw new Error('cb should be a function');
    }

    function doesMatch (_value, err) {
        const value = typeof _value === 'string' ?
            new RegExp(_value) :
            _value;
        if (value instanceof RegExp) {
            return value.test(err.message);
        }
        else if (typeof value === 'function') {
            return value(err);
        }
    }

    return Promise
        .resolve(fn())
        .then(() => {
            if (cb) {
                cb(new Error('no error thrown'));
            }
            return Promise.reject();
        }, (err) => {
            if (doesMatch(matcher, err)) {
                if (cb) {
                    cb();
                }
                return Promise.resolve();
            }
            if (cb) {
                cb(new Error('error does not satisfy matcher'));
            }
            return Promise.reject();
        });
}
