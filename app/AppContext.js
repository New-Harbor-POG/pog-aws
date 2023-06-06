/**
 * AppContext is used for a given execution thread
 */
module.exports = class AppContext {
  constructor (app) {
    this.app = app;
    this.ip = this.userAgent = null;
    this.dbRW = this.dbRO = null;
  }

  async getSSMParam (param, decodeFromJson = true) {
    const value = await this.app.getSSMParam(param, decodeFromJson);
    return value;
  }

  async getSSMParamNoCache (param, decodeFromJson = true) {
    const value = await this.app.getSSMParamNoCache(param, decodeFromJson);
    return value;
  }

  async getDatabase (profile, readOnly = false) {
    const propKey = readOnly ? 'dbRO' : 'dbRW';

    if (this[propKey] != null) {
      return this[propKey];
    }

    const param = await this.app.getSSMParam(profile);
    if (param === null) {
      return require('../utils/Throw').fatal(`SSM Parameter for ${profile} not defined`);
    }

    // Create the necessary driver
    const config = getDbParam(readOnly, param);
    if (config === null) {
      return require('../utils/Throw').fatal(`SSM Parameter for ${profile} not defined (dbRO, db-ro, db_ro, dbRW, db-rw, db_rw)`);
    }

    if ('type' in config && config.type.toLowerCase() === 'mysql') {
      this[propKey] = new (require('../database/mysql'))();
      await this[propKey].create(config);
      return this[propKey];
    } else if ('type' in config && config.type.toLowerCase() === 'postgres') {
      this[propKey] = new (require('../database/postgres'))();
      await this[propKey].create(config);
      return this[propKey];
    } else {
      return require('../utils/Throw').fatal(`SSM Parameter for ${config.type} not defined or supported`);
    }
  }

  async close () {
    if (this.dbRW != null) {
      await this.dbRW.destroy();
      this.dbRW = null;
    }

    if (this.dbRO != null) {
      await this.dbRO.destroy();
      this.dbRO = null;
    }
  }
}
;

function getDbParam (readOnly, param) {
  if (readOnly) {
    if ('db-ro' in param) {
      return param['db-ro'];
    } else if ('db_ro' in param) {
      return param.db_ro;
    } else if ('dbRO' in param) {
      return param.dbRO;
    }
  } else {
    if ('db-rw' in param) {
      return param['db-rw'];
    } else if ('db_rw' in param) {
      return param.db_rw;
    } else if ('dbRW' in param) {
      return param.dbRW;
    }
  }

  return null;
}
