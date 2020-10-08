// // Online version setup
// const firebaseTest = require('firebase-functions-test')({
//   databaseURL: 'https://my-project.firebaseio.com',
//   storageBucket: 'my-project.appspot.com',
//   projectId: 'my-project',
// }, 'path/to/serviceAccountKey.json');

// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
const assert = chai.assert;
// Sinon is a library used for mocking or verifying function calls in JavaScript.
const sinon = require('sinon');
// For not exported functions
const rewire = require('rewire');

// Require firebase-admin so we can stub out some of its methods.
const admin = require('firebase-admin');
// At the top of test/index.test.js
// const firebaseTest = require('firebase-functions-test')();

const functions = require('firebase-functions');
const env = functions.config();

// Mock functions config values
// firebaseTest.mockConfig({ twilio: { mynumber: '+11234567890' }});

// If index.js calls admin.initializeApp at the top of the file,
// we need to stub it out before requiring index.js. This is because the
// functions will be executed as a part of the require process.
// Here we stub admin.initializeApp to be a dummy function that doesn't do anything.
const adminInitStub = sinon.stub(admin, 'initializeApp');

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
//   const handleIncomingMessage = index.__get__('handleIncomingMessage');
//   it('should be 6', async () => {
//     // "Wrap" the basicTest function from index.js
//     // const wrapped = test.wrap(index.handleIncomingMessage);
//     // return assert.equal(wrapped(), true);
//     return assert.equal(await handleIncomingMessage("{IncomingMessage: {body: { Body: 'the body'}}}"), 'output')
//   });
// });

describe('helpCommand', () => {
  const helpCommand = index.__get__('helpCommand');
  it('should return default help', async () => {
    return assert.typeOf(await helpCommand('help commands'), 'string');
  });
});
