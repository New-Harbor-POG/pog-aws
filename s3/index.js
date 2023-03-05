/**
 * Provides a simple mechanism for sending to a queue
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/globals.html
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html
 */

const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

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
    const config = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fs.readFileSync(filePath)
    };

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
    const config = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileBody
    };

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
    const client = new S3Client();
    const response = await client.send(new GetObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key
    }));
    return await response.Body.transformToByteArray();
  },

  getAsString: async function (s3Bucket, s3Key) {
    const client = new S3Client();
    const response = await client.send(new GetObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key
    }));
    return await response.Body.transformToString();
  },

  generateSignedUrl: async function (s3Bucket, s3Key, fileName, expiresInSecs = 3600) {
    const client = new S3Client();
    const command = new GetObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename ="${fileName}"`
    });

    const url = await getSignedUrl(client, command, { expiresIn: expiresInSecs });
    return url;
  }
}
;
