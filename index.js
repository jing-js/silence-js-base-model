'use strict';

const util = require('silence-js-util');

class BaseModel {
  static get fields() {
    return this.__fields;
  }
  static set fields(fields) {
    fields.forEach(field => {
      if (!field.type) {
        field.type = 'string';
      } else {
        field.type = field.type.toLowerCase();
      }
    });
    this.__fields = fields;
  }
  constructor(values, convertType = false) {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let fieldName = field.name;
      let val = util.isObject(values) && !util.isUndefined(values[fieldName])
        ? values[fieldName]
        : (field.hasOwnProperty('defaultValue') ? field.defaultValue : undefined);

      if (convertType && typeof val !== 'undefined' && val !== null && typeof val !== field.type) {
        let cfn = util.converters[field.type];
        if (cfn) {
          val = cfn(val);
        }
      }
      
      Object.defineProperty(this, fieldName, {
        enumerable: true,
        writable: true,
        configurable: false,
        value: val
      });
    }
  }
  assign(values, convertType = false) {
    if (!util.isObject(values)) {
      return;
    }
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let fieldName = field.name;
      if (!util.isUndefined(values[fieldName])) {
        let val = values[fieldName];
        if (convertType) {
          let cfn = util.converters[field.type];
          if (cfn) {
            val = cfn(val);
          }
        }
        this[fieldName] = val;
      }
    }
  }
  validate() {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let val = this[field.name];
      if (field.require && (util.isUndefined(val) || val === null || val === '')) {
        return false;
      }
      if (util.isUndefined(val)) {
        continue;
      }
      if (!field.rules) {
        continue;
      }
      
      let rules = field.rules;
      for(let k in rules) {
        let v = rules[k];
        let fn = v;
        if (!util.isFunction(v)) {
          fn = util.validators[k];
        }
        v = Array.isArray(v) ? v : [v];
        if (!fn.call(this, val, ...v)) {
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = BaseModel;
