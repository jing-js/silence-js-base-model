const ModelField = require('./ModelField');
const {
  createFieldsConstructorCode,
  createValidateFunctionCode,
  createFieldsPropertiesCode,
  createDeclareCode
} = require('./helper');
const { converters, validators } = require('silence-js-util');

const __store = {
  logger: null
}

function create(proto) {
  let name = proto.name;
  if (!name) {
    throw new Error('Model.create need name');
  }
  if (!proto.fields || !Array.isArray(proto.fields)) {
    throw new Error('Model.create need fields');
  }
  let fields = new Array(proto.fields.length);
  for(let i = 0; i < proto.fields.length; i++) {
    let field = new ModelField(proto.fields[i]);
    if (!field.name) {
      throw new Error(`Field must have 'name', please check fields of ${this.name}`);
    } else if (!field.type) {
      throw new Error(`Field ${field.name} must have 'type', please check fields of ${this.name}`);
    }
    if (['constructor'].indexOf(field.name) >= 0) {
      throw new Error(`Field name can not be ${field.name}, it's reserved words`);
    }
    fields[i] = field;
  }

  let funcStr = `

${createDeclareCode(fields)}

class ${name} {
  static get logger() {
    return STORE.logger;
  }
${createFieldsConstructorCode(fields)}
${createValidateFunctionCode(fields)}
${createFieldsPropertiesCode(fields)}
}

return ${name};

`;

  console.log(funcStr.split('\n').map((line, idx) => `${idx + 1}:\t ${line}`).join('\n'));

  return (new Function('FIELDS', 'CONVERTERS', 'VALIDATORS', 'STORE', funcStr))(
    fields,
    converters,
    validators,
    __store
  );
}

module.exports = {
  create,
  store: __store
};