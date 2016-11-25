const { converters, validators } = require('silence-js-util');

const PREFIX = '____';

function createFieldsConstructorCode(fields) {
  return `
  constructor(values, direct = false) {
    let isObj = typeof values === 'object' && values !== null;${fields.map((field, idx) => {
    let _default = 'undefined';
    if (typeof field._defaultValue === 'function') {
      _default = `(direct ? undefined : dv.${PREFIX}${field.name}())`;
    } else if (typeof field._defaultValue !== 'undefined') {
      _default = `(direct ? undefined : ${JSON.stringify(field._defaultValue)})`;
    }
    let _value = ``;
    if (typeof field.convert === 'function') {
      _value = `(direct ? values.${field.name} : fc.${PREFIX}${field.name}(values.${field.name}))`;
    } else if (typeof field.convert === 'string' && converters.hasOwnProperty(field.convert)) {
      _value = `(direct ? values.${field.name} : fc.${PREFIX}${field.name}(values.${field.name}))`;
    } else if (field.type !== 'any' && converters.hasOwnProperty(field.type)) {
      _value = `(direct || typeof values.${field.name} === '${field.type}' ? values.${field.name} : fc.${PREFIX}${field.name}(values.${field.name}))`
    }
    let _result = !field._defaultValue && !_value ? `isObj ? values.${field.name} : undefined` : `isObj && values.hasOwnProperty('${field.name}') ? ${_value ? _value : `values.${field.name}`} : ${_default}`;
    return `
    this.${PREFIX}${field.name} = ${_result};`;
  }).join('')}
  }`;
}

function createFieldsPropertiesCode(fields) {
  return fields.map((field, idx) => {
    let _value = `val`;
    if (typeof field.convert === 'function') {
      _value = `fc.${PREFIX}${field.name}(val)`;
    } else if (typeof field.convert === 'string' && converters.hasOwnProperty(field.convert)) {
      _value = `fc.${PREFIX}${field.name}(val)`;
    } else if (field.type !== 'any' && converters.hasOwnProperty(field.type)) {
      _value = `typeof val !== '${field.type}' ? fc.${PREFIX}${field.name}(val) : val`;
    }
    return `
  get ${field.name}() {
    return this.${PREFIX}${field.name};
  }
  set ${field.name}(val) {
    this.${PREFIX}${field.name} = ${_value};
  }`;
  }).join('');
}

function createValidateFunctionCode(fields) {
  return `
  validate(ignoreUndefined = false) {
    let val;${fields.map((field, idx) => {
    return `
    val = this.${PREFIX}${field.name};${field.isRequired ? `
    if (!ignoreUndefined && (val === undefined || val === null || val === '')) {
      logger.debug('${field.name} is invalid, require not match');
      return false;
    }` : ''}
    if (val !== undefined) {${field.type !== 'any' ? `
      if (typeof val !== '${field.type}') {
        logger.debug('${field.name} is invalid, type is not ${field.type}');
        return false;
      }` : ''}${field.rules ? `
      let rules = rs.${PREFIX}${field.name};
      for (let i = 0; i < rules.length; i++) {
        if (!rules[i](val)) {
          logger.debug('${field.name} is invalid, rule not match');
          return false;
        }
      }` : ''}
    }`
  }).join('')}
    return true;
  }`;
}

function createDeclareCode(fields) {
  return `
let fc = {${fields.map((field, idx) => {
    let code = '';
    if (typeof field.convert === 'function') {
      code = `
  ${PREFIX}${field.name}: FIELDS[${idx}].convert`
    } else if (typeof field.convert === 'string' && converters.hasOwnProperty(field.convert)) {
      code = `
  ${PREFIX}${field.name}: CONVERTERS.${field.convert}`
    } else if (field.type !== 'any' && converters.hasOwnProperty(field.type)) {
      code = `
  ${PREFIX}${field.name}: CONVERTERS.${field.type}`
    }
    return code;
  }).filter(c => !!c).join(',')}
};
let dv = {${fields.map((field, idx) => {
    let code = '';
    if (typeof field._defaultValue === 'function') {
      code = `
  ${PREFIX}${field.name}: FIELDS[${idx}]._defaultValue`
    }
    return code;
  }).filter(c => !!c).join(',')}
};
let rs = {${fields.map((field, idx) => {
    let code = '';
    if (field.rules) {
      code = `
  ${PREFIX}${field.name}: [${field.rules.map((rule, ri) => {
        if (rule instanceof RegExp) {
          return `
    function(val) { return ${rule.toString()}.test(val); }`
        } else if (typeof rule === 'string') {
          if (validators.hasOwnProperty(rule)) {
            return `
    VALIDATORS.${rule}`;
          } else {
            throw new Error('validator ' + rule + ' not found');
          }
        } else if (typeof rule === 'function') {
          return `
    FIELDS[${idx}].rules[${ri}]`;
        } else {
          let t = rule.name;
          let v = rule.argv;
          let fn = validators[t];
          if (!fn) {
            throw new Error(`validator not found: ${t}`);
          } else if (Array.isArray(v) && v.length === 0) {
            return `
    VALIDATORS['${t}']`;
          } else {
            return `
    VALIDATORS['${t}'].bind(null, ${Array.isArray(v) ? v.map(_v => JSON.stringify(_v)).join(',') : JSON.stringify(v)})`;
          }
        }
      }).join(',')}
  ]`
    }
    return code;
  }).filter(c => !!c).join(',')}
};`
}

module.exports = {
  PREFIX,
  createFieldsConstructorCode,
  createFieldsPropertiesCode,
  createValidateFunctionCode,
  createDeclareCode
}