class ModelField {
  constructor(obj) {
    this.name = obj.name;
    this.type = (obj.type || 'string').toLowerCase();
    this._defaultValue = typeof obj.defaultValue === 'undefined' ? undefined : obj.defaultValue;
    this.isPrimaryKey = !!obj.primaryKey;
    this.dbType = (obj.dbType || this.type).toUpperCase();
    this.autoIncrement = !!obj.autoIncrement;
    this.autoUpdate = !!obj.autoUpdate;
    this.isRequired = !!obj.require;
    this.rules = obj.rules || null;
    this.isIndex = !!obj.index;
    this.isUnique = !!obj.unique;
  }
  get defaultValue() {
    if (typeof this._defaultValue === 'function') {
      return this._defaultValue();
    } else {
      return this._defaultValue;
    }
  }
}

module.exports = ModelField;
