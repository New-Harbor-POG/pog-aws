/**
 * Provides a simple mechanism for sending to a queue
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ses/globals.html
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/ses-examples-sending-email.html
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const Mustache = require('mustache');

module.exports = {

  /**
   * Sends an email using only the HTML field
   */
  sendHtml: async function (fromEmail, toEmail, subject, htmlBody, dropIns = null) {
    const event = await this.sendHtmlText(fromEmail, toEmail, subject, htmlBody, null, dropIns);
    return event;
  },

  /**
   * Sends an email, and will return back an object with the results
   */
  sendHtmlText: async function (fromEmail, toEmail, subject, htmlBody, textBody = null, dropIns = null) {
    toEmail = Array.isArray(toEmail) ? toEmail : [toEmail];

    if (dropIns != null && typeof dropIns === 'object') {
      htmlBody = Mustache.render(htmlBody, dropIns);
      textBody = Mustache.render(textBody, dropIns);
      subject = Mustache.render(subject, dropIns);
    }

    //
    // Set the SES Parameters
    const sesParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: toEmail
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlBody
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      }
    };

    //
    // Add in the text body if available
    if (textBody !== null) {
      if (dropIns != null && typeof dropIns === 'object') {
        textBody = Mustache.render(textBody, dropIns);
      }

      sesParams.Message.Body.Text = {
        Charset: 'UTF-8',
        Data: textBody
      };
    }

    try {
      const client = new SESClient();
      const command = new SendEmailCommand(sesParams);

      const sesId = await client.send(command);

      const event = {
        toEmail: toEmail,
        fromEmail: fromEmail,
        subject: subject,
        htmlBody: htmlBody
      };

      if (textBody != null) {
        event.textBody = textBody;
      }

      if (sesId.MessageId) {
        event.messageId = sesId.MessageId;
      }

      return event;
    } catch (e) {
      console.error(`send(to=${toEmail}); ${e}`);
      throw e;
    }
  }

};
