process.env.ENV = 'dev';
process.env.AWS_SDK_LOAD_CONFIG = 1;

async function main () {
  console.log('POG-AWS Timer Executor Runner___________________\r\n');

  try {
    const lambdaRunner = require('../timer/ExecuteLocal');
    lambdaRunner.setHandler(require('./timer/handler'));
    await lambdaRunner.doTime();
  } catch (err) {
    console.log(err);
  } finally {
    console.log('\r\nCompleted');
    process.exit();
  }
}

main();