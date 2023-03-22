const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

const readLine = module.exports = function (file, opts) {
  if (!(this instanceof readLine)) return new readLine(file, opts);

  EventEmitter.call(this);
  opts = opts || {};
  opts.maxLineLength = opts.maxLineLength || 4096; // 4K
  opts.retainBuffer = !!opts.retainBuffer; // do not convert to String prior to invoking emit 'line' event
  const self = this;
  const lineBuffer = new Buffer(opts.maxLineLength);
  let lineLength = 0;
  let lineCount = 0;
  let byteCount = 0;
  const emit = function (lineCount, byteCount) {
    try {
      const line = lineBuffer.slice(0, lineLength);
      self.emit('line', opts.retainBuffer ? line : line.toString(), lineCount, byteCount);
    } catch (err) {
      self.emit('error', err);
    } finally {
      lineLength = 0; // Empty buffer.
    }
  };
  this.input = (typeof file === 'string') ? fs.createReadStream(file, opts) : file;
  this.input.on('open', function (fd) {
    self.emit('open', fd);
  })
    .on('data', function (data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] == 10 || data[i] == 13) { // Newline char was found.
          if (data[i] == 10) {
            lineCount++;
            emit(lineCount, byteCount);
          }
        } else {
          lineBuffer[lineLength] = data[i]; // Buffer new line data.
          lineLength++;
        }
        byteCount++;
      }
    })
    .on('error', function (err) {
      self.emit('error', err);
    })
    .on('end', function () {
      // Emit last line if anything left over since EOF won't trigger it.
      if (lineLength) {
        lineCount++;
        emit(lineCount, byteCount);
      }
      self.emit('end');
    })
    .on('close', function () {
      self.emit('close');
    });
};
util.inherits(readLine, EventEmitter);
