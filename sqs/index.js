/**
 * Provides a simple mechanism for sending to a queue
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/globals.html
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sqs-examples-send-receive-messages.html
 */

const { SQSClient, SendMessageCommand, SendMessageBatchCommand } = require('@aws-sdk/client-sqs');

class SQS {
  constructor (queueUrl) {
    this.queueUrl = queueUrl;
  }

  /**
   * Sends a batch of message, delivering to AWS SQS in batches of 10
   *
   * Returns back an array of MessageId's as reported by AWS SQS
   */
  async sendBatch (dataArray, delaySeconds = 0, metaData = null) {
    const sqsClient = new SQSClient();
    const batch = [];
    const batchId = [];
    let id = 0;

    for (const data of dataArray) {
      const params = {
        Id: id++,
        MessageBody: JSON.stringify(data)
      };

      if (metaData != null) {
        params.MessageAttributes = metaData;
      }

      if (Number(delaySeconds) > 0) {
        params.DelaySeconds = Number(delaySeconds);
      }

      batch.push(params);

      // Look to send the batch
      if (batch.length === 10) {
        batch.length = 0;

        const s = await this._sendBatchRequestEntry(sqsClient, batch);
        if ('Successful' in s) {
          for (const m of s.Successful) {
            batchId.push(m.MessageId);
          }
        }
      }
    }

    // Catch any last items
    if (batch.length > 0) {
      const s = await this._sendBatchRequestEntry(sqsClient, batch);
      if ('Successful' in s) {
        for (const m of s.Successful) {
          batchId.push(m.MessageId);
        }
      }
    }

    return batchId;
  }

  // -------------

  async _sendBatchRequestEntry (sqsClient, batch) {
    const command = new SendMessageBatchCommand({
      Entries: batch,
      QueueUrl: this.queueUrl
    });
    return await sqsClient.send(command);
  }

  // -------------

  async send (data, delaySeconds = 0, metaData = null) {
    const params = {
      MessageBody: JSON.stringify(data),
      QueueUrl: this.queueUrl
    };

    if (metaData != null) {
      params.MessageAttributes = metaData;
    }

    if (Number(delaySeconds) > 0) {
      params.DelaySeconds = Number(delaySeconds);
    }

    const sqsClient = new SQSClient();
    const sqsResult = await sqsClient.send(new SendMessageCommand(params));
    return sqsResult.MessageId;
  }

  // -------------
}

module.exports = SQS;
