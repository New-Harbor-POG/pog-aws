/**
 * Provides a simple mechanism for sending to a queue
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/globals.html
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html
 *
 * https://stackoverflow.com/questions/43361409/getting-signed-url-from-s3-to-decrypt-uploaded-object-using-sse-c
 */

const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {
  list: async function (s3Bucket, prefix = null) {
    const client = new S3Client();
    const command = new ListObjectsV2Command({
      Bucket: s3Bucket,
      MaxKeys: 1000
    });

    if (prefix !== null) {
      command.Prefix = prefix;
    }

    let isTruncated = true;
    let allList = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
      const contentsList = Contents.map((c) => {
        return {
          key: c.Key,
          lastModified: c.LastModified,
          size: c.Size,
          etag: c.ETag.substring(1, c.ETag.length - 1)
        };
      });

      allList = allList.concat(contentsList);

      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }

    return allList;
  },

  move: async function (s3Bucket, s3Key, s3KeyNew) {
    const client = new S3Client();
    await client.send(new CopyObjectCommand({
      CopySource: `/${s3Bucket}/${s3Key}`,
      Bucket: s3Bucket,
      Key: s3KeyNew
    }));

    await client.send(new DeleteObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key
    }));
  },

  delete: async function (s3Bucket, s3Key) {
    const client = new S3Client();
    await client.send(new DeleteObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key
    }));
  },

  putFile: async function (s3Bucket, s3Key, filePath, contentType = null, tagging = null) {
    return this.putFileSSEC(s3Bucket, s3Key, null, filePath, contentType, tagging);
  },

  putFileSSEC: async function (s3Bucket, s3Key, encKey, filePath, contentType = null, tagging = null) {
    const config = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fs.readFileSync(filePath)
    };

    if (encKey !== null) {
      config.SSECustomerAlgorithm = 'AES256';
      config.SSECustomerKey = Buffer.alloc(32, encKey);
    }

    if (contentType != null) {
      config.ContentType = contentType;
    }

    if (tagging != null) {
      config.Tagging = tagging;
    }

    const client = new S3Client();
    const response = await client.send(new PutObjectCommand(config));
    return response;
  },

  put: async function (s3Bucket, s3Key, fileBody, contentType = null, tagging = null) {
    return await this.putSSEC(s3Bucket, s3Key, null, fileBody, contentType, tagging);
  },

  putSSEC: async function (s3Bucket, s3Key, encKey, fileBody, contentType = null, tagging = null) {
    const config = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileBody
    };

    if (encKey !== null) {
      config.SSECustomerAlgorithm = 'AES256';
      config.SSECustomerKey = Buffer.alloc(32, encKey);
    }

    if (contentType != null) {
      config.ContentType = contentType;
    }

    if (tagging != null) {
      config.Tagging = tagging;
    }

    const client = new S3Client();
    const response = await client.send(new PutObjectCommand(config));
    return response;
  },

  getAsBytes: async function (s3Bucket, s3Key) {
    return await this.getAsBytesSSEC(s3Bucket, s3Key, null);
  },

  getAsBytesSSEC: async function (s3Bucket, s3Key, encKey) {
    const config = {
      Bucket: s3Bucket,
      Key: s3Key
    };

    if (encKey !== null) {
      config.SSECustomerAlgorithm = 'AES256';
      config.SSECustomerKey = Buffer.alloc(32, encKey);
    }

    const client = new S3Client();
    const response = await client.send(new GetObjectCommand(config));
    return await response.Body.transformToByteArray();
  },

  getAsString: async function (s3Bucket, s3Key) {
    return await this.getAsStringSSEC(s3Bucket, s3Key, null);
  },

  getAsStringSSEC: async function (s3Bucket, s3Key, encKey = null) {
    const config = {
      Bucket: s3Bucket,
      Key: s3Key
    };

    if (encKey !== null) {
      config.SSECustomerAlgorithm = 'AES256';
      config.SSECustomerKey = Buffer.alloc(32, encKey);
    }

    const client = new S3Client();
    const response = await client.send(new GetObjectCommand(config));
    return await response.Body.transformToString();
  },

  generateSignedUrl: async function (s3Bucket, s3Key, fileName = null, expiresInSecs = 3600) {
    const signed = await this.generateSignedUrlSSEC(s3Bucket, s3Key, null, fileName, expiresInSecs);
    return signed.url;
  },

  generateSignedUrlSSEC: async function (s3Bucket, s3Key, encKey, fileName, expiresInSecs = 3600) {
    const config = {
      Bucket: s3Bucket,
      Key: s3Key
    };

    if (fileName != null) {
      config.ResponseContentDisposition = `attachment; filename ="${fileName}"`;
    }

    if (encKey !== null) {
      config.SSECustomerAlgorithm = 'AES256';
    }

    const client = new S3Client();
    const command = new GetObjectCommand(config);

    const url = await getSignedUrl(client, command, { expiresIn: expiresInSecs });
    return {
      url,
      encKey: encKey !== null ? crypto.createHash('sha256').update(encKey, 'utf8').digest('base64') : null,
      md5Key: encKey !== null ? crypto.createHash('md5').update(encKey, 'utf8').digest('base64') : null
    };
  },

  generatePutSignedUrl: async function (s3Bucket, s3Key, contentType, expiresInSecs = 3600) {
    const signed = await this.generatePutSignedUrlSSEC(s3Bucket, s3Key, contentType, null, expiresInSecs);
    return signed.url;
  },

  generatePutSignedUrlSSEC: async function (s3Bucket, s3Key, contentType, encKey, expiresInSecs = 3600) {
    const config = {
      Bucket: s3Bucket,
      Key: s3Key,
      ContentType: contentType
    };

    if (encKey !== null) {
      config.SSECustomerAlgorithm = 'AES256';
    }

    const client = new S3Client();
    const command = new PutObjectCommand(config);

    const url = await getSignedUrl(client, command, { expiresIn: expiresInSecs });
    return {
      url,
      encKey: encKey !== null ? crypto.createHash('sha256').update(encKey, 'utf8').digest('base64') : null,
      md5Key: encKey !== null ? crypto.createHash('md5').update(encKey, 'utf8').digest('base64') : null
    };
  }

}
;
