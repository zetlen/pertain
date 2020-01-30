import dotProp from 'dot-prop';
import path from 'path';

export interface JsonMap<T> {
  [key: string]: T;
}

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
  /**
   * Look up a custom dot-path on a package.json instance. Abstracting this
   * simple operation behind a static method helps us to keep this loading lazy.
   */
  public static lookup(pkg: PackageJson, dotPath: string) {
    return dotProp.get(pkg.getJson(), dotPath);
  }
  public get dependencies(): JsonMap<string> {
    return this.getJson().dependencies || {};
  }
  public get devDependencies(): JsonMap<string> {
    return this.getJson().devDependencies || {};
  }
  public get name(): string {
    return this.getJson().name as string;
  }
  public get peerDependencies(): JsonMap<string> {
    return this.getJson().peerDependencies || {};
  }
  private json: JsonMap<any> | undefined;
  private modulePath: string;
  constructor(modulePath: string) {
    this.modulePath = modulePath;
  }
  private getJson(): JsonMap<any> {
    if (!this.json) {
      this.json = require(path.join(
        this.modulePath,
        'package.json'
      )) as JsonMap<any>;
    }
    return this.json;
  }
}
