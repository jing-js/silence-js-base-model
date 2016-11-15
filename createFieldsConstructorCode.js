module.exports = function createFieldsConstructorCode(fields) {
  return `    let isObj = typeof values === 'object' && values !== null;
${fields.map((field, idx) => {
    let _default = 'undefined';
    if (typeof field._defaultValue === 'function') {
      _default = `(direct ? undefined : this.constructor.fields[${idx}].defaultValue)`;
    } else if (typeof field._defaultValue !== 'undefined') {
      _default = `(direct ? undefined : ${JSON.stringify(field._defaultValue)})`;
    }
    let _value = `values.${field.name}`;
    if (typeof field.convert === 'function') {
      _value = `(direct ? values.${field.name} : this.constructor.fields[${idx}].convert(values.${field.name}))`;
    } else if (typeof field.convert === 'string') {
      _value = `(direct ? values.${field.name} : CONVERTERS.${field.convert}(values.${field.name}))`;
    }
    let _result = !field._defaultValue && !field.convert ? `isObj ? ${_value} : undefined` : `isObj && values.hasOwnProperty('${field.name}') ? ${_value} : ${_default}`;
    return `    this.${field.name} = ${_result};`;
  }).join('\n')}`;
}
