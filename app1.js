let express = require('express');
let session = require('express-session');
let compression = require('compression');
let path = require('path');
// let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
var mosca = require('mosca');
var http = require('http');
var broker = new mosca.Server({});
var app = express()
var srv = http.createServer(app)
var path = require("path");

app.use(express.static(path.dirname(require.resolve("mosca")) + "/public"))

var pubsubsettings = {
    type: 'mqtt',
    json: false,
    mqtt: require('mqtt'),
    host: '192.168.0.3',
    port: 1883
};

var server = new mosca.Server(pubsubsettings);
// server.on('ready', setup);

server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function (packet, client) {
    console.log('Published', packet.payload.toString());
    var packet = packet.payload.toString();
    debug("packet------------->", packet);
});

server.on('clientDisconnected', function(client) {
    console.log('Client Disconnected:', client.id);
});

// fired when the mqtt server is ready
// function setup() {
//     console.log('Mosca server is up and running')
// }

let app = express();
app.use(compression());
app.use(session({
    secret: '',
    cookie: {
        maxAge: 30 * 86400 *1000
    },
    resave: true,
    saveUninitialized: true
}));

// app.use(express.session(
//     { secret: "secret", store: new MemoryStore(), maxAge: Date.now() + (30  86400  1000)
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname,'./public/images')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.dirname(require.resolve("mosca")) + '/public'));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/api-doc', express.static(__dirname + '/api-doc'));

app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, api-key,udid,device-type,Authorization");
    next();
});

// API related routes
require('./server/routes')(app);
let routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
// app.use(function(request, response, next) {
//  let err = new Error('Not Found');
//   err.status = 404;
//   if (request.accepts('json')) {
//     response.statusCode = 404;
//     response.send({
//       status: false,
//       error: {
//         code: 404,
//         message: 'Not found'
//       }
//     });
//     return;
//   }
//
//   next(err);
// });

module.exports = app;
