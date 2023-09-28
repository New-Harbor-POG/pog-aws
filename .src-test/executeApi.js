process.env.ENV = 'dev';
process.env.AWS_SDK_LOAD_CONFIG = 1;
process.env.AWS_PROFILE = 'dev-v2.escalon';

const axios = require('axios');
const fs = require('fs');

async function main () {
  console.log('POG-AWS API Executor Runner___________________\r\n');

  try {
    // const lambdaRunner = require('../api-app/ExecuteLocal');
    // lambdaRunner.setHandler(require('./api/_lambda'));
    // const res = await lambdaRunner.doGet('/time');

    const s3 = require('../s3');

    const encKey = 'a48a845b03ba433ee2ab21780436154';
    const s3Bucket = 'dev-hr-engine-secure-files-escalon';

    const file = 'C:\\Users\\Alan\\Downloads\\00015.jpg'
    const s3Key = 'files/01/00015.jpg';

    const a = await s3.generatePutSignedUrlSSEC(s3Bucket, s3Key, 'image/jpeg', encKey);
    console.log(a)
    
    const b = await axios.put(a.url, fs.createReadStream(file), {
      headers: {
        'Content-length': fs.statSync(file).size,
        'Content-Type': 'image/jpeg',
        'x-amz-server-side-encryption-customer-algorithm': 'AES256',
        'x-amz-server-side-encryption-customer-key': a.encKey,
        'x-amz-server-side-encryption-customer-key-MD5': a.md5Key
      }
    });

    console.log(b);

   // await s3.put(s3Bucket, s3Key, 'this is my test file');

    // await s3.putSSEC(s3Bucket, s3Key, encKey, 'this is my test file');
    // const a = await s3.generateSignedUrlSSEC(s3Bucket, s3Key, encKey);

    // // const a = await s3.getAsStringSSEC(s3Bucket, s3Key, encKey);
    // console.log(a)

  } catch (err) {
    console.log(err);
  } finally {
    console.log('\r\nCompleted');
    process.exit();
  }
}

main();