const util = require('silence-js-util');

class BaseModel {
  static get logger() {
    return BaseModel.__logger;
  }
  assign(values) {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      if (!values.hasOwnProperty(field.name)) {
        continue;
      }
      this[field.name] = values[field.name];
    }
  }
  validate(ignoreUndefined = false) {
    let fields = this.constructor.fields;
    for(let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let val = this[field.name];
      let tp = typeof val;
      if (!ignoreUndefined && field.isRequired && (tp === 'undefined' || val === null || val === '')) {
        return false;
      }
      if (tp === 'undefined') {
        continue;
      }
      if (tp !== field.type) {
        return false;
      }
      if (!field.rules) {
        continue;
      }

      let rules = field.rules;
      for(let k = 0; k < rules.length; k++) {
        let r = rules[k];
        let pass = false;
        if (r instanceOf RegExp) {
          pass = r.test(val);
        } else if (typeof r === 'function') {
          pass = r.call(this, val)
        } else if (typeof r === 'string') {
          pass = util.validators[k].call(this, val);
        } else {
          let t = r.type;
          let v = r.argv;
          let fn = util.validators[r.type];
          pass = Array.isArray(v) ? fn.call(this, val, ...v) : fn.call(this, val, v);
        }
        if (!pass) {
          return false;
        }
      }
    }
    return true;
  }
}

BaseModel.__logger = null;

module.exports = BaseModel;
