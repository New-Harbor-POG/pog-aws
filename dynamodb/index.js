/**
 * Provides a simple mechanism for sending to a queue
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/globals.html
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-examples.html
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, BatchWriteCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

class DynamoDB {
  constructor (table, idName = 'id', ttlName = 'expire') {
    this.table = table;
    this.idName = idName;
    this.ttlName = ttlName;

    this.dbClient = new DynamoDBClient({});
    this.ddbClient = new DynamoDBDocumentClient(this.dbClient);
  }

  /**
   * Inserts or updates an item
   */
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

  /**
   * Returns back the element at the given 'id'
   */
  async getItem (id) {
    const params = {
      TableName: this.table,
      Key: {}
    };

    params.Key[this.idName] = id;
    const data = await this.ddbClient.send(new GetCommand(params));
    return 'Item' in data && typeof data.Item !== 'undefined' ? data.Item : null;
  }

  /**
   * Gets all the items in the array
   */
  async getItems (itemIdArray) {
    const params = {
      RequestItems: {
        [this.table]: {
          Keys: []
        }
      }
    };

    for (const id of itemIdArray) {
      params.RequestItems[this.table].Keys.push({
        [this.idName]: id
      });
    }

    const data = await this.ddbClient.send(new BatchGetCommand(params));
    return 'Responses' in data && this.table in data.Responses ? data.Responses[this.table] : [];
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

  /**
   * An array of items to insert, must have the 'id' field as one of the elements
   * will throw an error if not present
   */
  async putItems (itemArray, expireAgeSeconds = null) {
    if (itemArray.length > 25) {
      require('../utils/Throw').badRequest('Too many elements; limit to 25');
    }

    const params = {
      RequestItems: {
        [this.table]: []
      }
    };

    for (const item of itemArray) {
      if (!(this.idName in item)) {
        require('../utils/Throw').badRequest(`Missing ${this.idName} in the item`);
      }

      if (expireAgeSeconds !== null) {
        item[this.ttlName] = new Date().getTime() + (expireAgeSeconds * 1000);
      }

      params.RequestItems[this.table].push({
        PutRequest: {
          Item: {
            ...item
          }
        }
      });
    }

    await this.ddbClient.send(new BatchWriteCommand(params));
  }

  /**
   * An array of id's that can be deleted
   */
  async deleteItems (itemIdArray) {
    const params = {
      RequestItems: {
        [this.table]: []
      }
    };

    for (const id of itemIdArray) {
      params.RequestItems[this.table].push({
        DeleteRequest: {
          Key: {
            [this.idName]: id
          }
        }
      });
    }

    await this.ddbClient.send(new BatchWriteCommand(params));
  }

  /**
   * Runs a query against the table
   * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-query-scan.html
   */
  async queryItems (params) {
    params.TableName = this.table;
    const data = this.ddbClient.send(new QueryCommand(params));
    return 'Items' in data && typeof data.Items !== 'undefined' ? data.Items : null;
  }
}

module.exports = DynamoDB;
