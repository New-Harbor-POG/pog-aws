process.env.ENV = 'dev';
process.env.AWS_SDK_LOAD_CONFIG = 1;

async function main () {
  console.log('POG-AWS SQS Executor Runner___________________\r\n');

  try {
    const lambdaRunner = require('../sqs/ExecuteLocal');
    lambdaRunner.setHandler(require('./sqs/handler'));
    await lambdaRunner.doMessage({ sampleMessage: 3 });
  } catch (err) {
    console.log(err);
  } finally {
    console.log('\r\nCompleted');
    process.exit();
  }
}

main();