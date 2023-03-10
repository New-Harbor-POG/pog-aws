/**
 * Provides a simple mechanism for sending to a queue
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/globals.html
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-examples.html
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

class DynamoDB {
  constructor (table, idName = 'id', ttlName = 'expire') {
    this.table = table;
    this.idName = idName;
    this.ttlName = ttlName;

    this.dbClient = new DynamoDBClient({});
    this.ddbClient = new DynamoDBDocumentClient(this.dbClient);
  }

  async putItem (id, item, expireAgeSeconds = null) {
    const params = {
      TableName: this.table,
      Item: item
    };

    params.Item[this.idName] = id;

    if (expireAgeSeconds !== null) {
      params.Item[this.ttlName] = new Date().getTime() + (expireAgeSeconds * 1000);
    }

    const data = await this.ddbClient.send(new PutCommand(params));
    return data;
  }

  async getItem (id) {
    const params = {
      TableName: this.table,
      Key: {}
    };

    params.Key[this.idName] = id;
    const data = await this.ddbClient.send(new GetCommand(params));
    return 'Item' in data ? data.Item : null;
  }

  async deleteItem (id) {
    const params = {
      TableName: this.table,
      Key: {}
    };

    params.Key[this.idName] = id;
    const data = await this.ddbClient.send(new DeleteCommand(params));
    return data;
  }
}

module.exports = DynamoDB;
