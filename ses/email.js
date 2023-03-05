/**
 * For working with the emails from SES
 */
const simpleParser = require('mailparser').simpleParser;
const crypto = require('crypto');
const s3 = require('../s3');

module.exports = {

  getFromText: async function (textContext) {
    const parsedMail = await simpleParser(textContext);
    return new Email(parsedMail);
  },

  getFromS3: async function (s3Bucket, s3Key) {
    const emailContent = await s3.getAsString(s3Bucket, s3Key);
    const parsedMail = await simpleParser(emailContent);
    return new Email(parsedMail);
  }

};

// ---------------

class Email {
  constructor (parsedMail) {
    this.parsedMail = parsedMail;
  }

  getParsedEmail () {
    return this.parsedMail;
  }

  getTo () {
    if ('to' in this.parsedMail && 'value' in this.parsedMail.to && this.parsedMail.to.value.length > 0) {
      this.parsedMail.to.value[0].address = this.parsedMail.to.value[0].address.toLowerCase();
      return this.parsedMail.to.value[0];
    } else {
      throw new Error('[-] Missing TO');
    }
  }

  getFrom () {
    if ('from' in this.parsedMail && 'value' in this.parsedMail.from && this.parsedMail.from.value.length > 0) {
      this.parsedMail.from.value[0].address = this.parsedMail.from.value[0].address.toLowerCase();
      return this.parsedMail.from.value[0];
    } else {
      throw new Error('[-] Missing FROM');
    }
  }

  getMessageId () {
    return 'messageId' in this.parsedMail ? crypto.createHash('md5').update(this.parsedMail.messageId).digest('hex') : new Date().getTime();
  }

  getRecipients () {
    if ('recipients' in this) {
      return this.recipients;
    }

    this.recipients = [];

    if ('to' in this.parsedMail && 'value' in this.parsedMail.to) {
      for (const to of this.parsedMail.to.value) {
        if ('address' in to) {
          this.recipients.push(to.address.toLowerCase());
        }
      }
    }

    if ('cc' in this.parsedMail && 'value' in this.parsedMail.cc) {
      for (const cc of this.parsedMail.cc.value) {
        if ('address' in cc) {
          this.recipients.push(cc.address.toLowerCase());
        }
      }
    }
    return this.recipients;
  }

  getSubject () {
    return ('subject' in this.parsedMail) ? this.parsedMail.subject : '';
  }

  getDate () {
    return ('date' in this.parsedMail) ? this.parsedMail.date : new Date();
  }

  getBody () {
    return ('textAsHtml' in this.parsedMail) ? this.parsedMail.textAsHtml : 'no body';
  }

  getAttachments () {
    return ('attachments' in this.parsedMail) ? this.parsedMail.attachments : [];
  }
}
