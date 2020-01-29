import makeDebug from 'debug';
import path from 'path';
import ExplicitDependencySet from './ExplicitDependencySet';
import Resolver from './Resolver';
import PackageJson from './PackageJson';

const debug = makeDebug('pertain:main');

const dependencySetCache = new Map<string, ExplicitDependencySet>();

export default function pertain(rootDir: string, subject: string): string[] {
  const absRoot = path.resolve(rootDir);
  let depSet = dependencySetCache.get(absRoot);
  if (!depSet) {
    debug('no cached depset for %s', absRoot);
    const resolver = new Resolver(absRoot);
    const { dependencies, devDependencies } = new PackageJson(absRoot);
    const allDependencyNames = Object.keys(
      Object.assign({}, dependencies, devDependencies)
    );
    debug('%s allDependencyNames %s', absRoot, allDependencyNames);
    depSet = new ExplicitDependencySet(resolver, allDependencyNames);
    dependencySetCache.set(absRoot, depSet);
  }
  return depSet.pertaining(subject).map(dep => dep.pertains(subject) as string);
}

module.exports = pertain;
