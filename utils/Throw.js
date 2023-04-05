/**
 * This is a helper to control all the error exception handling
 */

module.exports = {

  throw: function (code, message) {
    const e = new Error(message);
    e.statusCode = code;
    throw e;
  },

  notAuthorized: function (message) {
    const e = new Error(message);
    e.statusCode = 401;
    throw e;
  },

  badRequest: function (message) {
    const e = new Error(message);
    e.statusCode = 400;
    throw e;
  },

  notFound: function (message) {
    const e = new Error(message);
    e.statusCode = 404;
    throw e;
  },

  fatal: function (message) {
    const e = new Error(message);
    e.statusCode = 500;
    throw e;
  },

  rethrow: function (e) {
    e.statusCode = 400;
    throw e;
  }

}
;
