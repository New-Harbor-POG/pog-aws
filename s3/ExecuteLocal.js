/**
 *
 * A means to execute the local S3 handler

  const executor = require('pog-aws/s3/ExecuteLocal');
  executor.setHandler(require('../src-node/endpoints/utils/_lambda'));
  const res = await executor.doMessage('/time');
 *
 */
process.env.ENV = 'ENV' in process.env ? process.env.ENV : 'dev';

// ----------------

class ExecuteLocal {
  setHandler (handler) {
    this.handler = handler;
    return this;
  }

  // -------------------

  async doMessage (message) {
    const event = initEvent(message);
    this.context = {};
    await this.handler.onEvent(event, this.context);
  }
}

module.exports = new ExecuteLocal();

// ---------------------------

function initEvent (message = null) {
  const event = Object.assign({}, baseEvent);

  if (message != null) {
    if (typeof message === 'string') {
      event.Records[0].body = message;
    } else {
      event.Records[0].body = JSON.stringify(message);
    }
  }

  return event;
}

const baseEvent = {
  Records: [
    {
      s3SchemaVersion: '1.0',
      configurationId: 's3-email-file-c007d9d32c9b849419d8be72a20af959',
      bucket: {
        name: 'ses-warehouse.escalon.cloud',
        ownerIdentity: { principalId: 'A11433A98UGHCJ' },
        arn: 'arn:aws:s3:::XXX-BUCKET'
      },
      object: {
        key: 'pending/i7rvt6vtmqv5q1n1749rfv5didpch031ab9k0vg1',
        size: 11664,
        eTag: '8eb174f8bb1afec54439700509fa0fa3',
        sequencer: '00640A06B2462654C1'
      }
    }
  ]
}
;
