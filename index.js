const MailListener = require('./lib/mail-listener');

const mailListener = new MailListener({
  username: 'poc.node.imap@gmail.com',
  password: 'imap.node.poc',
  host: 'imap.gmail.com',
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  //debug: console.log, // Or your custom function with only one incoming argument. Default: null
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: true, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", _ => {
  console.log("imapConnected");
});

mailListener.on("server:disconnected", _ => {
  console.log("imapDisconnected");
});

mailListener.on("error", err => {
  console.log(err);
});

mailListener.on("mail", (mail, seqno, attributes) => {
  console.log(`\n----- #${seqno} -----\n`);
  console.log(`Subject: ${mail.subject}`);
  console.log(`From: ${mail.from}`);
  console.log(`To: ${mail.to}`);
  if(mail.cc) console.log(`Cc: ${mail.cc}`);
  if(mail.bcc) console.log(`Bcc: ${mail.bcc}`);
  console.log(`\n${mail.text}\n`);
});

mailListener.on("attachment", attachment => {
  console.log(attachment.path);
});

// it's possible to access imap object from node-imap library for performing additional actions. E.x.
// mailListener.imap.move(:msguids, :mailboxes, function(){})
