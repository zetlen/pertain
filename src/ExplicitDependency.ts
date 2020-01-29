import makeDebug from 'debug';
import path from 'path';
import PertainError from './PertainError';
import PackageJson from './PackageJson';

const debug = makeDebug('pertain:ExplicitDependency');

export interface ExplicitDependencyOpts {
  name: string;
  modulePath: string;
}

export default class ExplicitDependency {
  private pkg: PackageJson;
  private modulePath: string;
  private pertainCache: Map<string, string | boolean>;
  name: string;
  constructor(opts: ExplicitDependencyOpts) {
    this.pkg = new PackageJson(opts.modulePath);
    this.modulePath = opts.modulePath;
    this.name = opts.name;
    this.pertainCache = new Map();
  }
  dependsOn(name: string) {
    return this.pkg.peerDependencies.hasOwnProperty(name);
  }
  pertains(subject: string) {
    const { pertainCache } = this;
    if (pertainCache.has(subject)) {
      return pertainCache.get(subject);
    }
    debug('no cache of whether %s pertains to %s', this.name, subject);
    const pertaining = this.pkg.directories[subject];
    if (!pertaining) {
      pertainCache.set(subject, false);
      return false;
    }
    debug(
      'found declaration of "%s" as "%s" in package.directories of "%s"',
      subject,
      pertaining,
      this.name
    );
    const subscriber = path.resolve(this.modulePath, pertaining);
    try {
      const pertainingModule = require.resolve(subscriber);
      debug('found runnable module at %s', pertainingModule);
      pertainCache.set(subject, pertainingModule);
      return pertainingModule;
    } catch (e) {
      throw new PertainError(
        `"${this.name}" declares a "${subject}" directory, but Node could not find a valid JS module to load from "${subscriber}"`
      );
    }
  }
  toString() {
    return `${this.name} @ ${this.modulePath}`;
  }
}
