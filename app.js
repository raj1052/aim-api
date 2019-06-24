var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mosca = require('mosca');
var http = require('http');
let deviceDAL = require('./server/api/v1/device/device.DAL')
let constant = require('./server/api/v1/constant');
let dbDateFormat = constant.appConfig.DB_DATE_FORMAT;
let d3 = require('d3');

var server = new mosca.Server({
    type: 'mqtt',
    json: false,
    mqtt: require('mqtt'),
    // host: '192.168.2.9',
    host: '192.168.0.3',
    port: 1884
});

server.on('clientConnected', function (client) {
    console.log("-------------------------->");
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function (packet, client) {
    console.log('Published', packet.payload.toString('utf8'));
    // save device info
    // var deviceInfo;
    // try {
    //     deviceInfo = JSON.parse(packet.payload.toString('utf8'));
    //     if(deviceInfo && deviceInfo.type === "temp"){
    //         // conole.log(deviceInfo);
    //         deviceDAL.createDeviceTemperature(deviceInfo.device_id, deviceInfo.tempc, deviceInfo.tempf, function (result) {
    //             console.log(JSON.stringify(result));
    //             if (result.status === false) {
    //                 console.log("Temperature received, but  not inserted");
    //             } else {
    //                 console.log("Temperature inserted");
    //             }
    //         }); // END createUser
    //     }
    //     else if(deviceInfo && deviceInfo.type === "moi") {
    //         deviceDAL.createDeviceMoisture(deviceInfo.device_id, deviceInfo.moi, function (result) {
    //             if (result.status === false) {
    //                 console.log("Moisture received, but  not inserted");
    //             } else {
    //                 console.log("Moisture inserted");
    //             }
    //         }); // END createUser
    //     }
    // } catch (e) {
    //
    // }
});

// server.on('ready', setup);

// fired when the mqtt server is ready

// function setup() {
//     console.log('Mosca server is up and running');
// }



var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.dirname(require.resolve("mosca")) + "/public"))
app.use(express.static(path.join(__dirname, 'views')));
app.use('/api-doc', express.static(__dirname + '/api-doc'));

app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, api-key,udid,device-type,Authorization");
    next();
});

// API related routes
require('./server/routes')(app);
var routes = require('./routes/index');
app.use('/', routes);

app.post('/api/v1/device/change-device-status', async (request, response) => {
    console.log("device.service -> changeDeviceStatus");
    let user_id = 1;
    let status = request.body.status === true ? 1 : 0;
    let getCurrentStatus = await deviceDAL.getDeviceControllerStatus(request.body.device_id, request.body.device_controller_id)
    if (getCurrentStatus.status === false) {
        response.send({ status: false, error: "Error in change status" });
    } else {
        let oldStatus = getCurrentStatus.content[0].status;
        if (oldStatus == status) {
            response.send({ status: false, error: "Sorry, there is no change in status" });
        } else {
            if (request.body.status === true) {
                let start_date = d3.timeFormat(dbDateFormat)(new Date())
                
                await Promise.all([
                    deviceDAL.updateCurrentStatus(request.body.device_id, request.body.device_controller_id, status),
                    deviceDAL.insertDeviceControllerTransaction(request.body.device_controller_id, start_date, user_id)
                ])
                    .then(([result1, result2]) => {
                        if (result1.status === true && result2.status === true) {
                            response.send({ status: true, data: "status changed" });
                        } else {
                            response.send({ status: false, data: "Error in change status" });
                        }
                    })
                    .catch(ex => {
                        response.send({ status: false, data: "Error in change status" });
                    })
            } else {
                let end_date = d3.timeFormat(dbDateFormat)(new Date()) 
                let limit = 1
                await Promise.all([
                    deviceDAL.updateCurrentStatus(request.body.device_id, request.body.device_controller_id, status),
                    deviceDAL.updateDeviceControllerTransaction(request.body.device_controller_id, end_date, user_id, limit)
                ])
                    .then(([result1, result2]) => {
                        if (result1.status === true && result2.status === true) {
                            response.send({ status: true, data: "status changed" });
                        } else {
                            response.send({ status: false, data: "Error in change status" });
                        }
                    })
                    .catch(ex => {
                        response.send({ status: false, data: "Error in change status" });
                    })
            }
            // var message = {
            //     topic: request.body.device_key,
            //     payload: 'L' + request.body.device_id + request.body.pin + status, // or a Buffer
            //     qos: 1, // 0, 1, or 2
            //     retain: false // or true
            // };
            // console.log("message------>", message);
            // server.publish(message, function () {
            //     console.log('done!');
            // });
        }
    }
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var httpserver = http.createServer(app);

server.attachHttpServer(httpserver);

httpserver.listen(port);
httpserver.on('error', onError);
httpserver.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = httpserver.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
}

// module.exports = app;
