const { create, store } = require('./create');

module.exports = {
  ModelField: require('./ModelField'),
  create,
  __init(logger) {
    store.logger = logger;
  },
  createHelper: require('./helper')
};
