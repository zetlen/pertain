const assert = require('assert');
const pertainCjs = require('./pertainCjs');

assert.equal(typeof pertainCjs, 'function', 'CommonJs default must be the pertain function');
assert.equal(typeof pertainCjs.resolver, 'function', 'CommonJS must export pertain.resolver function');
assert.equal(typeof pertainCjs.clearCache, 'function', 'CommonJS must export pertain.clearCache function');
