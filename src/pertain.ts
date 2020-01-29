import makeDebug from 'debug';
import path from 'path';
import ExplicitDependencySet from './ExplicitDependencySet';
import resolver from './resolver';
import PackageJson from './PackageJson';

const debug = makeDebug('pertain:main');

/**
 * A Node package which declares in its `package.json` file that it contains
 * a script module which pertains to a particular subject. Use this object
 * to require the pertaining module and/or report the name of the subscriber.
 */
export interface Pertaining {
  /**
   * The name of the package..
   * @example "@org/package-name"
   */
  name: string;
  /**
   * The filesystem path of the package's root directory.
   * @example "/var/www/venia/node_modules/@org/package-name"
   */
  path: string;
  /**
   * The subject that was originally passed to `pertain()` to produce this
   * object.
   * @example "pwa.webpack"
   */
  subject: string;
}

/**
 * Caches the ExplicitDependencySet calculated for a given project root.
 * It should not change during the lifetime of this process, so there's no
 * point in recalculating it.
 */
const dependencySetCache = new Map<string, ExplicitDependencySet>();

/**
 * Query the direct dependencies of the Node project at `rootDir` for all
 * packages which have a particular `package.json` property. Return them in
 * peerDependency order.
 */
function pertain(rootDir: string, subject: string): Pertaining[] {
  const absRoot = path.resolve(rootDir);
  let depSet = dependencySetCache.get(absRoot);
  if (!depSet) {
    debug('no cached depset for %s', absRoot);
    // A convenience function which can be replaced with an alternate resolver
    // algorithm.
    const resolve = resolver(absRoot);
    const { dependencies, devDependencies } = new PackageJson(absRoot);

    // Merging the two dependency sets that we look at will dedupe them.
    // We don't care whether it comes from devDependencies or dependencies.
    // Both are relevant, because many applications with a build step compile
    // code from devDependencies.
    const allDependencyNames = Object.keys(
      Object.assign({}, dependencies, devDependencies)
    );
    debug('%s allDependencyNames %s', absRoot, allDependencyNames);
    depSet = new ExplicitDependencySet(resolve, allDependencyNames);
    dependencySetCache.set(absRoot, depSet);
  }
  return depSet.pertaining(subject).map(dep => ({
    name: dep.name,
    path: dep.pertains(subject) as string,
    subject
  }));
}

/**
 * Clear out the cache of dependencies that have already been detected and
 * loaded. Use if the dependency graph changes and you want to "hot reload"
 * functionality. Or, for testing.
 */
pertain.clearCache = () => dependencySetCache.clear();

export default pertain;
