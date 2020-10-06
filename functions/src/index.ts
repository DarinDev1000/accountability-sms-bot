import * as functions from 'firebase-functions';
const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const env = functions.config();

const express = require("express");
const cors = require("cors");

// -----------------
//   Express App
// -----------------
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

// build multiple CRUD interfaces:
// app.get("/:id", (req: any, res: any) => res.send(Widgets.getById(req.params.id)));
// app.post("/", (req: any, res: any) => res.send(Widgets.create()));
// app.put("/:id", (req: any, res: any) => res.send(Widgets.update(req.params.id, req.body)));
// app.delete("/:id", (req: any, res: ) => res.send(Widgets.delete(req.params.id)));
// app.get("/", (req: any, res: any) => res.send(Widgets.list()));


// -----------------
//   Routes (Each route is preceded by function name)
// -----------------
app.get("/helloWorld", (req: any, res: any) => helloWorld(req, res));

app.get("/twilioSendSms", (req: any, res: any) => twilioSendSms(req, res));

app.post("/twilioReceiveAndSend", (req: any, res: any) => twilioReceiveAndSend(req, res));


// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app); // I just found the function name


// -----------------
//   Functions
// -----------------
const helloWorld = (request: any, response: any) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
};

const twilioReceiveAndSend = (request: any, response: any) => {
  functions.logger.info("twilioReceiveAndSend", { structuredData: true });

  console.log("body: ", request.body.Body);

  const twiml = new MessagingResponse();
  if (request.body.Body) {
    twiml.message(request.body.Body);
  } else {
    response.status(400).end();
    throw console.error("no body received");
  }

  console.log("response: ", twiml.toString());
  response.set({ "Content-Type": "text/xml" });
  response.status(200).send(twiml.toString());
};

const twilioSendSms = (request: any, response: any) => {
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
};
