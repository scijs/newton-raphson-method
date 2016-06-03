'use strict';

module.exports = newtonRaphson;

function newtonRaphson (f, fp, x0, options) {
  var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;

  // Iterpret variadic forms:
  if (typeof fp !== 'function') {
    options = x0;
    x0 = fp;
    fp = null;
  }

  options = options || {};
  tol = options.tolerance === undefined ? 1e-7 : options.tolerance;
  eps = options.epsilon === undefined ? 2.220446049250313e-16 : options.epsion;
  maxIter = options.maxIterations === undefined ? 20 : options.maxIterations;
  h = options.h === undefined ? 1e-4 : options.h;
  verbose = options.verbose === undefined ? false : options.verbose;
  hr = 1 / h;

  iter = 0;
  while (iter++ < maxIter) {
    // Compute the value of the function:
    y = f(x0);

    // Compute the second derivative using a fourth order central difference:
    if (fp) {
      yp = fp(x0);
    } else {
      // Needs first and second numerical derivatives:
      yph = f(x0 + h);
      ymh = f(x0 - h);
      yp2h = f(x0 + 2 * h);
      ym2h = f(x0 - 2 * h);

      yp = ((ym2h - yp2h) + 8 * (yph - ymh)) * hr / 12;
    }

    // Check for badly conditioned first derivative (extremely small relative to function):
    if (Math.abs(yp) <= eps * Math.abs(y)) {
      if (verbose) {
        console.log('Newton-Raphson: failed to converged due to nearly zero first derivative');
      }
      return false;
    }

    // Update the guess:
    x1 = x0 - y / yp;

    // Check for convergence:
    if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
      if (verbose) {
        console.log('Newton-Raphson: converged to x = ' + x1 + ' after ' + iter + ' iterations');
      }
      return x1;
    }

    // Transfer update to the new guess:
    x0 = x1;
  }

  if (verbose) {
    console.log('Newton-Raphson: Maximum iterations reached (' + maxIter + ')');
  }

  return false;
}
