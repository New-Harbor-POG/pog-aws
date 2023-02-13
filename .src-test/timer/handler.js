/**
 * Gets called periodically based on schedule in serverless.yml
 */
const app = require('../../app');

module.exports.onEvent = async (event, context) => {
  const appContext = app.getAppContext();

  try {
    console.log('do something');
  } catch (err) {
    console.error(err);
  } finally {
    await appContext.close();
  }
};
