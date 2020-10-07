// Require firebase-admin so we can stub out some of its methods.
// const admin = require('firebase-admin');
// At the top of test/index.test.js
// const firebaseTest = require('firebase-functions-test')();

// const functions = require('firebase-functions');
// const env = functions.config();

// Mock functions config values
// firebaseTest.mockConfig({ twilio: { mynumber: '+11234567890' }});


// Now we can require index.js and save the exports inside a namespace called myFunctions.
// const myFunctions = require('./index');
import * as myFunctions from './index';

// Basic test
describe('basicTest', () => {
  test('should be 6', () => {
    expect(myFunctions.basicTest()).toBe(6);
  });
});

// describe('handleIncomingMessage', () => {
//   const handleIncomingMessage = myFunctions.__get__('handleIncomingMessage');
//   it('should be 6', async () => {
//     // "Wrap" the basicTest function from index.js
//     // const wrapped = test.wrap(myFunctions.handleIncomingMessage);
//     // return assert.equal(wrapped(), true);
//     return assert.equal(await handleIncomingMessage("{IncomingMessage: {body: { Body: 'the body'}}}"), 'output')
//   });
// });

const helpCommand = myFunctions.__get__('helpCommand');
describe('helpCommand', () => {
  test('should return default help', async () => {
    expect(await helpCommand('help commands').typeof()).toBe('string');
  });
});
