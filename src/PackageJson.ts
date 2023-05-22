import objectPath from 'object-path';
import { readFileSync } from 'fs';
import path from 'path';

type PkgData = {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

/**
 * Lazy-loading proxy for package.json. A subset of properties are available,
 * and a static method
 * `PackageJson.lookup(package: PackageJson, dotPath: string)`
 * exists for looking up other arbitrary properties.
 *
 * This speeds up dependency gathering; it won't be necessary to read all
 * package files from disk.
 */
export default class PackageJson {
  json!: objectPath.ObjectPathBound<PkgData>;
  public lookup<T>(dotPath: string, fallback?: T): T {
    return this.getJson().get(dotPath) || fallback;
  }
  public get dependencies(): Record<string, string> {
    return this.lookup('dependencies', {});
  }
  public get devDependencies(): Record<string, string> {
    return this.lookup('devDependencies', {});
  }
  public get name(): string {
    return this.lookup('name');
  }
  public get peerDependencies(): Record<string, string> {
    return this.lookup('peerDependencies', {});
  }
  private modulePath: string;
  constructor(modulePath: string) {
    this.modulePath = modulePath;
  }
  private getJson() {
    if (!this.json) {
      this.json = objectPath(
        JSON.parse(
          readFileSync(path.join(this.modulePath, 'package.json'), 'utf8')
        )
      );
    }
    return this.json;
  }
}
