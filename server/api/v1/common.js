/**
 * Created by nishant.joshi on 1/8/17.
 */
var debug = require('debug')('server:api:v1:common');
var d3 = require("d3");
var url = require('url');
var querystring = require('querystring');
var constant = require('./constant');
var queryExecutor = require('../../helper/mySql');
var dbDateFormat = constant.appConfig.DB_DATE_FORMAT;
var pageSize = constant.appConfig.PAGE_SIZE;
var nodemailer = require('nodemailer');
var config = require('../../../config');
var smsConfig = config.smsConfig;
var queryString = require('querystring');
var fs = require('fs');

module.exports.cloneObject = (obejct) => {
    return JSON.parse(JSON.stringify(obejct));
};

module.exports.trimString = (string) => {
    return string.replace(/  +/g, ' ');
};

module.exports.executeQuery = async (jsonQuery, cb) => {
    if (cb) {
        await queryExecutor.executeQuery(jsonQuery, cb);
    } else {
        return await queryExecutor.executeQuery(jsonQuery);
    }
    // queryExecutor.executeQuery(jsonQuery, function (result) {
    //     if (result.status === false && result.error.code === 10001) {
    //         cb({
    //             status: false,
    //             error: {
    //                 code: 9001,
    //                 message: "Error dublicate entry OR Cannot execute query"
    //             }
    //         });
    //         return;
    //     } else if (result.status === false) {
    //         cb({
    //             status: false,
    //             error: {
    //                 code: 9000,
    //                 message: "Error in executeQuery"
    //             }
    //         });
    //         return;
    //     }
    //     cb(result);
    // });
};

module.exports.executeRawQuery = async (jsonQuery, cb) => {
    if (cb) {
        await queryExecutor.executeRawQuery(jsonQuery, cb);
    } else {
        return await queryExecutor.executeRawQuery(jsonQuery);
    }
    // queryExecutor.executeRawQuery(jsonQuery, function (result) {
    //     if (result.status === false && result.error.code === 10002) {
    //         cb({
    //             status: false,
    //             error: {
    //                 code: 9001,
    //                 message: "Error dublicate entry"
    //             }
    //         });
    //         return;
    //     }
    //     if (result.status === false) {
    //         cb({
    //             status: false,
    //             error: {
    //                 code: 9000,
    //                 message: "Error in executeQuery"
    //             }
    //         });
    //         return;
    //     }
    //     cb(result);
    // });
};

module.exports.executeQueryWithTransactions = async (queryArrayJSON) => {
    return await queryExecutor.executeQueryWithTransactions(queryArrayJSON); 
    // {
    //     if (result.status === false) {
    //         cb({
    //             status: false,
    //             error: {
    //                 code: 9000,
    //                 message: "Error in executeQuery"
    //             }
    //         });
    //         return;
    //     }
    //     cb(result);
    // });
};

module.exports.getPaginationObject = (request) => {
    let paginationObj = {};
    let serverDateTime;
    let pageNo;
    if (request.query.pageno === undefined || request.query.datetime === undefined) {
        pageNo = 1;
        serverDateTime = (new Date()).getTime();
    } else {
        pageNo = parseInt(request.query.pageno);
        serverDateTime = parseInt(request.query.datetime);
    }
    var localPageSize = pageSize;
    if (request.query.pagesize !== undefined) {
        localPageSize = request.query.pagesize;
    }
    paginationObj.pageNo = pageNo;
    paginationObj.serverDateTime = serverDateTime;
    paginationObj.dbServerDateTime = d3.timeFormat(dbDateFormat)(new Date(serverDateTime));
    paginationObj.limit = [localPageSize * (pageNo - 1), localPageSize];
    return paginationObj;
};

module.exports.paginationListing = async (request, result, pageNo, serverDateTime, errorMsg) => {
    debug("common -> paginationListing");

    if (result.status === false) {
        return {
            status: false,
            error: errorMsg
        };
    } 
    // else if (result.content.length === 0 && pageNo === 1) {
    //     return {
    //         status: false,
    //         error: errorMsg
    //     };
    // }
    else {
        return {
            status: true,
            page: pagination(request, result.content.length, pageNo, serverDateTime),
            data: result.content
        };
    }
};

module.exports.pagination = (request, contentLength, pageNo, serverDateTime) => {
    debug("common -> pagination");
    return pagination(request, contentLength, pageNo, serverDateTime);
};

