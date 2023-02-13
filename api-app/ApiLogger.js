const enabled = 'APILOGGER_SQS_URL' in process.env;

if (enabled) {
  const SQS = new(require('../sqs'))(process.env.APILOGGER_SQS_URL);
}

module.exports = {

  capture: function (request, event) {
    if (event.path.endsWith('/refresh')) {
      return null;
    }

    let contentType = ('content-type' in event.headers) ? event.headers['content-type'] : null;
    if (contentType == null) {
      contentType = ('Content-Type' in event.headers) ? event.headers['Content-Type'] : '';
    }

    event.headers['User-Agent'] = (typeof event.headers['User-Agent'] === 'undefined' || event.headers['User-Agent'] === '') ? 'Unknown' : event.headers['User-Agent'];

    const logItem = {
      method: event.httpMethod,
      path: event.path,
      agent: event.headers['User-Agent'],
      ip: request.ip,
      time: new Date().getTime()
    };

    if (event.queryStringParameters) {
      logItem.params = Object.assign({}, event.queryStringParameters);
    }

    if (!event.path.endsWith('/list')) {
      logItem.body = getBodySanitized(contentType, event.body);

      if (logItem.body.length > 200000) {
        logItem.body = `---[ Body too long; length=${logItem.body.length}; first 1000chars=${logItem.body.substring(0, 1000)} ]---`;
      }
    }
    return logItem;
  },

  // ----------------------------------------

  store: async function (response, context) {
    if (!('logItem' in context) || context.logItem == null || ('donotlog' in response)) {
      return;
    }

    if ('consoleLogMetaData' in response) {
      console.error(`IP=${context.logItem.ip}; URI=${context.logItem.path}; UserAgent=${context.logItem.agent}`);
    }

    context.logItem.response = {
      code: response.statusCode,
      ms: new Date().getTime() - context.logItem.time,
      len: response.getHeader('content-length') ? Number(response.getHeader('content-length')) : 0
    };

    if (('donotlog' in context || !enabled)) { // this is for the local runner to make sure we don't try to log and if the APILOGGER_SQS_URL not defined
      return;
    }

    try {
      await SQS.send(context.logItem);
    } catch (e) {
      console.error(e);
      console.error(`context.logItem=${JSON.stringify(context.logItem)}`);
    }
  }

};

/** ---------------------------------------------------
 * Remove any sensitive data from the body
 */
function getBodySanitized(contentType, rawBody) {
  if (contentType.includes('json')) {
    try {
      const jobj = JSON.parse(rawBody);
      if ('password' in jobj && jobj.password.length > 0) {
        jobj.password = `---[ length=${jobj.password.length}; lastChar=${jobj.password.charAt(jobj.password.length - 1)} ]---`;
      }

      if ('dataUri' in jobj) {
        jobj.dataUri = '---[ binary data base64 ]---';
      }

      return JSON.stringify(jobj);
    } catch (e) {
      return JSON.stringify({
        formData: rawBody
      });
    }
  } else {
    return String(rawBody);
  }
}