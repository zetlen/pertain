# pertain 📋 <img alt="NodeJS" src="https://img.shields.io/node/v/pertain?logo=javascript&style=for-the-badge" align="right" valign="bottom">

[![npm version](https://img.shields.io/npm/v/pertain)](https://npmjs.com/package/pertain)
[![codecov](https://codecov.io/gh/zetlen/pertain/branch/master/graph/badge.svg)](https://codecov.io/gh/zetlen/pertain)
![snyk](https://img.shields.io/snyk/vulnerabilities/npm/pertain)
[![npm downloads](https://img.shields.io/npm/dt/pertain?logo=npm)](https://npmjs.com/package/pertain)

## the easiest way to build a pluggable library

Scan all explicitly declared package dependencies in the current project for Node modules that declare a particular purpose.

### Usage

You want to detect which of a project's dependencies can do a particular task. _No, that's too abstract._

**You're throwing a potluck dinner party with NodeJS.** You're listing your guests as dependencies, and inviting them over with `npm install`.

##### potluck/package.json
```json
{
  "name": "@my-house/potluck",
  "version": "1.0.0",
  "description": "Come over Saturday!",
  "dependencies": {
    "aunt-cathy": "^1.2.3",
    "@work/cornelius": "^4.3.1",
    "grandma": "^23.0.1",
    "philippe": "^0.5.0"
  }
}
```

You have cleverly selected family and friends who can cook. But you don't know what each of them wants to bring. How do you set the dang table?

##### potluck/prep.js
```js
const cathy = require('aunt-cathy');
const cornelius = require('@work/cornelius');
const grandma = require('grandma');
const philippe = require('philippe');

let numSoups = 0;
numSoups += cathy.howManySoups();
numSoups += cornelius.howManySoups();
numSoups += grandma.howManySoups();
numSoups += philippe.howManySoups();


const shoppingList = [
  `${numSoups} tureens`,
  `${numSoups * 2} ladles`
];
```

That's a lot of manual work to build a whole shopping list. Plus, you get some updates from your guests:

- Aunt Cathy can no longer make it!
  - `npm remove aunt-cathy`
  - Now the first line of `prep.js` will throw an exception.
- Cornelius has joined a cult that is against soups.
  - `cornelius.howManySoups()` will now throw a `BlasphemyError`.
- As a last minute substitute, you invite Cousin Toddwick. Maybe he cooks, right?
  - `npm install cousin-todd`
  - He's not mentioned in `prep.js` though!

You could manually edit `prep.js`, but it doesn't seem efficient, especially with more guests.

Like any good party planner, you ask all your guests to tell _you_ what they're bringing.

>Hey potluck pals! Could you each please add a `potluck` property to your `package.json` file?
>It should be the path of a module which exports an array of the dishes you'd like to make!

Some guests follow suit.

##### @work/cornelius/package.json
```json
{
  "name": "@work/cornelius",
  "version": "4.4.0",
  "potluck": "./potluck-dishes.js"
}
```

##### @work/cornelius/potluck-dishes.js
```js
const favorites = [
  'tomato soup',
  'brownies',
  'fondue'
];

// EDIT 20XX: SOUP IS EVIL
favorites = favorites.slice(1);

module.exports = favorites;
```

-----

##### grandma/package.json
```json
{
  "name": "grandma",
  "version": "23.0.2",
  "potluck": "./recipes"
}
```

##### grandma/recipes/index.js
```js
module.exports = [
  'perfect enchiladas',
  'amazing pie',
  'awesome tortilla soup'
];
```

-----

##### philippe/package.json
```json
{
  "name": "philippe",
  "version": "0.5.1",
  "potluck": "./scrapbook/food-ideas"
}
```

##### philippe/scrapbook/food-ideas.js
```js
module.exports = [
  'haricots verts',
  'vichysoisse soup'
];
```


The next time you update your dependencies, three of your guests have declared that they know how to `potluck`.
Each of those declarations lists a Node module exporting a list.

This is going to make shopping easier.

```js
const pertain = require('pertain');

const dishBringers = pertain('./', 'potluck');
```

You call `pertain` with the current directory to say "get the dependencies of whatever invoked this process".
(In this case, that's your own `prep.js` script, but you always have to tell it.)
To the second argument of `pertain`, you say `'potluck'`.

This is what `pertain` returns:

```json
[
  {
    "name": "@work/cornelius",
    "path": "/home/potluck/node_modules/@work/cornelius/potluck-dishes.js",
    "modulePath": "/home/potluck/node_modules/@work/cornelius",
    "subject": "potluck"
  },
  {
    "name": "grandma",
    "path": "/home/potluck/node_modules/grandma/recipes/index.js",
    "modulePath": "/home/potluck/node_modules/grandma",
    "subject": "potluck"
  },
  {
    "name": "philippe",
    "path": "/home/potluck/node_modules/philippe/scrapbook/food-ideas.js",
    "modulePath": "/home/potluck/node_modules/philippe",
    "subject": "potluck"
  }
]
```

Pertain has resolved each of those module paths to their actual location, so you can `require()` them no matter what context you're in.
Let's map it into a list.

```js
const allDishes = dishBringers.map((dishes, guest) => dishes.concat(require(guest.path)));
```

That code will run each named module in each package with `potluck`. Then it concatenates all the lists together. Now `allDishes` is:

```js
[
  'brownies',
  'fondue',
  'perfect enchiladas',
  'amazing pie',
  'awesome tortilla soup',
  'haricots verts',
  'vichysoisse soup'
]
```

And here's our new, simpler prep:

##### potluck/prep.js
```js
const pertain = require('pertain');

const dishBringers = pertain('./', 'potluck');

const allDishes = dishBringers.map((dishes, guest) => dishes.concat(require(guest.path)));

const soups = allDishes.filter(dish => dish.includes('soup'));

const shoppingList = [
  `${soups.length} tureens`,
  `${soups.length * 2} ladles`
];
```

That'll hold up better to changes.

**This is an ultra-simple example. You can have multiple subjects in the same package, and subjects can be complex objects which you reference with dot-lookup. More TBD.**

#### Other Examples

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

Supply a custom `getDependencies(found, packageJson, rootDir, subject)` function to customize how pertain finds the list of dependency names.
Its first argument is a union of `dependencies` and `devDependencies`, and by default it simply returns that argument.
This is useful for when you are developing a pertinent package and linking it via `npm link` to the consuming package.

```js
const pertain = require('pertain');

const desserts = pertain(
  process.cwd(),
  'potluck.desserts',
  deps => deps.concat(['neighbor-window-pie'])
);

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

### API

#### `pertain(workingDirectory, subject, getDependencies?)`

Return an array of module info, sorted in peer dependency order, for all modules declared as _direct dependencies_ of the package root of `workingDirectory`. Filter those modules for only those which:
- declare a property named `subject` in their `package.json` file
- that property lists a JS module which can be resolved with `require()`

Returned module info is an array of objects with the following properties:
- `name`: The name of the dependency package, e.g. `left-pad`.
- `path`: The real filesystem path of the module file mentioned in the `subject` field
- `modulePath`: The real filesystem path of the found module _base directory_
- `subject`: The originally argued subject string

*The `subject` can be a dot-lookup path, e.g. `"foo.bar"`, which will then look for `"foo": { "bar": "./path" }` in the package.*

#### `pertain.clearCache()`

Pertain caches expensive operations on the same package for the same subject. Use this method to clear that cache.
