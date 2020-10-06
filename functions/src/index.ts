import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const env = functions.config();

admin.initializeApp();
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const twilioTrial = functions.https.onRequest((request, response) => {
  functions.logger.info("twilioTrial", { structuredData: true });

  const accountSid = env.twilio.accountsid; // Your Account SID from www.twilio.com/console
  const authToken = env.twilio.authtoken; // Your Auth Token from www.twilio.com/console

  const client = new twilio(accountSid, authToken);

  client.messages
    .create({
      body: "Hello from Node",
      to: env.twilio.mynumber, // Text this number
      from: env.twilio.twilionumber, // From a valid Twilio number
    })
    .then((message: any) => console.log(message.sid));
  
  response.send("Sent");
});

export const twilioReceiveAndSend = functions.https.onRequest((request, response) => {
  functions.logger.info("twilioReceiveAndSend", { structuredData: true });

  console.log('body: ', request.body.Body);
  
  const twiml = new MessagingResponse();
  if (request.body.Body) {
    twiml.message(request.body.Body);
  } else {
    response.status(400).end();
    throw console.error('no body received');
  }
  
  console.log('response: ', twiml.toString());
  response.set({ "Content-Type": "text/xml" });
  response.status(200).send(twiml.toString());
});

export const logRequest = functions.https.onRequest((request, response) => {
  functions.logger.info("logRequest", { structuredData: true });
  console.log(request.body);
  response.send("logging");
});

export const handelIncomingMessage = functions.https.onRequest(async (request, response) => {
  functions.logger.info("handelIncomingMessage", { structuredData: true });
  // console.log(request.body);
  
  // Remove '+' from front and add 'n'
  const incomingPhoneNumber: string = await removePlusFromPhoneNumber(request.body.From);
  console.log("From: ", incomingPhoneNumber);
  
  // Check if new user
  const isNewUser = await checkIfNewUser(incomingPhoneNumber);

  // Respond to message
  const twiml = new MessagingResponse();
  if (request.body.Body) {
    await twiml.message(isNewUser);
  } else {
    response.status(400).end();
    throw console.error('no body received');
  }
  console.log('response: ', twiml.toString());
  response.set({ "Content-Type": "text/xml" });
  response.status(200).send(twiml.toString());
});


// ---------------------
//   Utility Functions
// ---------------------
const checkIfNewUser = async (incomingPhoneNumber: string) => {
  let isNewUser = "";

  // Create a reference to the cities collection
  const usersRef: admin.firestore.CollectionReference = db.collection('users');

  // Create a query against the collection
  // const queryRef: any = await usersRef.where('phoneNumber', '==', incomingPhoneNumber).get();
  const queryRef: admin.firestore.QuerySnapshot = await usersRef.where('phoneNumber', '==', incomingPhoneNumber).get();
  // const queryRef: admin.firestore.DocumentReference =  usersRef.doc(incomingPhoneNumber);

  // if (!users.hasOwnProperty(incomingPhoneNumber)) {  // This was using the hard coded user variable
  console.log('queryRef empty ', queryRef.empty)
  console.log('queryRef size ', queryRef.size)
  if (queryRef.empty) {
    // New User
    isNewUser = "New User";
    createNewUser(incomingPhoneNumber);
  } else {
    // Existing User
    isNewUser = "Existing User";
  }
  return isNewUser;
};

const createNewUser = (incomingPhoneNumber: string) => {
  const newUser = db.collection('users').doc(incomingPhoneNumber);
  newUser.set({
    phoneNumber: incomingPhoneNumber,
    dateCreated: '2020-10-03',
    contacts: [],
    history: []
  });
  console.log('created user: ', incomingPhoneNumber);
};

const removePlusFromPhoneNumber = (phoneNumber: string) => {
  return "n" + phoneNumber.substring(1);
};
const addPlusToPhoneNumber = (phoneNumber: string) => {
  return "+" + phoneNumber.substring(1);
};


// ---------------------
//   Temporary 'Database'
// ---------------------
const users = {
  "n12093419681": {
    history: [
      {
        date: '2020-05-11',
        rating: '7'
      },
      {
        date: '2020-05-12',
        rating: '5'
      },
      {
        date: '2020-05-13',
        rating: '8'
      }
    ],
    contacts: [
      "n1234567890",
      "n1234567890",
      "n1234567890"
    ]
  },
  "n389467259w3": {
    history: [
      {
        date: '2020-05-11',
        rating: '7'
      },
      {
        date: '2020-05-12',
        rating: '5'
      },
      {
        date: '2020-05-13',
        rating: '8'
      }
    ],
    contacts: [
      "n1234567890",
      "n1234567890",
      "n1234567890"
    ]
  }
};
