const Imap = require('imap');
const inspect = require('util').inspect;

const imap = new Imap({
  user: 'poc.node.imap@gmail.com',
  password: 'imap.node.poc',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', _ => {

  imap.getBoxes((err, boxes) => {
    console.log('\n----- Imap#getBoxes -----\n');
    console.log(inspect(boxes));
    console.log('\n-------------------------\n');
  });

  imap.subscribeBox('INBOX', err => {
    console.log('\n----- Imap#subscribeBox -----\n');
    if (err) throw err;
    console.log('Listening for mails...');
    console.log('\n-------------------------\n');
  });

  /*
    openInbox((err, box) => {

      if (err) throw err;

      const imapFetch = imap.seq.fetch('1:*', {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        struct: true
      });

      imapFetch.on('message', (imapMessage, seqno) => {

        console.log('Message #%d', seqno);
        const prefix = '(#' + seqno + ') ';

        imapMessage.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', chunk => {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', _ => {
            console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
          });
        });

        imapMessage.once('attributes', attrs => {
          console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
        });

        imapMessage.once('end', _ => {
          console.log(prefix + 'Finished');
        });
      });

      imapFetch.once('error', err => {
        console.log('Fetch error: ' + err);
      });

      imapFetch.once('end', _ => {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  */
});

imap.on('mail', numNewMsgs => {

  console.log('New message has come : ' + numNewMsgs);
});

imap.once('error', err => {
  console.log(err);
});

imap.once('end', _ => {
  console.log('Connection ended');
});

imap.connect();

