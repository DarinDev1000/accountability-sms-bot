const constants = {
  help: {
    helpCommands: `
"help commands"
"list contacts"
"add contact 1234567890"
"remove contact 1234567890"
"name Paul"
"report 10"
"history"

You can also look at detailed help for a command:
"help <command name>"`,
    helpListContact: '"list contacts"  -  list your accountable contacts',
    helpAddContact: '"add contact <phone number>"  -  add a contact',
    helpRemoveContact: '"remove contact <phone number>"  -  remove a contact',
    helpChangeName: '"name <your name>"  -  your first name for your contacts to see',
    helpReportNumber: '"report <number>"  -  how did you do since your last report? (number 1-10)\nOr just send the value only (Ex. "10") and that will report it!',
  },
};

export default constants;
