const BaseModel = require('./BaseModel');
const ModelField = require('./ModelField');

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
  constructor(values, assignDefaultValue = true) {
    super();
    const fields = this.constructor.fields;
    ${fields.map((field, idx) => {
      return`
    this.${field.name} = values && values.hasOwnProperty('${field.name}') 
        ? values.${field.name} : (assignDefaultValue ? fields[${idx}].defaultValue : undefined);
  `;    
    }).join('\n')}
  }
}

${name}.fields = fields;

return ${name};

`;


  return (new Function('BaseModel', 'fields', funcStr))(
    BaseModel,
    fields
  );
}

module.exports = create;