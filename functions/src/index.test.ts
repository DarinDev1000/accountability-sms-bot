import { myEnv } from './env';

// Require firebase-admin so we can stub out some of its methods.
const admin = require('firebase-admin');
const firebaseTest = require('firebase-functions-test')(
  myEnv.firebaseConfig,
  {"project_id": "accountability-sms-bot"},
  '../accountability-sms-bot-f844e687d875.json'
);
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
let adminStub: any;
beforeAll(() =>{
  adminStub = jest.spyOn(admin, "initializeApp");
  // index = rewire('./index');
  return;
});

afterAll(() =>{
  adminStub.mockRestore();
  // testEnv.cleanup();
});

describe('helloWorld', () => {
  test('should be Hello From Firebase', async (done) => {
    // A fake request object
    const req = {};
    const res = {
      send: (testResponse: any) => {
      //Run the test in response callback of the HTTPS function
      expect(testResponse).toBe("Hello from Firebase!");
      //done() is to be triggered to finish the function
      done();
      }
    };
    await index.helloWorld(req,res);
  });
});

// describe('handleIncomingMessage', () => {
//   test('should be called', async (done) => {
//     // A fake request object
//     const req = {body: { Body: 'the body', "From": "+12093419681",}};
//     const res = {
//       set: jest.fn(),
//       status: (mystatus: any) => {return {send: jest.fn()}},
//       send: (testResponse: any) => {
//       //Run the test in response callback of the HTTPS function
//       expect(testResponse).toBeCalled();
//       //done() is to be triggered to finish the function
//       done();
//       }
//     };
//     await index.handleIncomingMessage(req,res);
//   });
// });

// const handleIncomingMessage = index.__get__('handleIncomingMessage');
// describe('handleIncomingMessage', () => {
//   it('should be 6', async () => {
//     // "Wrap" the basicTest function from index.js
//     // const wrapped = test.wrap(myFunctions.handleIncomingMessage);
//     // return assert.equal(wrapped(), true);
//     expect(await handleIncomingMessage("{IncomingMessage: {body: { Body: 'the body'}}}").toBeTruthy());
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
