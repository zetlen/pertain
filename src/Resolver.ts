import resolvePkg from 'resolve-pkg';

export type Resolver = (modulePath: string) => string | undefined;

export default function resolver(cwd: string): Resolver {
  return modulePath => resolvePkg(modulePath, { cwd });
}
