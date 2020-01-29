import makeDebug from 'debug';
import path from 'path';
import PertainError from './PertainError';
import PackageJson from './PackageJson';

const debug = makeDebug('pertain:ExplicitDependency');

/**
 * A Node module that the consuming project (the one calling `pertain()`) has
 * declared in `dependencies` or `devDependencies`. These are the modules that
 * we check for the package property we're looking for.
 */
export default class ExplicitDependency {
  /**
   * Lazy-loading package.json data.
   */
  private pkg: PackageJson;
  /**
   * Real path on disk of this module.
   */
  private modulePath: string;
  /**
   * Cache storage to prevent unnecessary recalculation of the same list.
   * The same subject should result in the same list while this object exists.
   */
  private pertainCache: Map<string, string | boolean>;

  constructor(modulePath: string) {
    this.modulePath = modulePath;
    this.pertainCache = new Map();
    this.pkg = new PackageJson(modulePath);
  }

  /**
   * Returns true if this module has declared an explicit peer dependency on
   * the provided module name. Used to sort all pertaining modules into
   * dependency order.
   *
   * Why only a peer dependency? Because the consuming project doesn't want
   * `pertain()` to scan infinitely into the module tree; only first-level
   * dependencies can pertain. So the dependency order is only relevant to
   * the dependencies that the root project has directly declared.
   *
   * TL;DR if you're building an extension framework with `pertain()`, you
   * should require extensions to use `peerDependencies` when using other
   * extensions. Otherwise they're not guaranteed to run in the right order.
   */
  dependsOn(name: string) {
    return this.pkg.peerDependencies.hasOwnProperty(name);
  }

  /**
   * Returns a resolvable path to a JS module declared in this `package.json`,
   * at the JSON path supplied as `subject`. If no path exists, returns false.
   *
   * Example: If the subject is `"foo"`, AND `package.json` has a top-level
   * property `"foo": "./bar.js"`, then `this.pertains("foo")` will be
   * `"/path/to/this/module/bar.js"`.
   *
   * Dot notation lookup works: if the subject is `pwa.build`, then
   * `package.json`must have a top level `pwa` object with a `build` property.
   */
  pertains(subject: string) {
    const { pertainCache } = this;
    if (pertainCache.has(subject)) {
      return pertainCache.get(subject);
    }
    const pertaining = PackageJson.lookup(this.pkg, subject);
    if (!pertaining || typeof pertaining !== 'string') {
      debug(
        '%s: Subject %s resolved to %s',
        this.pkg.name,
        subject,
        pertaining
      );
      pertainCache.set(subject, false);
      return false;
    }
    debug(
      'found declaration of "%s" as "%s" in "%s"',
      subject,
      pertaining,
      this.pkg.name
    );
    const subscriber = path.resolve(this.modulePath, pertaining);
    try {
      const pertainingModule = require.resolve(subscriber);
      debug('found runnable module at %s', pertainingModule);
      pertainCache.set(subject, pertainingModule);
      return pertainingModule;
    } catch (e) {
      throw new PertainError(
        `"${this.pkg.name}" declares a "${subject}" module, but Node could not find a valid JS module to load from "${subscriber}"`
      );
    }
  }

  toString() {
    return `${this.pkg.name} @ ${this.modulePath}`;
  }
}
