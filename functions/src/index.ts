import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import MessagingResponseType = require('twilio/lib/twiml/MessagingResponse');

const { MessagingResponse } = require('twilio').twiml;
const twilio = require('twilio');

const env = functions.config();

admin.initializeApp();
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// export const twilioTrial = functions.https.onRequest((request, response) => {
//   functions.logger.info("twilioTrial", { structuredData: true });

//   const accountSid = env.twilio.accountsid; // Your Account SID from www.twilio.com/console
//   const authToken = env.twilio.authtoken; // Your Auth Token from www.twilio.com/console

//   const client = new twilio(accountSid, authToken);

//   client.messages
//     .create({
//       body: "Hello from Node",
//       to: env.twilio.mynumber, // Text this number
//       from: env.twilio.twilionumber // From a valid Twilio number
//     })
//     .then((message: any) => console.log(message.sid));

//   response.send("Sent");
// });

// export const twilioReceiveAndSend = functions.https.onRequest((request, response) => {
//   functions.logger.info("twilioReceiveAndSend", { structuredData: true });

//   console.log('body: ', request.body.Body);

//   const twiml = new MessagingResponse();
//   if (request.body.Body) {
//     twiml.message(request.body.Body);
//   } else {
//     response.status(400).end();
//     throw console.error('no body received');
//   }

//   console.log('response: ', twiml.toString());
//   response.set({ "Content-Type": "text/xml" });
//   response.status(200).send(twiml.toString());
// });

// export const logRequest = functions.https.onRequest((request, response) => {
//   functions.logger.info("logRequest", { structuredData: true });
//   console.log(request.body);
//   response.send("logging");
// });

export const handleIncomingMessage = functions.https.onRequest(async (request, response) => {
  functions.logger.info('handleIncomingMessage', { structuredData: true });
  // console.log(request.body);
  let responseMessage = 'Default Message';
  const incomingBody: string = request.body.Body;
  const incomingBodyLowercase = incomingBody.toLowerCase();
  console.log({ incomingBody });

  // Check if incoming body exist
  if (!request.body.Body) {
    response.status(400).end('no body received');
    return;
  }

  // standardize Phone Number (Country code without the '+')
  const incomingPhoneNumber: string = await request.body.From.slice(-11);
  console.log('incomingPhoneNumber: ', incomingPhoneNumber);

  // Check if new user
  const isNewUser = await checkIfNewUser(incomingPhoneNumber);
  if (isNewUser) {
    responseMessage = 'Welcome to the Accountability Bot!\nTo see a list of commands, text "bot help"';
  } else {
    // If existing user, check commands
    responseMessage = `Welcome back!\n${incomingBody}`; // Default If no command is matched

    // Handle Commands
    if (incomingBodyLowercase.includes('help')) {
      functions.logger.info('command: help');
      responseMessage = await helpCommand(incomingBodyLowercase);
    } else 
    if (incomingBodyLowercase.includes('hello')) {
      functions.logger.info('command: hello');
      responseMessage = 'Hello to you too!';
    } else 
    if (incomingBodyLowercase.includes('list') && incomingBodyLowercase.includes('contact')) {
      functions.logger.info('command: list contacts');
      responseMessage = await listContactsCommand(incomingPhoneNumber);
    } else 
    if (incomingBodyLowercase.includes('add') && incomingBodyLowercase.includes('contact')) {
      functions.logger.info('command: add contact');
      responseMessage = await addContactCommand(incomingPhoneNumber, incomingBodyLowercase);
    } else 
    if (incomingBodyLowercase.includes('remove') && incomingBodyLowercase.includes('contact')) {
      functions.logger.info('command: remove contact');
      responseMessage = await removeContactCommand(incomingPhoneNumber, incomingBodyLowercase);
    } else 
    if (incomingBodyLowercase.includes('name')) {
      functions.logger.info('command: name');
      responseMessage = await changeFirstName(incomingPhoneNumber, incomingBody);
    } 
  }

  // Respond to message
  const twiml: MessagingResponseType = new MessagingResponse();
  await twiml.message(responseMessage);
  console.log('response: ', twiml.toString());
  response.set({ 'Content-Type': 'text/xml' });
  // Currently, make new line because of trial text
  response.status(200).send(`\n${twiml.toString()}`);
});

