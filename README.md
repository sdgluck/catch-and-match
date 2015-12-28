# catch-and-match

> A simple utility for testing and inspecting an error thrown by a function.

## Install

    $ npm install catch-and-match --save-dev

## Usage

`catchAndMatch(fn, matcher[, cb])`

__fn__ {Function} function that should throw

__matcher__ {RegExp|String|Function} method of inspecting error:

- a Function is passed the Error
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
        // catchAndMatch(log.bind(undefined, 10), cb);
    });

    // Passes with custom inspection
    it('should throw an error without correct arguments', function (cb) {
        return catchAndMatch(log.bind(undefined, 10), function (err) {
            return err.indexOf('should be a string') !== -1;
        });
    });

