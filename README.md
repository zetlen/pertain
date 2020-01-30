# pertain

## the easiest way to build a pluggable library

Scan all explicitly declared package dependencies in the current project for code with a particular purpose, and run that code.

### Registering

#### Examples

To make a package that `pertain` can automatically call when it's a listed dependency, declare a custom property in your `package.json`:

```json
{
  "name": "potluck-guest-grandma",
  "description": "You're lucky she's coming",
  "potluck": {
    "desserts": "./potluck/desserts"
  }
}
```

When `potluck-guest-grandma` is installed in a project, and code in that project runs `pertain("potluck.desserts")`, then Pertain will load `potluck-guest-grandma/potluck/desserts.js`.

---

If `potluck-guest-grandma` depends on another package that pertains to the same topic, it should list that package in `peerDependencies`:

```json
{
  "name": "potluck-guest-grandma",
  "description": "You're lucky she's coming",
  "potluck": {
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

To get all dependencies with `potluck.desserts` labeled in `package.json`:

```js
const pertain = require('pertain');

const desserts = pertain(process.cwd(), 'potluck.desserts');

const dessertTable = {};

for (const dessertFile of desserts) {
  // Require and execute the module.
  const Dessert = require(dessertFile.path);
  // Expect that a dessert will be a class. Provide it with the table
  // everything else has set, so it can interact with other dependencies.
  const dessert = new Dessert(dessertTable);

  // Expect Dessert#serve() to run a side effect.
  dessert.serve();
}
```