// ---------------------
//   Command Functions
// ---------------------
const helpCommand = async (incomingBodyLowercase: string): Promise<string> => {
  let helpMessage = 'Default Help Message';
  // Handle help commands
  if (incomingBodyLowercase.includes('list') && incomingBodyLowercase.includes('contact')) {
    helpMessage = '"list contacts"  -  list your accountable contacts';
  } else if (incomingBodyLowercase.includes('add') && incomingBodyLowercase.includes('contact')) {
    helpMessage = '"add contact <phone number>"  -  add a contact';
  } else if (incomingBodyLowercase.includes('remove') && incomingBodyLowercase.includes('contact')) {
    helpMessage = '"remove contact <phone number>"  -  remove a contact';
  } else if (incomingBodyLowercase.includes('name')) {
    helpMessage = '"name <your name>"  -  your first name for your contacts to see';
  } else if (incomingBodyLowercase.includes('report')) {
    helpMessage = '"report <number>"  -  how did you do since your last report? (number 1-10)';
  } else {
    helpMessage = `Commands:
"help commands"
"list contacts"
"add contact 1234567890"
"remove contact 1234567890"
"name Paul"
"report <number>"`;
  }
  return helpMessage;
};

const listContactsCommand = async (incomingPhoneNumber: string): Promise<string> => {
  let contactString = 'Here is your contacts:';
  // Create a reference to the cities collection
  const userDocument: admin.firestore.DocumentSnapshot = await db.collection('users').doc(incomingPhoneNumber).get();
  const contactList = await userDocument.get('contacts');
  await contactList.forEach((contactNumber: string) => {
    contactString += `\n${formatPhoneNumberFancy(contactNumber, false)}`;
  });
  console.log({ contactList });
  // console.log('contactString: ', contactString);
  return contactString;
};

const addContactCommand = async (incomingPhoneNumber: string, incomingBody: string): Promise<string> => {
  const contactNumberToAdd = await standardizePhoneNumber(incomingBody);
  console.log({ contactNumberToAdd });
  if (contactNumberToAdd.length <= 9) {
    return 'Did not find a number to add.\nAdd a number in this format:\n"add contact 1234567890"';
  }
  // Create a reference to the user document
  const userDocumentRef: admin.firestore.DocumentReference = await db.collection('users').doc(incomingPhoneNumber);
  const contactList: Array<string> = await (await userDocumentRef.get()).get('contacts');
  // Check if number exist in list
  if (contactList.includes(contactNumberToAdd)) {
    return `${contactNumberToAdd} is already in your contact list`;
  }
  // Add the number to the contact list
  await contactList.push(contactNumberToAdd);
  const updateResponse = await userDocumentRef.update('contacts', contactList);
  console.log({ contactList });
  return `Added ${formatPhoneNumberFancy(contactNumberToAdd, true, true)} to your contact list`;
};

const removeContactCommand = async (incomingPhoneNumber: string, incomingBody: string): Promise<string> => {
  const contactNumberToRemove = await standardizePhoneNumber(incomingBody);
  console.log({ contactNumberToRemove });
  if (contactNumberToRemove.length <= 9) {
    return 'Did not find a number to add.\nAdd a number in this format:\n"add contact 1234567890"';
  }
  // Create a reference to the user document
  const userDocumentRef: admin.firestore.DocumentReference = await db.collection('users').doc(incomingPhoneNumber);
  const contactList: Array<string> = await (await userDocumentRef.get()).get('contacts');
  // Check if number exist in list
  if (!contactList.includes(contactNumberToRemove)) {
    return `${contactNumberToRemove} is not on your contact list`;
  }
  // Remove the number from the contact list
  const removeKey = await contactList.indexOf(contactNumberToRemove);
  if (removeKey > -1) {
    await contactList.splice(removeKey, 1);
  };
  const updateResponse = await userDocumentRef.update('contacts', contactList);
  console.log({ contactList });
  return `Removed ${formatPhoneNumberFancy(contactNumberToRemove, true, true)} from your contact list`;
};

