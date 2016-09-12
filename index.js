'use strict';

const util = require('silence-js-util');

class ModelField {
  constructor(obj) {
    this.name = obj.name;
    this.type = (obj.type || 'string').toLowerCase();
    this._defaultValue = typeof obj.defaultValue === 'undefined' ? undefined : obj.defaultValue;
    this.isPrimaryKey = !!obj.primaryKey;
    this.dbType = (obj.dbType || this.type).toUpperCase();
    this.autoIncrement = !!obj.autoIncrement;
    this.autoUpdate = !!obj.autoUpdate;
    this.require = !!obj.require;
    this.rules = obj.rules || null;
  }
  get defaultValue() {
    if (typeof this._defaultValue === 'function') {
      return this._defaultValue();
    } else {
      return this._defaultValue;
    }
  }
}

class BaseModel {
  static get fields() {
    return this.__fields;
  }
  static set fields(fields) {
    this.__fields = fields.map(f => new ModelField(f));
  }
  constructor(values) {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let fn = field.name;
      let val = (typeof values === 'object' && typeof values[fn] !== 'undefined')
        ? values[fn]
        : (values === false ? undefined : field.defaultValue);

      if (typeof val !== 'undefined' && val !== null && typeof val !== field.type) {
        let cfn = util.converters[field.type];
        if (cfn) {
          val = cfn(val);
        }
      }

      Object.defineProperty(this, fn, {
        enumerable: true,
        writable: true,
        configurable: false,
        value: val
      });
    }
  }
  assign(values) {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let fn = field.name;
      let val = values[fn];
      if (typeof val === 'undefined') {
        continue;
      }
      if (val !== null && typeof val !== field.type) {
        let cfn = util.converters[field.type];
        if (cfn) {
          val = cfn(val);
        }
      }
      this[fn] = val;
    }
  }
  validate(ignoreUndefined = false) {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let val = this[field.name];
      if (!ignoreUndefined && field.require && (typeof val === 'undefined' || val === null || val === '')) {
        return false;
      }
      if (typeof val === 'undefined') {
        continue;
      }
      if (!field.rules) {
        continue;
      }
      
      let rules = field.rules;
      for(let k in rules) {
        let v = rules[k];
        let fn = v;
        if (typeof v !== 'function') {
          fn = util.validators[k];
        }
        let pass = Array.isArray(v) ? fn.call(this, val, ...v) : fn.call(this, val, v);
        if (!pass) {
          return false;
        }
      }
    }
    return true;
  }
}

BaseModel.ModelField = ModelField;

module.exports = BaseModel;
