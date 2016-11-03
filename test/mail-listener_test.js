const hoodiecrow = require('hoodiecrow-imap');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
chai.use(sinonChai);
const expect = chai.expect;

const MailListener = require('../lib/mail-listener');

describe('Integration | MailListener', function() {

  const PORT = 1143;
  let server;

  before(function (done) {

    server = hoodiecrow({
      debug: true
    });
    server.listen(PORT, function() {
      console.log("Hoodiecrow listening on port %s", PORT)
    });
    done();
  });

  after(function (done) {
    server.close();
    done();
  });

  /*
   * #start
   */

  describe('#start', function() {

    let mailListener;

    beforeEach(function (done) {
      mailListener = new MailListener({
        username: 'testuser',
        password: 'testpass',
        port: PORT
      });
      done();
    });

    afterEach(function (done) {
      mailListener.stop();
      done();
    });

    it('should emit "server:connected" event when connection to IMAP server is ready', function(done) {
      // given
      mailListener.on("server:connected", done);

      // when
      mailListener.start();
    });
  });

  /*
   * #stop
   */
  describe('#stop', function () {
    it('should close IMAP connection', function() {

    });

  });

});