var pagination = (request, contentLength, pageNo, serverDateTime) => {
    debug("common -> pagination()");
    var pageOptions = {};
    var pathName = (request.originalUrl).replace(constant.appConfig.API_START_PATH, '');
    pathName = (pathName).replace(constant.appConfig.API_VERSION, '');
    var localPageSize = constant.appConfig.PAGE_SIZE;

    var URI = url.parse(pathName);
    var queryObj = querystring.parse(URI.query)

    pathName = URI.pathname + '?';

    if (queryObj.pagesize != undefined) {
        localPageSize = queryObj.pagesize;
    }

    if (pageNo === 1 && contentLength < localPageSize) {
        return pageOptions;
    }

    if (contentLength < localPageSize || pageNo != 1) {
        queryObj.pageno = pageNo - 1;
        queryObj.datetime = serverDateTime;
        var newQueryString = querystring.stringify(queryObj)
        pageOptions.previous = pathName + newQueryString;
    }

    if (pageNo == 1 || contentLength == localPageSize) {
        queryObj.pageno = pageNo + 1;
        queryObj.datetime = serverDateTime;
        var newQueryString = querystring.stringify(queryObj)
        pageOptions.next = pathName + newQueryString;
    }
    return pageOptions;
};

// module.exports.createMedialUrl = function (data, mediaType, request) {
//     debug("common -> createMedialUrl");
//     if (mediaType === constant.mediaType.customer) {
//         data.forEach(function (d) {
//             if (d.photo === '') {
//                 d.photo = "default.png";
//             }
//             let fullUrl = getGetMediaURL(request);
//             fullUrl += '' + constant.mediaType.customer + '/';
//             fullUrl += d.photo;
//             d.photo = fullUrl;
//         });
//     }
//     return data;
// };


module.exports.createMedialUrl = (mediaType, request) => {
    debug("common -> createMedialUrl");
    var fullUrl = request.protocol + '://' + request.get('host') + constant.appConfig.MEDIA_GET_STATIC_URL;
    // return fullUrl;
    // let fullUrl = getGetMediaURL(request);
    fullUrl += '' + mediaType + '/';
    return fullUrl;
};

module.exports.getGetMediaURL = (request) => {
    debug("common -> getGetMediaURL");
    var fullUrl = request.protocol + '://' + request.get('host') + constant.appConfig.MEDIA_GET_STATIC_URL;
    return fullUrl;
    // return getGetMediaURL(request);
};

// function getGetMediaURL(request) {
//     debug("common -> getGetMediaURL");
//     var fullUrl = request.protocol + '://' + request.get('host') + constant.appConfig.MEDIA_GET_STATIC_URL;
//     return fullUrl;
// };

module.exports.getNoImageURL = (request) => {
    debug("common -> getGetMediaURL");
    var fullUrl = request.protocol + '://' + request.get('host') + constant.appConfig.MEDIA_DEFAULT_IMAGES_PATH + "noimage.jpg";
    return fullUrl;
};

module.exports.generatingTemplate = (template, data, dataWrapperStartSign, dataWrapperEndSign) => {
    debug("common -> generatingTemplate");
    var returnTemplate = template;
    var dataStartSign = dataWrapperStartSign || '{{';
    var dataEndSign = dataWrapperEndSign || '}}';

    while (true) {
        if (returnTemplate.length > 0) {
            var str = returnTemplate;
            var n1 = str.indexOf(dataStartSign);
            var n2 = str.indexOf(dataEndSign);
            if (n1 == -1 || n2 == -1 || n1 >= n2) {
                break;
            } else {
                var variable = str.substr(n1, n2 - n1 + 2);
                var key = (str.substr(n1 + 2, n2 - n1 - 2)).trim();

                if (data.hasOwnProperty(key)) {
                    var value = data[key];
                    returnTemplate = returnTemplate.replace(variable, value);
                } else {
                    debug(key);
                    debug("invalid key : " + variable);
                    break;
                }
            }
        } else {
            break;
        }
    }
    return returnTemplate;
};

module.exports.JSON2ARRAY = (objArray) => {
    debug("common -> JSON2ARRAY");
    var array = typeof objArray != 'object' ? [objArray] : objArray;
    //console.log(typeof objArray);
    var arrData = [];
    var str = '';
    if (array.length > 0) {
        var keys = Object.keys(array[0]);
        arrData.push(keys)

        //append data
        for (var i = 0; i < array.length; i++) {
            var line = [];

            for (var index = 0; index < keys.length; index++) {
                if (array[i].hasOwnProperty(keys[index])) {
                    var val = array[i][keys[index]];
                    line.push(val);
                } else {
                    line.push(null);
                }
            }
            arrData.push(line);
        }
    }
    return arrData;
}

module.exports.arrayToJson = (arrayObj, key) => {
    var finalObj = {};
    var finalArr = [];
    if (arrayObj.length == undefined) {
        for (var i = 0; i < key.length; i++) {
            finalObj[key[i]] = arrayObj[key[i]];
        }
        return finalObj;
    } else {
        for (var k = 0; k < arrayObj.length; k++) {
            finalObj = {};
            for (var j = 0; j < key.length; j++) {
                finalObj[key[j]] = arrayObj[k][key[j]];
            }
            finalArr.push(finalObj);
        }
        return finalArr;
    }
};

