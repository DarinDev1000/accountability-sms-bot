# accountability-sms-bot

This is an accountability sms bot for cell phones.

## Route twilio to local dev server

`twilio phone-numbers:update "+16812013538" --sms-url="http://localhost:5000/accountability-sms-bot/us-central1/handleIncomingMessage"`

## Commands

* "bot help"
* "list contacts"
* "add contact 1234567890"
* "remove contact 1234567890"
* "name \<your first name\>"
* "report \<number\>"
