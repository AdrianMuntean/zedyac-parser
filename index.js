const fs = require('fs');
const fsAsync = require('fs').promises;
const readline = require('readline');
const events = require('events');

const DEFAULT_SEPARATOR = ',';

class ZedyacParser {
  constructor(options) {
    this.options = options || {};
    this.ignoredFields = {};
    (this.options.ignoreFields || []).forEach((field) => {
      this.ignoredFields[field] = true;
    });
  }

  static validateFilePath(csvFilePath) {
    if (!csvFilePath) {
      throw new Error('Please provide the csv file path');
    }

    if (typeof (csvFilePath) !== 'string') {
      throw new Error('Unknown format of csv file path');
    }

    if (!csvFilePath.endsWith('.csv')) {
      throw new Error(`Unsupported format of file ${csvFilePath}`);
    }

    return true;
  }

  async writeData(outputPath) {
    const csvData = this.dataToCsv();
    await fsAsync.writeFile(outputPath, csvData);
  }

  async parse(csvFilePath) {
    ZedyacParser.validateFilePath(csvFilePath);
    const data = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(csvFilePath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (!this.header) {
        const splittedLine = this.splitLine(line);
        this.header = splittedLine;
        this._fullHeader = splittedLine;
      } else {
        data.push(this.parseLine(line));
      }
    });

    await events.once(rl, 'close');
    this.dataObject = data;
  }

  get dataObject() {
    return this._data;
  }

  set dataObject(data) {
    this._data = data;
  }

  get header() {
    return this._header;
  }

  set header(header) {
    const filteredHeader = header.filter((value) => !this.ignoredFields[value]);
    this._header = filteredHeader;
  }

  parseLine(line) {
    const data = {};
    const splits = this.splitLine(line);
    this._fullHeader.forEach((value, index) => {
      if (this.ignoredFields[value]) {
        return;
      }
      data[value] = splits[index];
    });

    return data;
  }

  splitLine(line) {
    return line.split(this.options.separator || DEFAULT_SEPARATOR);
  }

  joinLine(data) {
    return data.join(this.options.separator || DEFAULT_SEPARATOR);
  }

  dataToCsv() {
    let csvData = this.joinLine(this.header);
    this.dataObject.forEach((line) => {
      csvData = csvData.concat('\n');
      csvData = csvData.concat(this.joinLine(Object.values(line)));
    });

    return csvData;
  }
}

module.exports = ZedyacParser;
