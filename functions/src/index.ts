import * as functions from 'firebase-functions';
const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const env = functions.config();

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

// Firebase has a native way to do express. Not like this
export const twilioReceiveExpressTrial = functions.https.onRequest((request, response) => {
  functions.logger.info("twilioReceiveExpressTrial", { structuredData: true });

  const http = require("http");
  const express = require("express");
  // const MessagingResponse = require("twilio").twiml.MessagingResponse;

  const app = express();

  app.post("/sms", (req: any, res: any) => {
    const twiml = new MessagingResponse();

    twiml.message("The Robots are coming! Head for the hills!");

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  });

  http.createServer(app).listen(1337, () => {
    console.log("Express server listening on port 1337");
  });

  
  response.send("Received");
});

export const twilioReceiveMessageTrial = functions.https.onRequest((request, response) => {
  functions.logger.info("twilioReceiveMessage", { structuredData: true });

  const twiml = new MessagingResponse();
  twiml.message("The Robots are coming! Head for the hills 2!");

  response.set({ "Content-Type": "text/xml" });
  response.send(twiml.toString());
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
