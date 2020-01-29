import pkgDir from 'pkg-dir';
import PertainError from './PertainError';

export default class Resolver {
  /**
   * The package this resolver is resolving _from_. Any returned paths should
   * be reachable from `require()` from JS code living in this path.
   */
  private _root: string;

  constructor(root: string) {
    this._root = root;
  }

  /**
   * The entry point of the module; what loads when a dependent just calls
   * `require(moduleName)`. By default it is "moduleName/index.js" and an error
   * if that file does not exist, but it can be specified in the `"main"` field
   * of `package.json`. For instance, if `foo/package.json` defined `"main":
   * "./lib/foo.js"`, then this method would return `"foo/lib/foo.js".
   */
  entry(moduleName: string): string {
    try {
      return require.resolve(moduleName, { paths: [this._root] });
    } catch (e) {
      throw new PertainError(
        `Could not resolve module "${moduleName}" from context "${this._root}". \n\t${e.message}`
      );
    }
  }

  /**
   * The root directory of the module; the place where its package.json lives.
   * Calculated by walking up the directories from `Resolver#entry(moduleName)`
   * and looking for a `package.json` file.
   */
  rootDir(moduleName: string): string {
    const entry = this.entry(moduleName);
    const dir = pkgDir.sync(entry);
    if (!dir) {
      throw new PertainError(
        `Could not find package.json file near "${entry}"`
      );
    }
    return dir;
  }
}
