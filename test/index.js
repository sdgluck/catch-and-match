'use strict';

var catchAndMatch = require('../index.js');

describe('Catch and match', function () {

    const throwFns = {
        sync: () => {
            throw new Error('the error message');
        },
        async: () => {
            return new Promise((resolve, reject) => {
                reject(new Error('the error message'));
            });
        }
    };

    function doesNotThrow () {}

    Object.keys(throwFns).forEach(function (fnType) {

        const throws = throwFns[fnType];

        describe(fnType + ' fn', function () {

            describe('with string matcher', function () {

                it('should fail when fn does not throw', function (cb) {
                    catchAndMatch(doesNotThrow, 'error message', function (err) {
                        if (err.message === 'no error thrown') {
                            cb();
                            return;
                        }
                        cb(new Error('did not fail'));
                    });
                });

                it('should fail when fn throws with unmatched message', function (cb) {
                    catchAndMatch(throws, 'unmatched', function (err) {
                        if (err.message.includes('satisfy')) {
                            cb();
                            return;
                        }
                        cb(new Error('did not fail'));
                    });
                });

                it('should succeed when fn throws with matched message using callback', function (cb) {
                    catchAndMatch(throws, 'error message', cb);
                });

                it('should succeed when fn throws with matched message using Promise', function () {
                    return catchAndMatch(throws, 'error message');
                });
            });

            describe('with RegExp matcher', function () {

                it('should fail when fn does not throw', function (cb) {
                    catchAndMatch(doesNotThrow, /error message/, function (err) {
                        if (err.message === 'no error thrown') {
                            cb();
                            return;
                        }
                        cb(new Error('did not fail'));
                    });
                });

                it('should fail when fn throws with unmatched message', function (cb) {
                    catchAndMatch(throws, /unmatched/, function (err) {
                        if (err.message.includes('satisfy')) {
                            cb();
                            return;
                        }
                        cb(new Error('did not fail'));
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
                        return err.message.includes('error message');
                    }, function (err) {
                        if (err.message === 'no error thrown') {
                            cb();
                            return;
                        }
                        cb(new Error('did not fail'));
                    });
                });

                it('should fail when fn throws with unmatched message', function (cb) {
                    catchAndMatch(throws, function (err) {
                        return err.message.includes('unmatched');
                    }, function (err) {
                        if (err.message.includes('satisfy')) {
                            cb();
                            return;
                        }
                        cb(new Error('did not fail'));
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
    });
});
