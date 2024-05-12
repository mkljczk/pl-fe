interface LegacyMap {
  get(key: any): unknown;
  getIn(keyPath: any[]): unknown;
  toJS(): any;
}

export {
  type LegacyMap,
};