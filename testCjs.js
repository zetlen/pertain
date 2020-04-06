const assert = require('assert');
const pertainCjs = require('./pertainCjs');

assert.equal(typeof pertainCjs, 'function', 'CommonJs default must be the pertain function');

const allExports = [
  'resolver',
  'clearCache',
  'ExplicitDependencySet',
  'ExplicitDependency',
  'TopologicalSorter'
];

allExports.forEach(name => {
  assert.equal(typeof pertainCjs[name], 'function', `CommonJS adapter must export ${name} as pertain.${name}`);
});

console.warn('All expected exports present:', allExports.map(x => `\n - pertain.${x}`).join(''));
