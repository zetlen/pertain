import path from 'path';

export interface JsonMap<T> {
  [key: string]: T;
}

export default class PackageJson {
  get json(): JsonMap<any> {
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
  get directories(): JsonMap<string> {
    return this.json.directories || {};
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
