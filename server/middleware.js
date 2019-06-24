var debug = require('debug')('server:middleware');
var uuid = require('uuid');
var randomstring = require("randomstring");
var constant = require('../server/api/v1/constant');
var queryExecutor = require('./helper/mySql');
var config = require('../config');

var checkRequestHeader = (request, response, next) => {
    debug("middleware --> checkRequestHeader");
    var api_key = request.headers["api-key"];
    var udid = request.headers["udid"];
    var device_type = request.headers["device-type"];
    if (api_key === undefined) {
        return response.send({
            status: false,
            error: constant.requestMessages.ERR_API_KEY_NOT_FOUND
        });

    } else if (api_key !== constant.appConfig.APPLICATION_API_KEY) {
        return response.send({
            status: false,
            error: constant.requestMessages.ERR_INVALID_API_KEY
        });
    } else if (udid === undefined) {
        return response.send({
            status: false,
            error: constant.requestMessages.ERR_UDID_NOT_FOUND
        });
    } else if (device_type === undefined) {
        return response.send({
            status: false,
            error: constant.requestMessages.ERR_DEVICE_TYPE_NOT_FOUND
        });
    }
    next();
};


var logger = async (request, response, next) => {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var user_id = -1;
    if (request.session.userInfo !== undefined) {
        user_id = request.session.userInfo.user_id;
    }

    var type = request.method;
    var headers = JSON.stringify(request.headers);
    var body = JSON.stringify(request.body);
    var params = JSON.stringify(request.params);
    var query = JSON.stringify(request.query);
    let ipAddress;
    try {
        ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
    } catch (e) {
        ipAddress = "";
        debug('error at getting ipAddress')
    }
    // var ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
    debug("requested ipAddress: ", ipAddress);
    debug("request HTTP method: ", type);
    debug("request headers: ", headers);
    debug("request body: ", body);
    debug("request params: ", params);
    debug("request query: ", query);
    debug("request URL: ", fullUrl);
    debug("requested userID: ", user_id); // removed
    if (config.isLogger === true) {
        var jsonQuery = {
            table: "tbl_Logger",
            insert: {
                field: ["type", "URL", "headers", "body", "params", "query", "ipAddress"],
                fValue: [type, fullUrl, headers, body, params, query, ipAddress]
            }
        };

        let result = await queryExecutor.executeQuery(jsonQuery);
        if(result.status === false){
            return response.send({
                status: false,
                error: {
                    code: 9000,
                    message: "Error in executeQuery"
                }
            });
        } else {
            next();
        }
    } else {
        next();
    }
};

var checkAccessToken = async (request, response, next) => {
    debug("middleware -> checkAccessToken");
    var accessToken = request.headers["authorization"];
    var udid = request.headers["udid"];
    debug("Access Token And UDID", accessToken, udid);
    if (accessToken === undefined && request.method === "GET") {
        if (request.session.userInfo === undefined) {
            request.session.userInfo = {
                accessToken: uuid.v1(),
                user_id: '-1',
                name: 'Guest' + randomstring.generate({
                    "length": 4,
                    "charset": 'numeric'
                }),
                mobile: '9XXXXXXXXX',
                userRights: []
            };
        }
        debug("Guest Session: ", request.session.userInfo);
        next();
        return;
    }
    if (accessToken === undefined) {
        response.statusCode = 401;
        return response.send({
            status: false,
            error: {
                code: 401,
                message: "Unauthorized access"
            }
        });
    } else {
        var jsonQuery = {
            table: "view_AccessToken",
            select: [{
                field: 'user_id'
            }, {
                field: 'name'
            }, {
                field: 'mobile'
            }, {
                field: 'country_code'
            }, {
                field: 'city_id'
            }, {
                field: 'user_type_id'
            }, {
                field: 'photo'
            }],
            filter: {
                and: [{
                    field: 'deviceId',
                    operator: 'EQ',
                    value: udid
                }, {
                    field: 'token',
                    operator: 'EQ',
                    value: accessToken
                }]
            }
        };
        debug('view_AccessToken Result');
        let result = await queryExecutor.executeQuery(jsonQuery);
        if(result.status === false){
            return response.send({
                status: false,
                error: {
                    code: 9000,
                    message: "Error in executeQuery"
                }
            });
        }
        if (result.content.length === 0) {
            response.statusCode = 401;
            return response.send({
                status: false,
                error: {
                    code: 401,
                    message: "Unauthorized access"
                }
            });
        }
        if (request.session.userInfo === undefined) {
            debug("Session Result", result.content);
            request.session.userInfo = {
                accessToken: accessToken,
                user_id: result.content[0].user_id,
                name: result.content[0].name,
                mobile: result.content[0].mobile,
                user_type_id: result.content[0].user_type_id,
                photo: result.content[0].photo,
                country_code: result.content[0].country_code,
                city_id: result.content[0].city_id,
                organization_id: result.content[0].organization_id,
                organization_name: result.content[0].organization_name
            };
        }
        debug("Session: ", request.session.userInfo);
        next();
    }
};


module.exports = {
    checkRequestHeader: checkRequestHeader,
    logger: logger,
    checkAccessToken: checkAccessToken
};