module.exports.bodyParamToCheck = (requestData, params) => {
    var isValidParam = true;
    for (var i = 0; i < params.length; i++) {
        if (requestData[params[i]] === undefined || requestData[params[i]] === "") {
            debug('###############', requestData[params[i]], params[i]);
            isValidParam = false;
            break;
        }
    }
    return isValidParam;
}

module.exports.mailer = {
    authentication: (authObject) => {
        var transporter = nodemailer.createTransport({
            service: authObject.service,
            auth: {
                user: authObject.email_id,
                pass: authObject.password
            }
        });
        return transporter;
    },
    sendMail: (toEmailId, subject, message, transporter, cb) => {

        try {
            var mailOptions = {
                from: constant.appConfig.EMAIL_SENDER.EMAIL_ID,
                to: toEmailId,
                subject: subject,
                html: message
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    cb({ status: false, error: error });
                } else {
                    cb({ status: true, data: "Email sucessfully sent" });
                };
            });
        } catch (e) {
            cb({ status: false, error: e });
        }
    }
}

module.exports.sendDynamicSms = (messageText, reciverNumber, cb) => {
    try {
        var http = require('http');
        var url = smsConfig.URL;
        var params = {};
        params['aid'] = smsConfig.params.aid;
        params['pin'] = smsConfig.params.pin;
        params['mnumber'] = reciverNumber;
        params['message'] = messageText;
        params['msgType'] = "PM";
        params['signature'] = smsConfig.params.signature;
        var sendSMSurl = url + '?' + queryString.stringify(params);
        // var options = {
        //   host: 'http://luna.a2wi.co.in/',
        //   path: (sendSMSurl)
        // };
        // if (smsConfig.proxyURL != undefined || smsConfig.proxyPORT != undefined) {
        //   options["host"] = smsConfig.proxyURL;
        //   options["port"] = smsConfig.proxyPORT;
        // }
        if (smsConfig.test === false) {
            http.get(sendSMSurl, function (res) {
                if (res.statusCode == 200) {
                    if (cb != undefined) {
                        cb({
                            status: true
                        });
                    } else {
                        debug(responseStatus.message);
                    }
                } else {
                    if (cb != undefined) {
                        debug(res.statusCode);
                        cb({
                            status: false
                        });
                    } else {
                        debug(err);
                    }
                }
                //debug("Got response: " + res.statusCode);
            }).on('error', function (e) {
                //debug("Got error: " + e.message);
                if (cb != undefined) {
                    debug(e);
                    cb({
                        status: false
                    });
                } else {
                    debug(err);
                }
            });
        } else {
            cb({
                status: true
            });
        }
    } catch (e) {
        cb({
            status: false,
            error: e
        });
    }
}

module.exports.sendResponse = (response, obj, isSuccess, page) => {
    if (isSuccess !== undefined) {
      if (isSuccess === true) {
          if(page){
            response.send({
                status: true,
                page: page,
                data: obj
              });
          } else {
            response.send({
                status: true,
                data: obj
              });
          }
      } else {
        response.send({
          status: false,
          error: obj
        });
      }
    } else {
      response.send(obj);
    }
  }

module.exports.validateObject = (arrParam) => {
    arrParam.forEach( param => {
      if (param === undefined && typeof param !== "object") {
        return false;
      }
    });
    return true;
  }
  
module.exports.validateParams = (arrParam) => {
    try {
      arrParam.forEach( param => {
        if (param === undefined || param.toString().trim() === "") {
          throw "Invalid params";
        }
      });
      return true;
    } catch (ex) {
      return false;
    }
  }

module.exports.prepareSignInApiResponse = (getUserInfo) => {
      let prepareResponse = {
        "user_id": getUserInfo.content[0].user_id,
        "user_type_id": getUserInfo.content[0].user_type_id,
        "user_type": getUserInfo.content[0].user_type,
        "name": getUserInfo.content[0].name,
        "email": getUserInfo.content[0].email,
        "mobile": getUserInfo.content[0].mobile,
        "photo": getUserInfo.content[0].photo,
        "pin": getUserInfo.content[0].pin,
        "dob": getUserInfo.content[0].dob,
        "cityId": getUserInfo.content[0].cityId,
        "country_code": getUserInfo.content[0].country_code,
        "access_token": getUserInfo.content[0].access_token,
    }
    return prepareResponse;
}

//return always unique number & value :- he primitive value is returned as the number of millisecond since midnight January 1, 1970 UTC.
module.exports.getUniqueNumber = () => new Date().valueOf();

//this function delete the file which path is gived to it..
module.exports.deleteFileSync = (filePath) => fs.unlinkSync(filePath);