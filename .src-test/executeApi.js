process.env.ENV = 'dev';
process.env.AWS_SDK_LOAD_CONFIG = 1;

async function main () {
  console.log('POG-AWS API Executor Runner___________________\r\n');

  try {
    const lambdaRunner = require('../api-app/ExecuteLocal');

    lambdaRunner.setHandler(require('./api/_lambda'));
    const res = await lambdaRunner.doGet('/time');

    console.log(res);
  } catch (err) {
    console.log(err);
  } finally {
    console.log('\r\nCompleted');
    process.exit();
  }
}

main();