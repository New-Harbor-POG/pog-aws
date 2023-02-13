module.exports = class ClassAppAssert extends require('./ClassBaseApiApp') {
  assertPresentNotBlank (req, res, field, mess) {
    if (!(field in req.body) || req.body[field] == null || req.body[field].trim() === '') {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return this;
    }
  }

  assertPresentNotZero (req, res, field, mess) {
    if (!(field in req.body) || req.body[field] == null || Number(req.body[field]) === 0) {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return this;
    }
  }

  assertPresent (req, res, field, mess) {
    if (!(field in req.body)) {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return this;
    }
  }

  assertIfNaN (req, res, field, mess) {
    if (!(field in req.body) || req.body[field] == null || isNaN(req.body[field])) {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return Number(req.body[field]);
    }
  }

  assertParamsIfNaN (req, res, field, mess) {
    if (!(field in req.params) || req.params[field] == null || isNaN(req.params[field])) {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return Number(req.params[field]);
    }
  }

  assertParamsPresent (req, res, field, mess) {
    if (!(field in req.params)) {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return this;
    }
  }

  assertQueryPresent (req, res, field, mess) {
    if (!(field in req.query)) {
      return require('../utils/Throw').badRequest(mess);
    } else {
      return this;
    }
  }
};
