Scans all explicitly declared package dependencies in the current project for code with a particular purpose, and run that code.


### Registering

#### Examples

To make a package that `pertain` can automatically call when it's a listed dependency, put a [`directories` property][https://docs.npmjs.com/files/package.json#directories] in your `package.json`:

```json
{
  "name": "potluck-guest-grandma",
  "directories": {
    "lib": "./lib",
    "doc": "./doc",
    "desserts": "./potluck/desserts"
  }
}
```

When `potluck-guest-grandma` is installed in a project, and code in that project runs `pertain("desserts")`, then Pertain will load `potluck-guest-grandma/potluck/desserts.js`.

-----

If `potluck-guest-grandma` depends on another package that pertains to the same topic, it should list that package in `peerDependencies`:

```json
{
  "name": "potluck-guest-grandma",
  "directories": {
    "lib": "./lib",
    "doc": "./doc",
    "desserts": "./potluck/desserts"
  },
  "peerDependencies": {
    "pie-baking-aunt": "^1.2.0"
  }
}
```

If this is declared, then Pertain will call `potluck-guest-grandma` after `pie-baking-aunt` by default.

### Calling

#### Examples

To get all dependencies with a directory called `desserts` labeled in `package.json`:

```js
const pertain = require('pertain');

const desserts = pertain(rootDir, 'desserts');

const dessertTable = {};

for (const dessertFile of desserts) {
  // Require and execute the module.
  const Dessert = require(dessertFile);
  // Expect that a dessert will be a class. Provide it with the table
  // everything else has set, so it can interact with other dependencies.
  const dessert = new Dessert(dessertTable);
  
  // Expect Dessert#serve() to run a side effect.
  dessert.serve();
}
```