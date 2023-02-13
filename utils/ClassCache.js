/**
 * A timed hashmap that will expire items after a given number of minutes
 */
module.exports = class ClassCache {
  constructor (timeoutMins) {
    this.timeoutMs = timeoutMins * 60 * 1000;
    this.data = {};
  }

  setItem (key, itemValue) {
    this.data[key] = {
      expiresTs: new Date().getTime() + this.timeoutMs,
      value: itemValue
    };
  }

  getItem (key) {
    if (!(key in this.data)) {
      return null;
    }

    const item = this.data[key];
    if (item.expiresTs < new Date().getTime()) {
      delete this.data[key];
      return null;
    } else {
      return item.value;
    }
  }
};
