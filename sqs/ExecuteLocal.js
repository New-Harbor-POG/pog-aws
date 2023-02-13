/**
 *
 * A means to execute the local SQS handler

  const executor = require('pog-aws/sqs/ExecuteLocal');
  executor.setHandler(require('../src-node/endpoints/utils/_lambda'));
  const res = await executor.doGet('/time');
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
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
      receiptHandle: 'MessageReceiptHandle',
      body: '',
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001'
      },
      messageAttributes: {},
      md5OfBody: '{{{md5_of_body}}}',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
      awsRegion: 'us-east-1'
    }
  ]
}
;
