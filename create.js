const BaseModel = require('./BaseModel');
const ModelField = require('./ModelField');
const createFieldsConstructorCode = require('./createFieldsConstructorCode');
const { converters } = require('silence-js-util');

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

class ${name} extends BaseModel {
  constructor(values, direct = false) {
    super();
${createFieldsConstructorCode(fields)}
  }
}

${name}.fields = fields;

return ${name};

`;
  
  return (new Function('BaseModel', 'fields', 'CONVERTERS', funcStr))(
    BaseModel,
    fields,
    converters
  );
}

module.exports = create;