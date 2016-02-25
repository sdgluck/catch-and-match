'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {
  'use strict';

  var ISSUES_URL = 'https://github.com/sdgluck/catch-and-match/issues';
  var UNRECOGNISED_MATCHER_ERR = 'Expected matcher to be a String/Function/RegExp/Error';

  /**
   * Validate the arguments that are given to `catchAndMatch`.
   * Return an Error when one of these arguments is not of an expected type.
   * @param {Function} fn
   * @param {Function|undefined} cb
   * @param {Object} matcher
   * @return {Promise}
   */
  function isIllegalArguments(_ref) {
    var fn = _ref.fn;
    var cb = _ref.cb;
    var matcher = _ref.matcher;

    if (typeof fn !== 'function') {
      return Promise.reject(new Error('Expected fn to be a Function'));
    }
    if (typeof cb !== 'undefined' && typeof cb !== 'function') {
      return Promise.reject(new Error('Expected cb to be a Function'));
    }
    if (!(matcher instanceof RegExp) && ['function', 'string'].indexOf(typeof matcher === 'undefined' ? 'undefined' : _typeof(matcher)) === -1 && matcher.constructor !== Error.constructor) {
      return Promise.reject(new Error(UNRECOGNISED_MATCHER_ERR));
    }
    return Promise.resolve();
  }

  /**
   * Determine if the given `err` satisfies the criteria defined by `matcher`:
   *  - if `matcher` is a String, expect the error message to contain `matcher`
   *  - if `matcher` is a RegExp, match the error message against it
   *  - if `matcher` is a Function, call the function with `err` and return the result
   *  - if `matcher` is an Error, expect their constructors to be the same
   * @param {Object} matcher error matcher
   * @param {Error} err error to match against
   * @returns {Boolean}
   */
  function doesMatch(_ref2) {
    var matcher = _ref2.matcher;
    var err = _ref2.err;

    if (typeof matcher === 'string') {
      return err.message.indexOf(matcher) > -1;
    }
    if (matcher instanceof RegExp) {
      return matcher.test(err.message);
    }
    if (typeof matcher === 'function') {
      return matcher(err);
    }
    if (matcher.constructor === Error.constructor) {
      return err instanceof matcher;
    }
    throw new Error(UNRECOGNISED_MATCHER_ERR);
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
  function catchAndMatch(fn, matcher, cb) {
    return isIllegalArguments({ fn: fn, matcher: matcher, cb: cb }).then(fn, function (err) {
      throw err;
    }).then(function () {
      // If we got here the function did not throw an error
      var error = new Error('No error thrown');
      if (cb) cb(error);
      return Promise.reject(error);
    }, function (err) {
      // Error was thrown - check that it satisfies the matcher
      if (doesMatch({ matcher: matcher, err: err })) {
        if (cb) cb();
        return Promise.resolve();
      }
      var error = new Error('Error does not satisfy matcher');
      if (cb) cb(error);
      return Promise.reject(error);
    });
  }

  /* global define:false window:false */
  if (typeof define === 'function' && define.amd) {
    define('catchAndMatch', catchAndMatch);
  } else if (typeof module !== 'undefined' && (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    module.exports = catchAndMatch;
  } else if (typeof window !== 'undefined') {
    window.catchAndMatch = catchAndMatch;
  } else {
    throw new Error('Environment is not supported. Please raise an issue at ' + ISSUES_URL);
  }
})();