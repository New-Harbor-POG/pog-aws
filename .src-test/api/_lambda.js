'use strict';

const app = require('../../api-app/');

require('./route-get-time').do(app);

module.exports.do = async (event, context) => {
  const r = await app.getHandler()(event, context);
  return r;
};
