var assert = require('assert'),
    net = require('net'),
    Imap = require('../lib/Connection'),
    result;

var CRLF = '\r\n';

var RESPONSES = [
  ['* CAPABILITY IMAP4rev1',
   'A0 OK Thats all she wrote!',
   ''
  ].join(CRLF),
  ['* CAPABILITY IMAP4rev1 ENABLE NOTIFY',
   'A1 OK authenticated (Success)',
   ''
  ].join(CRLF),
  ['* ENABLED',
   'A2 OK Success',
   ''
  ].join(CRLF),
  ['A3 OK Success',
   ''
  ].join(CRLF),
  ['* LIST (\\Noselect) "/" "/"',
   '* LIST () "/" "भारत"',
   '* LIST () "/" "&-"',
   'A4 OK Success',
   ''
  ].join(CRLF),
  ['A5 OK Success',
   ''
  ].join(CRLF)
];

var srv = net.createServer(function(sock) {
  sock.write('* OK asdf\r\n');
  var buf = '', lines;
  sock.on('data', function(data) {
    buf += data.toString('utf8');
    if (buf.indexOf(CRLF) > -1) {
      lines = buf.split(CRLF);
      buf = lines.pop();
      lines.forEach(function() {
        sock.write(RESPONSES.shift());
      });
    }
  });
});
srv.listen(0, '127.0.0.1', function() {
  var port = srv.address().port;
  var imap = new Imap({
    user: 'foo',
    password: 'bar',
    host: '127.0.0.1',
    port: port,
    keepalive: false,
    debug: function(info) {
      console.log('Debug:', info);
    }
  });
  imap.on('ready', function() {
    srv.close();
    imap.end();
  });
  imap.connect();
});
