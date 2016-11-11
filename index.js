const BaseModel = require('./BaseModel');

module.exports = {
  BaseModel,
  ModelField: require('./ModelField'),
  create: require('./create'),
  __init(logger) {
    BaseModel.__logger = logger;
  },
  isModel(ModelClass) {
    return Object.getPrototypeOf(ModelClass) === BaseModel;
  },
  createFieldsConstructorCode: require('./createFieldsConstructorCode')
};
