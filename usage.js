const ZedyacParser = require('./index');

const test = async () => {
  const parser = new ZedyacParser({ separator: ',' });
  await parser.parse('files/users.csv');
  // eslint-disable-next-line no-console
  console.log(parser.dataObject);
  // eslint-disable-next-line no-console
  console.log('File content printed');
  await parser.writeData('files/output.csv');
};

test();
