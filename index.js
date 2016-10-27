const Imap = require('imap');
const inspect = require('util').inspect;

const imap = new Imap({
  debug: (debugInfo) => {
    console.log(debugInfo);
  },
  user: 'poc.node.imap@gmail.com',
  password: 'imap.node.poc',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function () {
  openInbox(function (err, box) {

    if (err) throw err;

    const imapFetch = imap.seq.fetch('1:3', {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
      struct: true
    });

    imapFetch.on('message', function (imapMessage, seqno) {
      console.log('Message #%d', seqno);
      const prefix = '(#' + seqno + ') ';

      imapMessage.on('body', function (stream, info) {
        let buffer = '';
        stream.on('data', function (chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function () {
          console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
        });
      });

      imapMessage.once('attributes', function (attrs) {
        console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
      });

      imapMessage.once('end', function () {
        console.log(prefix + 'Finished');
      });
    });

    imapFetch.once('error', function (err) {
      console.log('Fetch error: ' + err);
    });

    imapFetch.once('end', function () {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
});

imap.once('error', function (err) {
  console.log(err);
});

imap.once('end', function () {
  console.log('Connection ended');
});

imap.connect();

