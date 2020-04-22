import path from 'path';
import pkgDir from 'pkg-dir';
import resolvePkg from 'resolve-pkg';

export type Resolver = (modulePath: string) => string | undefined;

/**
 * Returns a function which resolves filesystem base directories, given module
 * names. The returned function will resolve all modules starting from the `cwd`
 * passed to the resolver factory.
 */
export default function resolver(cwd: string): Resolver {
  return (modulePath) => {
    if (path.isAbsolute(modulePath) || modulePath.startsWith('.')) {
      return pkgDir.sync(path.resolve(cwd, modulePath));
    }
    return resolvePkg(modulePath, { cwd });
  };
}
