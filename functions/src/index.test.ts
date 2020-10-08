// ----- My Imports -----
import { myEnv } from './env';
import constants from './constants';
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
    index.deleteUserDocument('11234567890');
    index.deleteUserDocument('11234567891');
    // index.deleteUserDocument('testnumber');
    index.deleteUserDocument('testnumber1');
    index.deleteUserDocument('testnumber2');
    index.deleteUserDocument('testnumber3');
    index.deleteUserDocument('testnumber4');
  });

  describe('helloWorld', () => {
    it('should be Hello From Firebase', async (done) => {
      // A fake request object
      const req = {};
      const res = {
        send: (testResponse: any) => {
        //Run the test in response callback of the HTTPS function
        expect(testResponse).to.be.equal("Hello from Firebase!");
        //done() is to be triggered to finish the function
        done();
        }
      };
      await index.helloWorld(req,res);
    });
  });

  describe('handleIncomingMessage', () => {
    it('should return status 200', async () => {
      // A fake request object, with req.query.text set to 'input'
      const req = {
          body: {
            Body: 'test body',
            From: '+11234567890'
          }
      };
      // A fake response object, with a stubbed send function which asserts that it is called
      const res = {
        set: () => {},
        status: (statusCode: number) => {
          expect(statusCode).to.be.equal(200);
        },
        send: (testResponse: any) => {}
      };
      // Invoke handleIncomingMessage with our fake request and response objects. This will cause the
      // assertions in the response object to be evaluated.
      await index.handleIncomingMessage(req, res);
    });
    it('should return new user response', async () => {
      const req = { body: { Body: 'test body', From: '+11234567891'}};
      const res = {
        set: () => {},
        status: (statusCode: number) => {},
        send: (testResponse: any) => {
          //Run the test in response callback of the HTTPS function
          expect(testResponse).to.be.equal('<?xml version="1.0" encoding="UTF-8"?><Response><Message>\nWelcome to the Accountability Bot!\nTo see a list of commands, text "help commands"</Message></Response>');
        }
      };
      await index.handleIncomingMessage(req, res);
    });
    it('should return existing user response', async () => {
      const req = { body: { Body: 'test body', From: '+11234567891'}};
      const res = {
        set: () => {},
        status: (statusCode: number) => {},
        send: (testResponse: any) => {
          //Run the test in response callback of the HTTPS function
          expect(testResponse).to.be.equal('<?xml version="1.0" encoding="UTF-8"?><Response><Message>\nWelcome back!\ntest body</Message></Response>');
        }
      };
      await index.handleIncomingMessage(req, res);
    });
  });

  describe('helpCommand', () => {
    const helpCommand = index.__get__('helpCommand');
    it('should return a string', async () => {
      expect(typeof await helpCommand('help commands')).to.be.equal('string');
      return assert.typeOf(await helpCommand('help commands'), 'string');
    });
    it('should return default help text', async () => {
      expect(await helpCommand('help commands')).to.be.equal(constants.help.helpCommands);
    });
    it('should return list contact help', async () => {
      expect(await helpCommand('help list contacts')).to.be.equal(constants.help.helpListContact);
    });
    it('should return add contact help', async () => {
      expect(await helpCommand('help add contact')).to.be.equal(constants.help.helpAddContact);
    });
    it('should return remove contact help', async () => {
      expect(await helpCommand('help remove contact')).to.be.equal(constants.help.helpRemoveContact);
    });
    it('should return change name help', async () => {
      expect(await helpCommand('help change name')).to.be.equal(constants.help.helpChangeName);
    });
    it('should return report help', async () => {
      expect(await helpCommand('help report')).to.be.equal(constants.help.helpReportNumber);
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
    xit('should not overwrite existing user', async () => {
      await createNewUser('testnumber4');
      return assert.notProperty(await createNewUser('testnumber4'), 'writeTime');
    });
  });

  const standardizePhoneNumber = index.__get__('standardizePhoneNumber');
  describe('standardizePhoneNumber', () => {
    it('should return a string', async () => {
      expect(typeof await standardizePhoneNumber('1234567890')).to.be.equal('string');
    });
    it('should return an empty string if invalid', async () => {
      expect(await standardizePhoneNumber('4567890')).to.be.equal('');
    });
    it('should return an empty string if invalid', async () => {
      expect(await standardizePhoneNumber('123')).to.be.equal('');
    });
    it('should return correctly formatted number', async () => {
      expect(await standardizePhoneNumber('1234567890')).to.be.equal('11234567890');
    });
    it('should return correctly formatted number', async () => {
      expect(await standardizePhoneNumber('11234567890')).to.be.equal('11234567890');
    });
    it('should return correctly formatted number', async () => {
      expect(await standardizePhoneNumber('+11234567890')).to.be.equal('11234567890');
    });
    it('should return correctly formatted number', async () => {
      expect(await standardizePhoneNumber('+161234567890')).to.be.equal('161234567890');
    });
  });

  const parseNumberFromBody = index.__get__('parseNumberFromBody');
  describe('parseNumberFromBody', () => {
    it('should return a string', async () => {
      expect(typeof await parseNumberFromBody('1234567890')).to.be.equal('string');
    });
    it('should return an empty string if invalid', async () => {
      expect(await standardizePhoneNumber('4567890')).to.be.equal('');
    });
  });



  describe('last', () => {
    it('should exist', async () => {
      return true;
    });
  });

});
