/**
 * Base handler for the API App.
 *
 * the config accepts handles to callbacks; doPreRequest(request, event, context) / doPostResponse(response, event, context)
 *
 */

const serverless = require('serverless-http');
const apiLogger = require('./ApiLogger');

module.exports = class BaseApiExpressApp extends require('../app/ClassBaseApp') {
  constructor () {
    super();
    const express = require('express');
    const bodyParser = require('body-parser');
    const cors = require('cors');

    this.expressApp = express();
    this.expressApp.use(cors());
    this.expressApp.disable('x-powered-by');
    this.expressApp.disable('etag');

    this.expressApp.use(bodyParser.urlencoded({
      extended: true
    }));

    this.expressApp.use(bodyParser.json({
      limit: '10mb',
      extended: true,
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));

    this.expressApp.all('*', function (req, res, next) {
      res.set('Expires', '0');
      res.set('Pragma', 'no-cache');
      res.set('Surrogate-Control', 'no-store');
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Credentials', true);
      next();
    });

    this.config = {};
  }

  setCallback (config = {}) {
    this.config = config;
  }

  getHandler () {
    const thisApiExpressApp = this;

    return serverless(this.expressApp, {
      request: async function (request, event, context) {
        await thisApiExpressApp.doPreRequest(request, event, context);
      },
      response: async function (response, event, context) {
        await thisApiExpressApp.doPostResponse(response, event, context);
      }
    });
  }

  async doPreRequest (request, event, context) {
    // Setup the AppContext for this API request
    context.appContext = request.appContext = new (require('../app/AppContext'))(this);
    request.ip = event.headers['X-Forwarded-For'] || request.ip;
    context.appContext.ip = request.ip = request.ip.split(',')[0].trim();
    context.appContext.userAgent = request.userAgent = event.headers['User-Agent'];

    context.apiLogger = apiLogger.capture(request, event);

    if ('doPreRequest' in this.config) {
      await this.config.doPreRequest(request, context, event);
    }
  }

  async doPostResponse (response, event, context) {
    try {
      if ('doPostResponse' in this.config) {
        await this.config.doPostResponse(response, event, context);
      }

      await apiLogger.store(response, context);
    } catch (e) {
      console.error(e);
    } finally {
      await context.appContext.close();
    }
  }

  getAppContext () {
    require('../utils/Throw').fatal('Not available; use req.appContext instead');
  }

  /**
   * Wrapper methods for registering handlers for each endpoint
   */

  get (uriPath, callback) {
    this.expressApp.get(uriPath, callback);
  }

  post (uriPath, callback) {
    this.expressApp.post(uriPath, callback);
  }

  put (uriPath, callback) {
    this.expressApp.put(uriPath, callback);
  }

  patch (uriPath, callback) {
    this.expressApp.patch(uriPath, callback);
  }

  delete (uriPath, callback) {
    this.expressApp.delete(uriPath, callback);
  }

  getExpress () {
    return this.expressApp;
  }
};
