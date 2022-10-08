const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-as-promised'));
const ZedyacParser = require('../index');

const expectedObjectOutput = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    phoneNumber: '0123456789',
    address: "Main street, first to the left",
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@doe.com',
    phoneNumber: '9876543210',
    address: "Another address, with a comma, and another comma",
  },
  {
    firstName: 'James',
    lastName: 'Bond',
    email: 'james.bond@mi6.co.uk',
    phoneNumber: '0612345678',
    address: '',
  },
];
const header = ['firstName', 'lastName', 'email', 'phoneNumber', 'address'];
const filePath = 'files/users.csv';

describe('Parser', () => {
  it('should throw an error if incorrect file path', async () => {
    const parser = new ZedyacParser();

    await expect(parser.parse()).to.be.rejectedWith(Error);
    await expect(parser.parse('inexistentFile')).to.be.rejectedWith(Error);
    await expect(parser.parse('fileNotEndingIn.CSV')).to.be.rejectedWith(Error);
  });

  it('should correctly parse the CSV file', async () => {
    const parser = new ZedyacParser();
    await parser.parse(filePath);

    const expectedCsvOutput = 'firstName,lastName,email,phoneNumber,address\n'
      + 'John,Doe,john@doe.com,0123456789,"Main street, first to the left"\n'
      + 'Jane,Doe,jane@doe.com,9876543210,"Another address, with a comma, and another comma"\n'
      + 'James,Bond,james.bond@mi6.co.uk,0612345678,';

    expect(parser.header).to.eql(header);
    expect(parser.dataObject).to.eql((expectedObjectOutput));
    expect(parser.dataToCsv()).to.eq(expectedCsvOutput);
  });

  it('should return undefined from getters if the parse method was not called', async () => {
    const parser = new ZedyacParser();

    expect(parser.header).to.eql(undefined);
    expect(parser.dataObject).to.eql(undefined);
  });

  it('should be able to parse CSV with a different separator', async () => {
    const parser = new ZedyacParser({ separator: ';' });
    await parser.parse('files/users_different_separator.csv');

    expect(parser.dataObject).to.eql(expectedObjectOutput);
    expect(parser.header).to.eql(header);
  });

  it('should correctly ignore fields if configured', async () => {
    const parser = new ZedyacParser({ ignoreFields: ['firstName', 'email'] });
    await parser.parse(filePath);

    const expectedCsvOutput = 'lastName,phoneNumber,address\n'
      + 'Doe,0123456789,"Main street, first to the left"\n'
      + 'Doe,9876543210,"Another address, with a comma, and another comma"\n'
      + 'Bond,0612345678,';

    expect(parser.header).to.eql(['lastName', 'phoneNumber', 'address']);
    expect(parser.dataObject).to.eql([
      {
        lastName: 'Doe',
        phoneNumber: '0123456789',
        address: 'Main street, first to the left',
      },
      {
        lastName: 'Doe',
        phoneNumber: '9876543210',
        address: 'Another address, with a comma, and another comma',
      },
      {
        lastName: 'Bond',
        phoneNumber: '0612345678',
        address: '',
      },
    ]);
    expect(parser.dataToCsv()).to.eq(expectedCsvOutput);
  });
});
