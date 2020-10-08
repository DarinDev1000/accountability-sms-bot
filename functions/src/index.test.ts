// ----- My Imports -----
import { myEnv } from './env';
// import * as admin from 'firebase-admin';
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
  projectId: 'accountability-sms-bot-test',
}, './accountability-sms-bot-test-firebase-adminsdk-bepel-ab6b2ae9f4.json');
// const functionsTest = firebaseTest(
//   myEnv.firebaseConfig, 
//   './accountability-sms-bot-test-firebase-adminsdk-bepel-ab6b2ae9f4.json'
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
// functionsTest.mockConfig(myEnv); // Should I use the actual keys?

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


describe('Firebase Functions', () => {

  before(() => {
    // Stuff to run before
    // const db = admin.firestore();
  });

  after(async () => {
    // Do cleanup tasks.
    await functionsTest.cleanup();
    // Reset the database. // don't accidentally delete the prod database
    // index.deleteUserDocument('testnumber');
    index.deleteUserDocument('testnumber1');
    index.deleteUserDocument('testnumber2');
    index.deleteUserDocument('testnumber3');
  });

  // describe('handleIncomingMessage', () => {
  //   it('should return', async (done) => {
  //     // A fake request object, with req.query.text set to 'input'
  //     const req = {
  //         body: {
  //           Body: 'the body',
  //           From: '+11234567890'
  //         }
  //     };
  //     // A fake response object, with a stubbed redirect function which asserts that it is called
  //     // with parameters 303, 'new_ref'.
  //     const res = {
  //       redirect: (code: any, url: any) => {
  //         assert.equal(code, 303);
  //         assert.equal(url, 'new_ref');
  //         done();
  //       },
  //       send: (code: any, url: any) => {
  //         assert.equal(code, 303);
  //         assert.equal(url, 'new_ref');
  //         done();
  //       },
  //       set: () => {}
  //     };

  //     // Invoke handleIncomingMessage with our fake request and response objects. This will cause the
  //     // assertions in the response object to be evaluated.
  //     index.handleIncomingMessage(req, res);
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
      return assert.isOk(await createNewUser('testnumber1'));
      // return expect(await createNewUser('testnumber1')).to.exist;
    });
    it('should return object', async () => {
      return assert.isObject(await createNewUser('testnumber2'));
    });
    it('should have writeTime property', async () => {
      return assert.property(await createNewUser('testnumber3'), 'writeTime');
    });
  });
  
  describe('last', () => {
    it('should exist', async () => {
      return true;
    });
  });

});
