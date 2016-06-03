'use strict';

var assert = require('chai').assert;
var newtonRaphson = require('../');
var almostEqual = require('almost-equal');
var isNumber = require('is-number');

assert.almostEqual = function (computed, expected, tol) {
  tol = tol === undefined ? almostEqual.FLT_EPSILON : tol;
  assert(isNumber(computed), 'Expected ' + computed + ' to be a number.');
  assert(almostEqual(expected, computed, tol, tol), 'Expected ' + computed + ' to equal ' + expected + ' (± ' + tol + ')');
};

describe('newton-raphson', function () {
  describe('failure modes', function () {
    it('returns false if div by zero encountered', function () {
      var root = newtonRaphson(
        function (x) { return 7; },
        function (x) { return 0; },
        2
      );
      assert.isFalse(root);
    });

    it('returns false if m = 0 encountered', function () {
      var root = newtonRaphson(
        function (x) { return 1; },
        function (x) { return 1; },
        2
      );
      assert.isFalse(root);
    });

    it('returns false if max iterations encountered', function () {
      // Construct a function that's always changing so will never converge:
      var c = 0;
      var root = newtonRaphson(
        function (x) { return ++c; },
        2
      );
      assert.isFalse(root);
    });
  });

  describe('using provided derivative', function () {
    it('finds the positive zero of x^2 + x - 2', function () {
      var root = newtonRaphson(
        function (x) { return x * x + x - 2; },
        function (x) { return 2 * x + 1; },
        2
      );
      assert.almostEqual(root, 1);
    });

    it('finds the positive root of x^3 - 3 * x + 2', function () {
      var root = newtonRaphson(
        function (x) { return x * x * x - 3 * x + 2; },
        function (x) { return 3 * x * x - 3; },
        3,
        {maxIterations: 30}
      );
      assert.almostEqual(root, 1);
    });

    it('finds the zero of cos(x) + 1 at x = pi', function () {
      var root = newtonRaphson(
        function (x) { return Math.cos(x) + 1; },
        function (x) { return -Math.sin(x); },
        3
      );
      assert.almostEqual(root, Math.PI);
    });

    it('finds the zero of sin(x) at x = pi', function () {
      var root = newtonRaphson(
        Math.sin,
        Math.cos,
        3
      );
      assert.almostEqual(root, Math.PI);
    });

    it('finds the zero of sin(x) at x = 0 given a guess of x = 0.5', function () {
      var root = newtonRaphson(
        Math.sin,
        Math.cos,
        0.5
      );
      assert.almostEqual(root, 0);
    });

    it('fails to find zeros of x^2 + 1', function () {
      var root = newtonRaphson(
        function (x) { return x * x + 1; },
        function (x) { return 2 * x; },
        2
      );
      assert.isFalse(root);
    });

    it('fails to find the zero of sin(x) at x = 0 given a guess of x = pi', function () {
      var root = newtonRaphson(
        Math.sin,
        Math.cos,
        Math.PI * 0.5
      );
      assert.isFalse(root);
    });

    describe('finds the positive zero of (x + 2) * (x - 1)^m for:', function () {
      for (var mm = 1; mm <= 14; mm++) {
        (function (m) {
          it('m = ' + m, function () {
            var root = newtonRaphson(
              function (x) { return (x + 2) * Math.pow(x - 1, m); },
              function (x) { return (x + 2) * m * Math.pow(x - 1, m - 1) + Math.pow(x - 1, m); },
              3,
              {maxIterations: 200}
            );
            assert.almostEqual(root, 1, 1e-5);
          });
        }(mm));
      }
    });
  });

  describe('using numerical first derivative', function () {
    it('finds the negative zero of x^2 + x - 2', function () {
      var root = newtonRaphson(
        function (x) { return x * x + x - 2; },
        -1
      );
      assert.almostEqual(root, -2);
    });

    it('finds the zero of sin(x) at x = 0 given a guess of x = 0.5', function () {
      var root = newtonRaphson(
        Math.sin,
        0.5,
        {h: 1e-6}
      );
      assert.almostEqual(root, 0);
    });

    it('finds the positive zero of x^2 + x - 2', function () {
      var root = newtonRaphson(
        function (x) { return x * x + x - 2; },
        2
      );
      assert.almostEqual(root, 1);
    });

    it('finds the zero of sin(x) at x = pi', function () {
      var root = newtonRaphson(
        Math.sin,
        3
      );
      assert.almostEqual(root, Math.PI);
    });

    it('finds the zero of cos(x) + 1 at x = pi', function () {
      var root = newtonRaphson(
        function (x) { return Math.cos(x) + 1; },
        3
      );
      assert.almostEqual(root, Math.PI);
    });

    it('fails to find the zero of sin(x) at x = 0 given a guess of x = pi', function () {
      var root = newtonRaphson(
        Math.sin,
        Math.PI * 0.5
      );
      assert.isFalse(root);
    });

    describe('finds the positive zero of (x + 2) * (x - 1)^m for:', function () {
      for (var mm = 1; mm <= 14; mm++) {
        (function (m) {
          it('m = ' + m, function () {
            var root = newtonRaphson(
              function (x) { return (x + 2) * Math.pow(x - 1, m); },
              3,
              {h: 1e-7, maxIterations: 200}
            );
            assert.almostEqual(root, 1, 1e-5);
          });
        }(mm));
      }
    });
  });
});
