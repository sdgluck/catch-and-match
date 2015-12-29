# catch-and-match

> Assert an error thrown (a)synchronously by a function meets some criteria.

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/catch-and-match"><img alt="npm version" src="https://badge.fury.io/js/catch-and-match.svg"></a>
<a href="https://travis-ci.org/sdgluck/catch-and-match"><img alt="CI build status" src="https://travis-ci.org/sdgluck/catch-and-match.svg"></a>

## Install

    npm install catch-and-match --save-dev

## Catch and Match

Sometimes asserting that something _just throws_ isn't enough. `catch-and-match` allows you to assert that a function
which should throw _throws the error you expect_. This is particularly useful for testing functions that produce error
messages which provide useful feedback (the best kind of functions!).

## Usage

`catchAndMatch(fn, matcher[, cb])`

__fn__ {Function} function that should throw traditionally or within a Promise

- if `fn` does not throw, catch and match returns a rejected Promise and calls `cb` with an error as its first argument
- if `fn` throws the error is tested against `matcher` (see below)

__matcher__ {RegExp|String|Function} method of inspecting error:

- a Function is passed the Error and should return true when the test should pass
- a String is turned to simple RegExp (`new RegExp(str)`)
- a RegExp is tested against the Error message (`re.test(err.message)`)

__cb__ {Function} error-first callback indicating success of catch and match

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

