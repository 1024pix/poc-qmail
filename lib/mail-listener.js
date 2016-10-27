const inspect = require('util').inspect;
const EventEmitter = require('events').EventEmitter;
const Imap = require('imap');
const MailParser = require("mailparser").MailParser;
const fs = require("fs");
const path = require('path');
const async = require('async');

class MailListener extends EventEmitter {

  constructor(opts) {
    super();

    let options = opts || {};

    this.mailbox = options.mailbox || "INBOX";

    this.imap = new Imap({
      xoauth2: options.xoauth2,
      user: options.username,
      password: options.password,
      host: options.host,
      port: options.port,
      tls: options.tls,
      tlsOptions: options.tlsOptions || {},
      connTimeout: options.connTimeout || null,
      authTimeout: options.authTimeout || null,
      debug: options.debug || null
    });
    this._bindImapEvents();
  }

  start() {
    this.imap.connect();
  }

  stop() {
    this.imap.end();
  }

  _bindImapEvents() {
    this.imap.once('ready', this._imapReady.bind(this));
    this.imap.once('close', this._imapClose.bind(this));
    this.imap.on('error', this._imapError.bind(this));
  }

  _imapReady() {
    this.imap.openBox(this.mailbox, false, (err, mailbox) => {
      if (err) {
        this.emit('error', err);
      } else {
        this.emit('server:connected');
        this._parseUnreadMails();
        this.imap.on('mail', this._imapMail.bind(this));
      }
    });
  }

  _imapClose() {
    this.emit('server:disconnected');
  }

  _imapError(err) {
    this.emit('error', err);
  }

  _imapMail(numNewMsgs) {
    console.log(`${numNewMsgs} new messages received.`);
    this._parseUnreadMails();
  }

  _parseUnreadMails() {
    this.imap.seq.search(['UNSEEN'], (err, UIDs) => {

      if (err) {
        return this.emit('error', err);
      }

      if (UIDs.length <= 0) {
        return this.emit('empty', UIDs);
      }

      const fn = (UID) => { // sample async action
        return new Promise(resolve => {

          let fetch = this.imap.seq.fetch(UID, {
            bodies: '',
            markSeen: true
          });

          fetch.on('message', (msg, seqno) => {

            console.log('Message #%d', seqno);
            let prefix = '(#' + seqno + ') ';

            msg.on('body', function (stream, info) {
              var buffer = '';
              stream.on('data', function (chunk) {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', function () {
                console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
              });
            });

            msg.once('attributes', attrs => console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8)));
            msg.once('end', _ => console.log(prefix + 'Finished'));

          });

          fetch.once('error', err => this.emit('error', err));
          fetch.once('end', _ => console.log('Done fetching all messages!'));

        });
      };

      Promise.all(UIDs.map(fn.bind(this))).then(data => console.log);

    });
  }

}

module.exports = MailListener;
