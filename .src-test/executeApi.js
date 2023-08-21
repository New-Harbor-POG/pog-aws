process.env.ENV = 'dev';
process.env.AWS_SDK_LOAD_CONFIG = 1;
process.env.AWS_PROFILE = 'dev-v2.escalon';

async function main () {
  console.log('POG-AWS API Executor Runner___________________\r\n');

  try {
    // const lambdaRunner = require('../api-app/ExecuteLocal');
    // lambdaRunner.setHandler(require('./api/_lambda'));
    // const res = await lambdaRunner.doGet('/time');

    const s3 = require('../s3');

    const encKey = 'f1dba74966e6448249fe24c8551ea1df4b6869a4721e453ede6b5157b6b8c489';
    const s3Bucket = 'dev-hr-engine-secure-files-escalon';
    const s3Key = 'alan3.txt';

   // await s3.put(s3Bucket, s3Key, 'this is my test file');

    //await s3.putSSEC(s3Bucket, s3Key, encKey, 'this is my test file');
    const a = await s3.generateSignedUrSSEC(s3Bucket, s3Key, encKey);

    // const a = await s3.getAsStringSSEC(s3Bucket, s3Key, encKey);
    console.log(a)

  } catch (err) {
    console.log(err);
  } finally {
    console.log('\r\nCompleted');
    process.exit();
  }
}

main();