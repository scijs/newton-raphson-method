'use strict';

var nr = require('../');

function f (x) { return (x - 1) * (x + 2); }
function fp (x) { return (x - 1) + (x + 2); }

console.log('Using the derivative:', nr(f, fp, 0, {verbose: true}));

console.log('Using numerical first derivative:', nr(f, 0, {verbose: true}));

