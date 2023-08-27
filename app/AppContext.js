/**
 * AppContext is used for a given execution thread
 */
module.exports = class AppContext {
  constructor (app) {
    this.app = app;
    this.ip = this.userAgent = null;
    this.dataPool = {};
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
    const poolKey = `${profile}-${readOnly}`;

    if (poolKey in this.dataPool && this.dataPool[poolKey] != null) {
      return this.dataPool[poolKey];
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
      this.dataPool[poolKey] = new (require('../database/mysql'))();
      await this.dataPool[poolKey].create(config);
      return this.dataPool[poolKey];
    } else if ('type' in config && config.type.toLowerCase() === 'postgres') {
      this.dataPool[poolKey] = new (require('../database/postgres'))();
      await this.dataPool[poolKey].create(config);
      return this.dataPool[poolKey];
    } else {
      return require('../utils/Throw').fatal(`SSM Parameter for ${config.type} not defined or supported`);
    }
  }

  async close () {
    for (const poolKey in this.dataPool) {
      await this.dataPool[poolKey].destroy();
    }
    this.dataPool = {};
  }

  clearDefinitions () {
    new (require('../database/postgres'))().clearDefintions();
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
