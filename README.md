# catch-and-match

> Assert an error thrown (a)synchronously by a function.

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/catch-and-match"><img alt="npm version" src="https://badge.fury.io/js/catch-and-match.svg"></a>
<a href="https://travis-ci.org/sdgluck/catch-and-match"><img alt="CI build status" src="https://travis-ci.org/sdgluck/catch-and-match.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Install

    npm install catch-and-match --save-dev

## Catch and Match

Sometimes asserting that something _just throws_ isn't enough. `catch-and-match` allows you to assert that a function
which should throw _throws the error you expect_. This is particularly useful for testing functions that produce error
messages which provide useful feedback (the best kind of functions!).

__Assert error is an instance of Error__ (e.g. ReferenceError)

Replace a traditional try/catch

    it('should throw a ReferenceError', function (cb) {
        // Without catch-and-match                   |  // With catch-and-match
        try {                                        |  catchAndMatch(
            String(a);  // a === undefined           |      () => String(a),
        } catch (err) {                              |      ReferenceError,
            if (!(err instanceof ReferenceError)) {  |      cb);
                cb(new Error());                     |
                return;                              |  // Or return a Promise
            }                                        |  return catchAndMatch(
            cb();                                    |      () => String(a),
        }                                            |      ReferenceError);
    });

Replace catching a rejected Promise

    it('should throw a ReferenceError', function () {
        // Without catch-and-match                       |  // With catch-and-match
        return someFuncThatRejects()                     |  catchAndMatch(
            .catch((err) => {                            |      someFuncThatRejects,
                if (!(err instanceof ReferenceError)) {  |      ReferenceError);
                    throw err;                           |
                }                                        |
            });                                          |
    });

__Assert error message using a regular expression__

    it('should throw with error message containing "not defined"', function (cb) {
        return catchAndMatch(() => String(a), /not defined/);
    });

__Assert error message using a string__

    it('should throw with error message "a is not defined"', function (cb) {
        return catchAndMatch(() => String(a), 'a is not defined');
    });

__Assert error matches custom validation__

    it('should throw with error message "a is not defined"', function (cb) {
        return catchAndMatch(() => String(a), function (err) {
            return err.message === 'a is not defined';
        });
    });

## Usage

`catchAndMatch(fn, matcher[, cb]) : Promise`

__fn__ {Function} function that should throw traditionally or within a Promise

- if `fn` does not throw, `catch-and-match` returns a rejected Promise and calls `cb` with an error as its first argument
- if `fn` throws the error is tested against `matcher` (see below)

__matcher__ {RegExp|String|Function|Error} method of inspecting error:

- a Function is passed the error and should return true when the test should pass
- a String is turned to simple RegExp (`new RegExp(str)`)
- a RegExp is tested against the error message (`re.test(err.message)`)
- an Error (any constructor that inherits from `Error`) is matched against the error (e.g. `err.constructor === ReferenceError`)

__cb__ {Function} _(optional)_ error-first callback

## Examples

If in your tests you are placing function invocations within a `try` block to purposefully cause them to throw and then
calling the test's 'done' callback within the `catch` after inspecting the error, you can replace this pattern with a
`catchAndMatch`:

__Example function__

    function log (str) {
        if (typeof str !== 'string') {
            throw new Error('str should be a string');
        }
        console.log(str);
    }

__Before__

    it('should throw an error without correct arguments', function (cb) {
        try {
            // make the function throw by passing an illegal argument
            log(10);
        } catch (err) {
            // inspect that the error thrown has the right message
            if (err.message.includes('should be a string')) {
                cb();
                return;
            }
            // the wrong error was thrown, so fail the test
            cb(new Error('wrong error thrown'));
        }
    });

__After, using Promise__

    // Passes with string matcher
    it('should throw an error without correct arguments', function () {
        return catchAndMatch(log.bind(undefined, 'hello'), /should be a string/);
    });

    // Passes with function matcher
    it('should throw an error without correct arguments', function () {
        return catchAndMatch(log.bind(undefined, 10), function (err) {
            return err.includes('should be a string');
        });
    });

__After, using callback__

    // Fails with RegExp matcher
    it('should throw an error without correct arguments', function (cb) {
        catchAndMatch(log.bind(undefined, 10), /should be a string/, cb);
    });

## Contributing

All pull requests and issues welcome!

If you're not sure how, check out Kent C. Dodds' [great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!
