const fs = require('fs');
const fsAsync = require('fs').promises;
const readline = require('readline');
const events = require('events');

const DEFAULT_SEPARATOR = ',';
const escapeChars = ['"', `'`, '/', `\\`];

class ZedyacParser {
  constructor(options) {
    this.options = options || {};
    this.ignoredFields = {};
    (this.options.ignoreFields || []).forEach((field) => {
      this.ignoredFields[field] = true;
    });
    this.options.separator = this.options.separator ?? DEFAULT_SEPARATOR;
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
        const splittedLine = this.simpleSplitLine(line);
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
    let splits = this.simpleSplitLine(line);
    if (splits.length !== this._fullHeader.length) {
      splits = this.splitBasedOnCharacters(line);

      if (splits.length !== this._fullHeader.length) {
        throw new Error(`Failed to parse line ${line}. It should be of length ${this._fullHeader.length}, but was ${splits.length}`);
      }
    }
    this._fullHeader.forEach((value, index) => {
      if (this.ignoredFields[value]) {
        return;
      }
      data[value] = splits[index];
    });

    return data;
  }

  splitBasedOnCharacters(line) {
    const lineSplits = [];
    let currentEntity = '';
    let currentSeparator = this.options.separator;
    let specialSequenceInProgress = false;

    for (const char of line) {
      if (char === currentSeparator && !specialSequenceInProgress) {
        lineSplits.push(currentEntity);
        currentEntity = '';
        continue;
      }

      const isEscapeChar = escapeChars.includes(char);

      if (!isEscapeChar) {
        currentEntity += char;
        continue;
      }

      if (!specialSequenceInProgress) {
        specialSequenceInProgress = true;
        currentSeparator = char;
      } else {
        specialSequenceInProgress = false;
        currentSeparator = this.options.separator;
      }
    }

    if (line.endsWith(this.options.separator)) {
      lineSplits.push('');
    }

    if (currentEntity.length > 0) {
      lineSplits.push(currentEntity);
    }

    return lineSplits;
  }

  simpleSplitLine(line) {
    return line.split(this.options.separator);
  }

  joinLine(data) {
    const escapeChar = escapeChars.find(e => e !== this.options.separator);
    for (let i = 0; i < data.length; i++) {
      if (data[i].indexOf(this.options.separator) > -1) {
        data[i] = `${escapeChar}${data[i]}${escapeChar}`
      }
    }
    return data.join(this.options.separator);
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
