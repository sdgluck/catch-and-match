# catch-and-match

> A simple utility for testing and inspecting an error thrown by a function.

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/catch-and-match"><img alt="npm version" src="https://badge.fury.io/js/catch-and-match.svg"></a>
<a href="https://travis-ci.org/sdgluck/catch-and-match"><img alt="CI build status" src="https://travis-ci.org/sdgluck/catch-and-match.svg"></a>

## Install

    npm install catch-and-match --save-dev

## Catch and Match

Sometimes asserting that something _just throws_ isn't enough. `catch-and-match` allows you to assert that a function
which should throw _throws an error you expect_. This is particularly useful for testing modules that produce error
messages which change... so, pretty much any module that provides useful feedback (the best kind of modules!).

## Usage

`catchAndMatch(fn, matcher[, cb])`

__fn__ {Function} function that should throw

- if `fn` does not throw, catch and match returns a rejected Promise and calls `cb` with an error as its first argument
- if `fn` throws the error is tested against `matcher` (see below)

__matcher__ {RegExp|String|Function} method of inspecting error:

- a Function is passed the Error and should return true when the test should pass
- a String is turned to simple RegExp (`new RegExp(str)`)
- a RegExp is tested against the Error message (`re.test(err.message)`)

__cb__ {Function} error-first callback indicating success of catch and match

## Example Usage

    function log (str) {
        if (typeof str !== 'string') {
            throw new Error('str should be a string');
        }
        console.log(str);
    }

    // Passes with string matcher
    it('should throw an error without correct arguments', function (cb) {
        catchAndMatch(log.bind(undefined, 'hello'), /should be a string/, cb);
        // or, using Promises:
        // return catchAndMatch(log.bind(undefined, 'hello'));
    });

    // Fails with RegExp matcher
    it('should throw an error without correct arguments', function (cb) {
        catchAndMatch(log.bind(undefined, 10), /should be a string/, cb);
        // or, using Promises:
        // return catchAndMatch(log.bind(undefined, 10));
    });

    // Passes with function matcher
    it('should throw an error without correct arguments', function () {
        return catchAndMatch(log.bind(undefined, 10), function (err) {
            return err.indexOf('should be a string') !== -1;
        });
    });

