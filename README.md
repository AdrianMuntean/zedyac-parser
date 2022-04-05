# zedyac-parser

📓 `ZE`ro `D`ependency `Y`et `A`nother `C`sv `PARSER`. It's a pretty descriptive name if you ask me 🤓.

There are a lot of good CSV parsers out there, this one is just a simpler implementation with async behaviour and no external dependencies.

Usage:

```javascript
const parser = new ZedyacParser({ separator: ',' });
await parser.parse('files/input.csv');
console.log(parser.dataObject);
await parser.writeData('files/output.csv');
```

output

```javascript
[
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    phoneNumber: '0123456789',
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@doe.com',
    phoneNumber: '9876543210',
  },
  {
    firstName: 'James',
    lastName: 'Bond',
    email: 'james.bond@mi6.co.uk',
    phoneNumber: '0612345678',
  },
];
```

## Limitations and works in progress

- [ ] - Convert it to TypeScript
- [ ] - Allow more customization of the returned object form
- [ ] - Add code coverage
- [ ] - Benchmarks
