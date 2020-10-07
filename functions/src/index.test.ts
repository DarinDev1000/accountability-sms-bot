// Require firebase-admin so we can stub out some of its methods.
const admin = require('firebase-admin');
// At the top of test/index.test.js
// const firebaseTest = require('firebase-functions-test')();

// const functions = require('firebase-functions');
// const env = functions.config();

import constants from './constants';

// Mock functions config values
// firebaseTest.mockConfig({ twilio: { mynumber: '+11234567890' }});


// Now we can require index.js and save the exports inside a namespace called myFunctions.
// const myFunctions = require('./index');
// import * as myFunctions from './index';

// To fix non exported functions
const rewire = require('rewire');
const index = rewire('./index');
let adminStub;
beforeAll(() =>{
  adminStub = jest.spyOn(admin, "initializeApp");
  // index = rewire('./index');
  return;
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

const helpCommand = index.__get__('helpCommand');
describe('helpCommand', () => {
  test('should return a string', async () => {
    expect(typeof await helpCommand('help commands')).toBe('string');
  });
  test('should return default help text', async () => {
    expect(await helpCommand('help commands')).toBe(constants.help.helpCommands);
  });
  test('should return list contact help', async () => {
    expect(await helpCommand('help list contacts')).toBe(constants.help.helpListContact);
  });
  test('should return add contact help', async () => {
    expect(await helpCommand('help add contact')).toBe(constants.help.helpAddContact);
  });
  test('should return remove contact help', async () => {
    expect(await helpCommand('help remove contact')).toBe(constants.help.helpRemoveContact);
  });
  test('should return change name help', async () => {
    expect(await helpCommand('help change name')).toBe(constants.help.helpChangeName);
  });
  test('should return report help', async () => {
    expect(await helpCommand('help report')).toBe(constants.help.helpReportNumber);
  });
});

// const createNewUser = index.__get__('createNewUser');
// describe('createNewUser', () => {
//   test('should return a string', async () => {
//     expect(await createNewUser('11234567890')).toBe('string');
//   });
// });

const standardizePhoneNumber = index.__get__('standardizePhoneNumber');
describe('standardizePhoneNumber', () => {
  test('should return a string', async () => {
    expect(typeof await standardizePhoneNumber('1234567890')).toBe('string');
  });
  test('should return an empty string if invalid', async () => {
    expect(await standardizePhoneNumber('4567890')).toBe('');
  });
  test('should return an empty string if invalid', async () => {
    expect(await standardizePhoneNumber('123')).toBe('');
  });
  test('should return correctly formatted number', async () => {
    expect(await standardizePhoneNumber('1234567890')).toBe('11234567890');
  });
  test('should return correctly formatted number', async () => {
    expect(await standardizePhoneNumber('11234567890')).toBe('11234567890');
  });
  test('should return correctly formatted number', async () => {
    expect(await standardizePhoneNumber('+11234567890')).toBe('11234567890');
  });
  test('should return correctly formatted number', async () => {
    expect(await standardizePhoneNumber('+161234567890')).toBe('161234567890');
  });
});

const parseNumberFromBody = index.__get__('parseNumberFromBody');
describe('parseNumberFromBody', () => {
  test('should return a string', async () => {
    expect(typeof await parseNumberFromBody('1234567890')).toBe('string');
  });
  test('should return an empty string if invalid', async () => {
    expect(await standardizePhoneNumber('4567890')).toBe('');
  });
});
