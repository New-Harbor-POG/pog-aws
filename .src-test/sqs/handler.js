/**
 * Pulls messages off the queue to process
 */

const app = require('../../app');

module.exports.onEvent = async (event, context) => {
  const appContext = app.getAppContext();

  try {
    if ('Records' in event && event.Records.length > 0) {
      for (const record of event.Records) {
        console.log(record.body);
      }
    }
  } finally {
    await appContext.close();
  }
};
