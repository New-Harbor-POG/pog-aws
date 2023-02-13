const createError = require('http-errors');

module.exports = class ClassApi extends require('./ClassAppAssert') {
  onBadRequest (res, mess) {
    return this.onError(res, createError.BadRequest(mess));
  }

  onUnauthorized (res, mess) {
    return this.onError(res, createError.Unauthorized(mess));
  }

  onNotFound (res, mess) {
    return this.onError(res, createError.NotFound(mess));
  }

  onError (res, err, req = null) {
    err.statusCode = ('statusCode' in err) ? err.statusCode : 500;

    if (err.statusCode >= 500) {
      const logOutput = [`[ApiApp][ERROR] ${err}`];
      ('stack' in err) && logOutput.push(`\nStack: ${err.stack}`);
      ('properties' in err) && logOutput.push(`\nProperties: ${err.properties}`);
      ('lastStmt' in err) && logOutput.push(`\nLastStmt: ${JSON.stringify(err.lastStmt, null, 2)}`);

      if (req != null) {
        ('path' in req) && logOutput.push(`Path: ${req.path}`);
        ('appContext' in req && 'ip' in req.appContext) && logOutput.push(`IP: ${req.appContext.ip}`);

        const contentType = req.get('content-type');
        (typeof contentType !== 'undefined' && contentType.includes('json') && 'apiGateway' in req && 'event' in req.apiGateway && 'body' in req.apiGateway.event) && logOutput.push(`Body: ${req.apiGateway.event.body}`);
      }

      console.log(logOutput.join('\n'));
      res.consoleLogMetaData = true;
      res.status(err.statusCode).send({
        code: err.statusCode,
        message: err.message
      });
      return false;
    } else {
      err.message = (err.message.startsWith('[-]')) ? err.message.substring(3).trim() : err.message;
      res.status(err.statusCode).send({
        code: err.statusCode,
        message: err.message
      });
      return true;
    }
  }
}
;
