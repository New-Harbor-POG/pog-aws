/**
 *
 * A means to execute the local endpoint

  const executor = require('pog-aws/api-app/ExecuteLocal');
  executor.setHandler(require('../src-node/endpoints/utils/_lambda'));

  const res = await executor.doGet('/time');
 *
 */
process.env.ENV = 'ENV' in process.env ? process.env.ENV : 'dev';

// ----------------

class ClassExecuteLocal {
  setHandler (handler) {
    this.handler = handler;
    return this;
  }

  getContext () {
    return 'context' in this ? this.context : {};
  }

  setJWTPayload (payload) {
    this.payload = payload;
  }

  clearAuth () {
    delete this.payload;
  }

  // ----------------

  async doGet (url, queryParams = {}) {
    return this.doBody('GET', url, null, queryParams);
  }

  async doPost (url, body, queryParams = {}) {
    return this.doBody('POST', url, body, queryParams);
  }

  async doPut (url, body, queryParams = {}) {
    return this.doBody('PUT', url, body, queryParams);
  }

  async doPatch (url, body, queryParams = {}) {
    return this.doBody('PATCH', url, body, queryParams);
  }

  async doDelete (url, body, queryParams = {}) {
    return this.doBody('DELETE', url, body, queryParams);
  }

  // -------------------

  async doBody (httpMethod, url, body, queryParams = {}) {
    const event = initEvent(httpMethod, url, queryParams);

    event.body = body != null ? JSON.stringify(body) : {};

    if ('payload' in this) {
      event.requestContext.authorizer.payload = JSON.stringify(this.payload);
    }

    this.context = { donotlog: true };

    const res = await this.handler.do(event, this.context);

    if ('statusCode' in res && res.statusCode === 200) {
      const isJson = (res.body.startsWith('{') && res.body.endsWith('}')) || (res.body.startsWith('[') && res.body.endsWith(']'));
      res.body = 'body' in res && isJson ? JSON.parse(res.body) : null;
    }

    return res;
  }
}

module.exports = new ClassExecuteLocal();

// ----------------

function initEvent (httpMethod, url, queryParams = {}, body = null) {
  const event = Object.assign({}, baseEvent);

  event.body = body;
  event.httpMethod = event.requestContext.httpMethod = httpMethod;
  event.resource = event.path = event.pathParameters.proxy = event.requestContext.path = url;
  event.queryStringParameters = queryParams;
  event.requestContext.requestTimeEpoch = new Date().getTime();

  return event;
}

// ----------------

const baseEvent = {
  body: '',
  resource: '',
  path: '',
  httpMethod: 'GET',
  isBase64Encoded: false,
  queryStringParameters: {},
  pathParameters: {
    proxy: ''
  },
  stageVariables: {},
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'Cache-Control': 'max-age=0',
    'CloudFront-Forwarded-Proto': 'https',
    'CloudFront-Is-Desktop-Viewer': 'true',
    'CloudFront-Is-Mobile-Viewer': 'false',
    'CloudFront-Is-SmartTV-Viewer': 'false',
    'CloudFront-Is-Tablet-Viewer': 'false',
    'CloudFront-Viewer-Country': 'US',
    Host: '1234567890.execute-api.us-east-1.amazonaws.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Custom User Agent String',
    Via: '1.1 deadbe.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': 'XXXaaavvvvssswwwsss==',
    'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https',
    'Content-Type': 'application/json'
  },
  multiValueHeaders: {
    'Content-Type': [
      'application/json'
    ],
    Accept: [
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    ],
    'Accept-Encoding': [
      'gzip, deflate, sdch'
    ],
    'Accept-Language': [
      'en-US,en;q=0.8'
    ],
    'Cache-Control': [
      'max-age=0'
    ],
    'CloudFront-Forwarded-Proto': [
      'https'
    ],
    'CloudFront-Is-Desktop-Viewer': [
      'true'
    ],
    'CloudFront-Is-Mobile-Viewer': [
      'false'
    ],
    'CloudFront-Is-SmartTV-Viewer': [
      'false'
    ],
    'CloudFront-Is-Tablet-Viewer': [
      'false'
    ],
    'CloudFront-Viewer-Country': [
      'US'
    ],
    Host: [
      '0123456789.execute-api.us-east-1.amazonaws.com'
    ],
    'Upgrade-Insecure-Requests': [
      '1'
    ],
    'User-Agent': [
      'Custom User Agent String'
    ],
    Via: [
      '1.1 deadbe.cloudfront.net (CloudFront)'
    ],
    'X-Amz-Cf-Id': [
      '123123-123123-123-13-123123=='
    ],
    'X-Forwarded-For': [
      '127.0.0.1, 127.0.0.2'
    ],
    'X-Forwarded-Port': [
      '443'
    ],
    'X-Forwarded-Proto': [
      'https'
    ]
  },
  requestContext: {
    accountId: '123456789012',
    resourceId: '123456',
    stage: 'dev',
    requestId: '123123-123123-123-13-123123',
    requestTime: '09/Dec/2023:04:00:12 +0000',
    requestTimeEpoch: 1428582896000,
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      accessKey: null,
      sourceIp: '127.0.0.1',
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: 'ExecuteLocal API',
      user: null
    },
    authorizer: {},
    path: '',
    resourcePath: '',
    httpMethod: 'POST',
    apiId: '1234567890',
    protocol: 'HTTP/1.1'
  }
};
