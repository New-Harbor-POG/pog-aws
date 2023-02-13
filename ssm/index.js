/**
 * Handles the loading and caching of the SSM parameter stores.
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/classes/ssm.html
 */
const { SSM } = require('@aws-sdk/client-ssm');

module.exports = class ClassSSM {
  constructor () {
    this.params = {};
    this.env = ('ENV' in process.env) ? process.env.ENV : 'dev';

    this.paramCache = new (require('../utils/ClassCache'))(15);
    this.ssm = new SSM();
  }

  /**
   * Fetches the parameter from cache, but if not, then gets it from SSM
   * @param {*} param
   */
  async get (param, decodeFromJson = true) {
    if (!param.startsWith('/')) {
      param = '/' + param;
    }

    let v = this.paramCache.getItem(param);
    if (v == null) {
      v = await this.fetchNoCache(param, decodeFromJson);
      this.paramCache.setItem(param, v);
    }
    return v;
  }

  /**
   * Goes and fetches the parameter but does not cache
   * @param {*} param
   */
  async getNoCache (param, decodeFromJson = true) {
    if (!param.startsWith('/')) {
      param = `/${param}`;
    }

    const paramName = `/${this.env}${param}`;
    let p = null;
    try {
      p = await this.ssm.getParameter({
        Name: paramName,
        WithDecryption: true
      });
    } catch (e) {
      console.error(`fetchNoCache(${paramName}); ${e}`);
      return null;
    }

    if (typeof decodeFromJson === 'undefined' || decodeFromJson) {
      return p == null ? null : JSON.parse(p.Parameter.Value);
    } else {
      return p == null ? null : p.Parameter.Value;
    }
  }
};
