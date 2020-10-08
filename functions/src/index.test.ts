// ----- My Imports -----
import { myEnv } from './env';
// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
// Sinon is a library used for mocking or verifying function calls in JavaScript.
const sinon = require('sinon');
// For not exported functions
const rewire = require('rewire');


// ----- Online version setup -----
import firebaseTest = require('firebase-functions-test');

const functionsTest = firebaseTest({
  databaseURL: 'http://localhost:5013',
  projectId: 'accountability-sms-bot',
}, './accountability-sms-bot-f844e687d875.json');
// const functionsTest = firebaseTest(
//   myEnv.firebaseConfig, 
//   './accountability-sms-bot-f844e687d875.json'
// );

// ----- Offline mode setup -----
// const functionsTest = require('firebase-functions-test')();


// ----- Mocking config values -----
// index contains this code:
/*
  const env = functions.config();
*/
// So we can Mock functions config values
functionsTest.mockConfig({ twilio: { mynumber: '+11234567890' }});
// functionsTest.mockConfig(myEnv); // Should I use teh actual keys?

// // ----- If in offline mode, stub admin.initializeApp(); -----
// // This is so `admin.initializeApp()` runs correctly
// const admin = require('firebase-admin');
// // If index.js calls admin.initializeApp at the top of the file,
// // we need to stub it out before requiring index.js. This is because the
// // functions will be executed as a part of the require process.
// // Here we stub admin.initializeApp to be a dummy function that doesn't do anything.
// const adminInitStub = sinon.stub(admin, 'initializeApp');

// ----- Importing your functions -----
// Now we can require index.js and save the exports inside a namespace called myFunctions.
// const index = require('./index'); // Replacing this with rewire for non exported functions
const index = rewire('./index'); // This allow me to not have to export functions


// Basic test
describe('basicTest', () => {
  it('should be 6', () => {
    return assert.equal(index.basicTest(), 6);
  });
});

// describe('handleIncomingMessage', () => {
//   it('should be 6', async () => {
//     // "Wrap" the basicTest function from index.js
//     const wrapped = functionsTest.wrap(index.handleIncomingMessage);
//     return assert.equal(wrapped(), true);
//     // return assert.equal(await handleIncomingMessage("{IncomingMessage: {body: { Body: 'the body'}}}"), 'output')
//   });
// });

describe('helpCommand', () => {
  const helpCommand = index.__get__('helpCommand');
  it('should return default help', async () => {
    return assert.typeOf(await helpCommand('help commands'), 'string');
  });
  it('should return default help', async () => {
    return assert.equal(await helpCommand('help commands'), `
"help commands"
"list contacts"
"add contact 1234567890"
"remove contact 1234567890"
"name Paul"
"report 10"
"history"

You can also look at detailed help for a command:
"help <command name>"`);
  });
});

describe('createNewUser', () => {
  const createNewUser = index.__get__('createNewUser');
  it('should exist', async () => {
    // return assert.isOk(await createNewUser('+11234567890'));
    return expect(await createNewUser('testnumber')).to.exist;
  });
  it('should return object', async () => {
    return assert.isObject(await createNewUser('testnumber'));
    // return expect(await createNewUser('+11234567890')).to.exist;
  });
  it('should have writeTime property', async () => {
    return assert.property(await createNewUser('testnumber'), 'writeTime');
  });
});
