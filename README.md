# accountability-sms-bot

This is an accountability sms bot for cell phones.

## Route twilio to local dev server

`twilio phone-numbers:update "+16812013538" --sms-url="http://localhost:5000/accountability-sms-bot/us-central1/handleIncomingMessage"`

`twilio phone-numbers:update "+16812013538" --sms-url="https://us-central1-accountability-sms-bot.cloudfunctions.net/handleIncomingMessage"`

## Commands

* "help commands"
* "list contacts"
* "add contact 1234567890"
* "remove contact 1234567890"
* "name \<your first name\>"
* "report \<number\>"
