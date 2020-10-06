import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
import MessagingResponseType = require('twilio/lib/twiml/MessagingResponse');

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

export const handelIncomingMessage = functions.https.onRequest(async (request, response) => {
  functions.logger.info("handelIncomingMessage", { structuredData: true });
  // console.log(request.body);
  let responseMessage = "Default Message";
  const incomingBody: string = request.body.Body;
  console.log({incomingBody});
  
  // Remove '+' from front and add 'n'
  const incomingPhoneNumber: string = await replacePlusFromPhoneNumber(request.body.From);
  console.log("From: ", incomingPhoneNumber);
  
  // Check if new user
  const isNewUser = await checkIfNewUser(incomingPhoneNumber);
  if (isNewUser) {
    responseMessage = `Welcome to the Accountability Bot!\nTo see a list of commands, text "bot help"`;
  } else {
    responseMessage = `Welcome back!\nbody: ${incomingBody}`;
  }

  // Handle Commands
  if (incomingBody.includes("help")) {
    responseMessage = await helpCommand();
  } else if (incomingBody.includes("list") && incomingBody.includes("contact")) {
    responseMessage = await listContactsCommand(incomingPhoneNumber);
  } else if (incomingBody.includes("add") && incomingBody.includes("contact")) {
    responseMessage = await addContactCommand(incomingPhoneNumber, incomingBody);
  }

  // Respond to message
  const twiml: MessagingResponseType = new MessagingResponse();
  if (request.body.Body) {
    await twiml.message(responseMessage);
  } else {
    response.status(400).end();
    throw console.error('no body received');
  }
  console.log('response: ', twiml.toString());
  response.set({ "Content-Type": "text/xml" });
  response.status(200).send(twiml.toString());
});



// ---------------------
//   Command Functions
// ---------------------
const helpCommand = (): string => {
  return `Commands:
"bot help"  -   this help list
"list contacts"  -  list your accountable contacts
"add contact <phone number>"  -  add a contact
"remove contact <phone number>"  -  remove a contact
"report <number>"  -  how did you do since your last report? (number 1-10)`;
};

const listContactsCommand = async (incomingPhoneNumber: string): Promise<string> => {
  let contactString = "Here is your contacts:";
  // Create a reference to the cities collection
  const userDocument: admin.firestore.DocumentSnapshot = await db.collection('users').doc(incomingPhoneNumber).get();
  const contactList = await userDocument.get('contacts');
  await contactList.forEach((contactNumber: string) => {
    contactString += `\n${contactNumber.substring(2)}`;
  });
  console.log({contactList});
  // console.log('contactString: ', contactString);
  return contactString;
}

const addContactCommand = async (incomingPhoneNumber: string, incomingBody: string): Promise<string> => {
  const contactNumberToAdd = await parseNumberFromBodyWithoutCountry(incomingBody);
  console.log({contactNumberToAdd});
  if (contactNumberToAdd.length <= 2) {
    return 'Did not find a number to add.\nAdd a number in this format:\n"add contact 1234567890"'
  }
  // Create a reference to the cities collection
  const userDocumentRef: admin.firestore.DocumentReference = await db.collection('users').doc(incomingPhoneNumber);
  const contactList: Array<string> = await (await userDocumentRef.get()).get('contacts');
  if (contactList.includes(contactNumberToAdd)) {
    return `${contactNumberToAdd.substring(1)} is already in your contact list`;
  }
  await contactList.push(contactNumberToAdd);
  const updateResponse = await userDocumentRef.update('contacts', contactList);
  console.log({contactList})
  return `Added ${contactNumberToAdd.substring(1)} to your contact list`;
}

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

const createNewUser = async (incomingPhoneNumber: string, contacts: Array<string> = [], history: Array<string> = []): Promise<admin.firestore.WriteResult> => {
  const newUserResults: admin.firestore.WriteResult = await db.collection('users').doc(incomingPhoneNumber).set({
    phoneNumber: incomingPhoneNumber,
    dateCreated: "2020-10-03",
    contacts: contacts,
    history: history,
    submittedToday: "false",
    smsDailyTime: "07:00"
  });
  console.log('created user: ', incomingPhoneNumber, newUserResults.writeTime);
  return newUserResults;
};

const replacePlusFromPhoneNumber = (phoneNumber: string): string => {
  return "n" + phoneNumber.substring(1);
};
const addPlusToPhoneNumber = (phoneNumber: string): string => {
  return "+" + phoneNumber.substring(1);
};

const parseNumberFromBodyWithoutCountry = (incomingBody: string): string => {
  const re = /(\d{10,})/gm;
  const matchArray = re.exec(incomingBody);
  // console.log({incomingBody}, {matchArray});
  if (matchArray) {
    // console.log('matchArray[0] ', matchArray[0]);
    return 'n' + matchArray[0].slice(-10);
  }
  return '';
};

// Add my phone number for testing purposes and existing user
// const addMe = createNewUser(replacePlusFromPhoneNumber(env.twilio.mynumber), ['n123544867', 'n190128', 'n134785634']);
