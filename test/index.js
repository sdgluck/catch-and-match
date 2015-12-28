'use strict';

var catchAndMatch = require('../index.js');

describe('Catch and match', function () {

    function throws () {
        throw new Error('the error message');
    }

    function doesNotThrow () {}

    describe('with string matcher', function () {

        it('should fail when fn does not throw', function (cb) {
            catchAndMatch(doesNotThrow, /error message/, function (err) {
                if (err) {
                    cb();
                }
            });
        });

        it('should fail when fn throws with unmatched message', function (cb) {
            catchAndMatch(throws, /unmatched/, function (err) {
                if (err) {
                    cb();
                }
            });
        });

        it('should succeed when fn throws with matched message using callback', function (cb) {
            catchAndMatch(throws, /error message/, cb);
        });

        it('should succeed when fn throws with matched message using Promise', function () {
            return catchAndMatch(throws, /error message/);
        });
    });

    describe('with function matcher', function () {

        it('should fail when fn does not throw', function (cb) {
            catchAndMatch(doesNotThrow, function (err) {
                return err.message.indexOf('error message') > -1;
            }, function (err) {
                if (err) {
                    cb();
                }
            });
        });

        it('should fail when fn throws with unmatched message', function (cb) {
            catchAndMatch(throws, function (err) {
                return err.message.indexOf('unmatched') > -1;
            }, function (err) {
                if (err) {
                    cb();
                }
            });
        });

        it('should succeed when fn throws with matched message using callback', function (cb) {
            catchAndMatch(throws, function (err) {
                return err.message.indexOf('error message') > -1;
            }, cb);
        });

        it('should succeed when fn throws with matched message using Promise', function () {
            return catchAndMatch(throws, function (err) {
                return err.message.indexOf('error message') > -1;
            });
        });
    });
});
