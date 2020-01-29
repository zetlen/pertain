import path from 'path';
import dotProp from 'dot-prop';

export interface JsonMap<T> {
  [key: string]: T;
}

export default class PackageJson {
  /**
   * Look up a custom dot-path on a package.json instance. Abstracting this
   * simple operation behind a static method helps us to keep this loading lazy.
   */
  static lookup(pkg: PackageJson, dotPath: string) {
    return dotProp.get(pkg.json, dotPath);
  }
  private get json(): JsonMap<any> {
    if (!this._json) {
      this._json = require(path.resolve(
        this.modulePath,
        'package.json'
      )) as JsonMap<any>;
    }
    return this._json;
  }
  get dependencies(): JsonMap<string> {
    return this.json.dependencies || {};
  }
  get devDependencies(): JsonMap<string> {
    return this.json.devDependencies || {};
  }
  get name(): string {
    return this.json.name as string;
  }
  get peerDependencies(): JsonMap<string> {
    return this.json.peerDependencies || {};
  }
  private _json: JsonMap<any> | undefined;
  private modulePath: string;
  constructor(modulePath: string) {
    this.modulePath = modulePath;
  }
}