const changeFirstName = async (incomingPhoneNumber: string, incomingBody: string): Promise<string> => {
  const firstName = await parseFirstNameFromBody(incomingBody);
  console.log({ firstName });
  if (firstName.length < 2) {
    return 'Did not find a name.\nAdd a name in this format:\n"name Paul"';
  }
  // Create a reference to the user document
  const userDocumentRef: admin.firestore.DocumentReference = await db.collection('users').doc(incomingPhoneNumber);
  // Add the name
  const updateResponse = await userDocumentRef.update('firstName', firstName);
  return `Added ${firstName} as your name`;
};


// ---------------------
//   Utility Functions
// ---------------------
const checkIfNewUser = async (incomingPhoneNumber: string): Promise<boolean> => {
  // Default Existing User
  let isNewUser = false;

  // Create a reference to the cities collection
  const usersRef: admin.firestore.CollectionReference = db.collection('users');

  // Create a query against the collection
  // const queryRef: any = await usersRef.where('phoneNumber', '==', incomingPhoneNumber).get();
  const queryRef: admin.firestore.QuerySnapshot = await usersRef.where('phoneNumber', '==', incomingPhoneNumber).get();
  // const queryRef: admin.firestore.DocumentReference =  usersRef.doc(incomingPhoneNumber);

  // if (!users.hasOwnProperty(incomingPhoneNumber)) {  // This was using the hard coded user variable
  // console.log('queryRef empty ', queryRef.empty)
  // console.log('queryRef size ', queryRef.size)
  if (queryRef.empty) {
    // New User
    isNewUser = true;
    const newUserResults = await createNewUser(incomingPhoneNumber);
  }
  return isNewUser;
};

const createNewUser = async (incomingPhoneNumber: string, contacts: Array<string> = [], history: Array<object> = []): Promise<admin.firestore.WriteResult> => {
  const newUserResults: admin.firestore.WriteResult = await db.collection('users').doc(incomingPhoneNumber).set({
    phoneNumber: incomingPhoneNumber,
    firstName: '',
    // dateCreated: new Date().toISOString().substr(0,10), // without time
    dateCreated: new Date().toISOString(),
    contacts,
    history,
    submittedToday: 'false',
    smsDailyTime: '07:00',
  });
  console.log('created user: ', incomingPhoneNumber, newUserResults.writeTime);
  return newUserResults;
};

const standardizePhoneNumber = (phoneNumber: string): string => {
  const parsedPhoneNumber = parseNumberFromBody(phoneNumber);
  console.log({ parsedPhoneNumber });
  if (parsedPhoneNumber.length >= 11) {
    return parsedPhoneNumber;
  } if (parsedPhoneNumber.length === 10) {
    return `1${parsedPhoneNumber}`;
  }
  return '';
};

const parseNumberFromBody = (incomingBody: string): string => {
  const re = /(\d{10,})/gm;
  const matchArray = re.exec(incomingBody);
  // console.log({incomingBody}, {matchArray});
  if (matchArray) {
    // console.log('matchArray[0] ', matchArray[0]);
    return matchArray[0].slice(-12);
  }
  return '';
};

const formatPhoneNumberFancy = (phoneNumber: string, country = true, plus = false): string => {
  let fancyPhoneNumber = `${phoneNumber.slice(0, -10)}(${phoneNumber.slice(-10, -7)})${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4)}`;
  if (country === false) {
    fancyPhoneNumber = `(${phoneNumber.slice(-10, -7)})${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4)}`;
  }
  if (plus === true) {
    fancyPhoneNumber = `+${fancyPhoneNumber}`;
  }
  console.log({ fancyPhoneNumber });
  return fancyPhoneNumber;
};

const parseFirstNameFromBody = (incomingBody: string): string => {
  const re = /[^name ]\S*/g;
  const matchArray = re.exec(incomingBody);
  console.log({incomingBody}, {matchArray});
  if (matchArray) {
    console.log('matchArray[0] ', matchArray[0]);
    return matchArray[0];
  }
  return '';
};

// Add my phone number for testing purposes and existing user
const addMe = createNewUser(standardizePhoneNumber(env.twilio.mynumber), [standardizePhoneNumber('11234567890'), standardizePhoneNumber('01234567890')]);
