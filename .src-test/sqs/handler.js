/**
 * Pulls messages off the queue to process
 */

const app = require('../../app');
const { _ } = require('lodash');

module.exports.onEvent = async (event, context) => {
  const appContext = app.getAppContext();

  try {
    if (_.has(event, 'Records') && !_.isEmpty(event.Records)) {
      for (const record of event.Records) {
        console.log(record.body);
      }
    }
  } finally {
    await appContext.close();
  }
};
