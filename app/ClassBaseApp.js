module.exports = class ClassBaseApp {
  constructor () {
    this.ssm = new (require('../ssm'))();
  }

  getAppContext () {
    return new (require('./AppContext'))(this);
  }

  async getSSMParam (param, decodeFromJson = true) {
    const value = await this.ssm.get(param, decodeFromJson);
    return value;
  }

  async getSSMParamNoCache (param, decodeFromJson = true) {
    const value = await this.ssm.getNoCache(param, decodeFromJson);
    return value;
  }
}
;
