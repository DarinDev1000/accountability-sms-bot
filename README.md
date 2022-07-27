# accountability-sms-bot

This is an accountability sms bot for cell phones.

## Run Firestore and FUnction emulators

`firebase emulators:start`

## Route twilio to local dev server

`twilio phone-numbers:update "+12094975118" --sms-url="http://localhost:5000/accountability-sms-bot/us-central1/handleIncomingMessage"`

`twilio phone-numbers:update "+12094975118" --sms-url="https://us-central1-accountability-sms-bot.cloudfunctions.net/handleIncomingMessage"`

## Commands

* "help commands"
* "list contacts"
* "add contact 1234567890"
* "remove contact 1234567890"
* "name \<your first name\>"
* "report \<number\>"

## Files

```
- functions/              Firebase Functions
    - src/                This is where you write typescript code
        - index.ts        Main typescript file
    - package.json        Package management file
- firebase.json           Main firebase config file
```

## Firebase Firestore users collection example

```json
users: {                                // (collection)
    "12345678901": {                    // (document)
        phoneNumber: "12345678901",     // same as document id
        contacts: [                     // currently just an array (May want to change this to a sub-collection like history)
            "11234567890",
            "10987654321"
        ],
        dateCreated: "2020-10-07T13:53:03.638Z",
        firstName: "FirstName",
        historyCollection: {            // (sub collection)
            "2020-10-07": {             // (document)
                date: "2020-10-07",
                time: "2020-10-07T12:06:53.659Z",
                reportValue: 7
            }
        }
    }
}
```
