/**
 *
 * A means to execute the local endpoint

  const executor = require('pog-aws/timer/ExecuteLocal');
  executor.setHandler(require('../src-node/endpoints/utils/_lambda'));

  const res = await executor.doGet('/time');
 *
 */
process.env.ENV = 'ENV' in process.env ? process.env.ENV : 'dev';

class ExecuteLocal {
  setHandler (handler) {
    this.handler = handler;
    return this;
  }

  // -------------------

  async doTime () {
    const event = {};
    this.context = {};
    await this.handler.onEvent(event, this.context);
  }
}

module.exports = new ExecuteLocal();
