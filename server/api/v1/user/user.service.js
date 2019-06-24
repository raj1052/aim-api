let debug = require('debug')('server:api:v1:user:service');
let uuid = require('uuid');
let DateLibrary = require('date-management');
let randomstring = require("randomstring");
let common = require('../common');
let constant = require('../constant');
let userDAL = require('./user.DAL');
let config = require('../../../../config');
// let smsConfig = config.smsConfig;
let d3 = require('d3');
let dbDateFormat = constant.appConfig.DB_DATE_FORMAT;


/*******************************************************************/
let sid = 'AC62a3e0133e15082243ac51bd45270fce';
let token = '2d8a6baedcc33080d3e0a915e8c857e3';

var twilloclient = require('twilio')(sid, token);
/*******************************************************************/

// const Nexmo = require('nexmo')

// const nexmo = new Nexmo({
//   apiKey: 'a46238fc',
//   apiSecret: 'lKWdb30c38YII0at'
// })

/***********************************************************************************************************************************/
let signupService = async (request, response) => {
    debug("user.service -> signup");
    let isValidObject = common.validateObject([request.body]);
    if (!isValidObject) {
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_SIGNUP_REQUEST, false);
    }
    if (request.body.mobile === undefined || request.body.mobile === "" || request.body.mobile.length !== constant.appConfig.MOBILE_NUMBER_LENGTH) {
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_MOBILE_NUMBER, false);
    } else {
        let user_type_id = constant.userType.User;
        let mobile = request.body.mobile;
        let countryCode = constant.countryCode.India;
        let checkUser = await userDAL.checkUserIsExist(mobile);
        debug("check user exist", checkUser);
        if (checkUser.status) {
            if (checkUser.content.length > 0) {
                debug("checkUser---->", checkUser);
                //sendOTP
                let otp = await sendOTP(countryCode, mobile);
                if(otp.status === false) {
                    return common.sendResponse(response, otp.error, false)
                } else {
                    return common.sendResponse(response, otp.data, true)
                }
                // let data = checkUser.content[0];
                // return common.sendResponse(response, data, true);
            } else {
                debug("signup");
                let result = await userDAL.signUpUser(countryCode, mobile, user_type_id);
                if (result.status === false) {
                    return common.sendResponse(response, constant.userMessages.ERR_IN_INSERT_USER_MOBILE, false)
                } else {
                    // return common.sendResponse(response, constant.userMessages.USER_MOBILE_ADD_SUCCESSFULLY, true);
                    let otp = await sendOTP(countryCode, mobile);
                    debug("otp---->", otp);
                    if (otp.status === true && otp.data.message.length > 0) {
                        return common.sendResponse(response, otp.data, true)
                    } else {
                        return common.sendResponse(response, otp.error, false)
                    }
                }
            }
        } else {
            return common.sendResponse(response, constant.userMessages.ERR_CHECK_USER_QUERY, false);
        }
    }
};

/***********************************************************************************************************************************/
var insertUserInfoService = async (request, response) => {
    let isValidObject = common.validateObject([request.body]);
    if (!isValidObject)
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_USER_PROFILE_INSERT_REQUEST, false)

    let userJson = {
        "fk_userTypeID": request.body.user_type_id === undefined || request.body.user_type_id === "" ? "NULL" : request.body.user_type_id,
        "name": request.body.name === undefined || request.body.name === "" ? "NULL" : request.body.name,
        "email": request.body.email === undefined || request.body.email === "" ? "NULL" : request.body.email,
        "mobile": request.body.mobile === undefined || request.body.mobile === "" ? "NULL" : request.body.mobile,
        "pin": request.body.pin === undefined || request.body.pin === "" ? "NULL" : request.body.pin,
        "dob": request.body.dob === undefined || request.body.dob === "" ? "NULL" : request.body.dob,
        "fk_cityID": request.body.cityId === undefined || request.body.cityId === "" ? "NULL" : request.body.cityId,
        "countryCode": constant.countryCode.India,
        "createdBy": request.session.userInfo.user_id,
        "modifiedBy": request.session.userInfo.user_id,
        "recordStatus": constant.recordStatus.Active
    }
    let insertUserInfo = await userDAL.insertUserInfo(userJson);
    if (insertUserInfo.status === false) {
        return common.sendResponse(response, constant.userMessages.ERR_IN_INSERT_USER_INFO, false);
    } else {
        return common.sendResponse(response, constant.userMessages.USER_INFO_INSERT_SUCCESSFULLY, true);
    }
}

/***********************************************************************************************************************************/
let updateUserInfo = async (request, response) => {
    debug("user.controller -> updateUserInfo");
    let isValidObject = common.validateObject([request.body]);
    if (!isValidObject) {
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_USER_PROFILE_UPDATE_REQUEST, false)
    }
    let result = await updateUserInfoService(request);
    if (result.status === false) {
        return common.sendResponse(response, result.error, false)
    } else {
        return common.sendResponse(response, result.data, true)
    }
};

let updateUserInfoService = async (request) => {
    debug("request ---->", request.body);
    let userJson = {
        "fk_userTypeID": request.body.user_type_id,
        "name": request.body.name,
        "email": request.body.email === undefined || request.body.email === "" ? "NULL" : request.body.email,
        "mobile": request.body.mobile,
        "pin": request.body.pin === undefined || request.body.pin === "" ? "NULL" : request.body.pin,
        "dob": request.body.dob === undefined || request.body.dob === "" ? "NULL" : request.body.dob,
        "fk_cityID": request.body.city_id === undefined || request.body.city_id === "" ? "NULL" : request.body.city_id,
        "countryCode": constant.countryCode.India,
        "modifiedBy": request.session.userInfo.user_id,
        "recordStatus": constant.recordStatus.Active
    }
    let fieldValueUpdate = [];
    let fields = Object.keys(userJson);
    fields.forEach(function (field) {
        if (userJson[field] != undefined) {
            fieldValueUpdate.push({
                field: field,
                fValue: userJson[field]
            });
        }
    });
    let updateUserInfo = await userDAL.updateUserInfoByUserId(fieldValueUpdate, request.session.userInfo.user_id);
    if (updateUserInfo.status === false) {
        return {
            status: false,
            error: constant.userMessages.ERR_IN_UPDATE_USER_INFO
        }
    } else {
        return {
            status: true,
            data: constant.userMessages.USER_INFO_UPDATE_SUCCESSFULLY
        }
    }
}

/***********************************************************************************************************************************/
var deleteUserInfoService = async (request, response) => {
    let isValidObject = common.validateObject([request.body]);
    let isValidParam = common.validateParams([request.body.mobile])
    if (isValidObject === false || isValidParam === false || request.body.mobile.length !== constant.appConfig.MOBILE_NUMBER_LENGTH)
        common.sendResponse(response, constant.requestMessages.ERR_INVALID_USER_PROFILE_UPDATE_REQUEST, false)

    let fieldValueUpdate = [];
    fieldValueUpdate.push({
        field: "recordStatus",
        fValue: 0
    });
    let deleteUser = await userDAL.deleteUserInfo(fieldValueUpdate, request.body.mobile);
    if (deleteUser.status == false) {
        return common.sendResponse(response, constant.userMessages.ERR_IN_DELETE_USER_INFO, false)
    } else {
        return common.sendResponse(response, constant.userMessages.USER_INFO_DELETE_SUCCESSFULLY, true)
    }
}

/***********************************************************************************************************************************/
let verifyOTPService = async (request, response) => {
    debug("user.service -> verifyOTPService");
    let isValidObject = common.validateObject([request.body]);
    let isValidParam = common.validateParams([request.body.mobile, request.body.otp]);
    if (isValidObject === false || isValidParam === false)
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_VERIFY_OTP_REQUEST, false);

    let mobile = request.body.mobile;
    let countryCode = constant.countryCode.India;
    let OTP = request.body.otp;
    let result = await verifyOTP(countryCode, mobile, OTP);
    if (result.status === false) {
        debug("test", result);
        return common.sendResponse(response, result.error, false);
    } else {
        var data = [{ user_id: result.data.user_id }];
        let res = await checkAndCreateAccessToken(request, data);
        result.data["access_token"] = res.access_token;
        let fullUrl = common.createMedialUrl(constant.mediaType.user, request);
        result.data.photo = result.data.photo === undefined || result.data.photo === "" ? "" : fullUrl + result.data.photo;
        debug("result----------> ", result.data, result.access_token);
        var session = request.session;
        session.userInfo = {
            accessToken: result.data.access_token,
            user_id: result.data.user_id,
            user_type: result.data.user_type,
            name: result.data.name,
            mobile: result.data.mobile,
            user_type_id: result.data.user_type_id,
            photo: result.data.photo,
            country_code: result.data.country_code,
            city_id: result.data.cityId
        };
        return common.sendResponse(response, result.data, true);
    }
};
/***********************************************************************************************************************************/
let verifyAuthentication = async(request, response) => {
    debug("user.service -> sendOTP");
    let isValidObject = common.validateObject([request.body.mobile, request.body.password]);
    if(!isValidObject){
        return common.sendResponse(response, "Invalid request for check mobile", false)
    } else {

    }
}

/***********************************************************************************************************************************/
let saveAuthentication = async(request, response) => {
    debug("user.service -> saveAuthentication");
    let isValidObject = common.validateObject([request.body.mobile]);
    if( (request.body.password === undefined || request.body.pin === undefined) && ( request.body.password.length > 8 || request.body.pin.length === 4 )){
        isValidObject = false;
    }
    if(!isValidObject){
        return common.sendResponse(response, "Invalid request for save authentication", false)
    } else {
        // let result = await userDAL.updateAuthentication(request.body);
        // if(result.status === true && result.content.length > 0) {
        //     return common.sendResponse(response, "Successfully Updated!!!", true);
        // } else {
        //     return common.sendResponse(response, "Error in update authentication", false)
        // }
    }
}

/***********************************************************************************************************************************/
let sendOTP = async (countryCode, mobile) => {
    debug("user.service -> sendOTP");
    let result = await userDAL.checkOTPLimit(countryCode, mobile);
    if (result.status === false) {
        return {
            status: false,
            error: constant.userMessages.ERR_CHECK_USER_QUERY
        };
    } else if (result.content.length > 0 && result.content[0].totalCount >= constant.appConfig.MAX_OTP_SEND_LIMIT) {
        return {
            status: false,
            error: constant.userMessages.ERR_OTP_LIMIT_EXCEEDED
        }
    } else {
        let expireOTP = await userDAL.expireOTP(countryCode, mobile);
        if (expireOTP.status === false) {
            return {
                status: false,
                error: constant.userMessages.ERR_IN_UPDATE_OTP
            };
        }
        let OTP = randomstring.generate(constant.appConfig.OTP_SETTINGS);
        let expiryDateTime = DateLibrary.getRelativeDate(new Date(), {
            operationType: "Absolute_DateTime",
            granularityType: "Seconds",
            value: constant.appConfig.MAX_OTP_EXPIRY_SECONDS
        });
        let saveOTP = await userDAL.saveOTP(countryCode, mobile, OTP, expiryDateTime);
        if (saveOTP.status === false) {
            return {
                status: false,
                error: constant.userMessages.ERR_IN_INSERT_OTP
            };
        } else {

            let OTP_SENT_MSG_OBJ = common.cloneObject(constant.userMessages.MSG_OTP_SENT_SUCCEFULLY);
            OTP_SENT_MSG_OBJ.message = OTP_SENT_MSG_OBJ.message.replace("{{mobile}}", mobile.replace(/\d(?=\d{4})/g, "*"));
            OTP_SENT_MSG_OBJ.message += (" OTP " + OTP);
            
            /**************************************************************************************/
            // const text = `AIM-${OTP} is your AIM verification code `
            // await twilloclient.messages.create({
            //     to: '+91'+ mobile,
            //     from: '+14159094104',
            //     body: `${text}`
            // })
            //     .then((message) => console.log(message.sid));
            
            // return {
            //     status: true,
            //     data: "message successfully sent!"
            // };
            /**************************************************************************************/
            // const from = 'AIM'
            // const to = '918733847806'
            // const text = `AIM-${OTP} is your AIM verification code `

            // await nexmo.message.sendSms(from, to, text);
            // return {
            //     status: true,
            //     data: "message successfully sent!"
            // };
            /**************************************************************************************/
            return {
                status: true,
                data: OTP_SENT_MSG_OBJ
            };

            // HACK remove below line when SMS flow implement
            // if (smsConfig.test === true) {
            //     OTP_SENT_MSG_OBJ.message += (" OTP " + OTP);
            // } else {
            //     //sendsms
            // }
            // return {
            //     status: true,
            //     data: OTP_SENT_MSG_OBJ
            // };
        }

    }
}

/***********************************************************************************************************************************/
var verifyOTP = async (countryCode, mobile, OTP) => {
    debug("user.service -> verifyOTP");
    let currDateTime = new Date();
    let res = await userDAL.validOTP(countryCode, mobile, currDateTime);
    ///problem is here
    debug("res-------------->", res);
    if (res.status === false) {
        return {
            status: false,
            error: constant.userMessages.ERR_IN_EXEC_VERIFY_OTP
        };
    } else if (res.content.length === 0) {
        debug("test");
        return {
            status: false,
            error: constant.userMessages.ERR_OTP_INVALID
        }
    } else if (res.content.length > 0) {
        var OTPobj = res.content[0];
        if (OTPobj.otp != OTP) {
            // Invalid OTP
            return {
                status: false,
                error: constant.userMessages.ERR_OTP_INVALID
            }
        } else if (OTPobj.otp === OTP && new Date(OTPobj.expiry_datetime).getTime() < currDateTime.getTime()) {
            // OTP is Expire
            return {
                status: false,
                error: constant.userMessages.ERR_OTP_IS_EXPIRED
            };
        }

        let expireOTP = await userDAL.expireOTP(countryCode, mobile);
        if (expireOTP.status === false) {
            return expireOTP;
        }
        let getUserInfo = await userDAL.getUserInfoByCountryCodeAndMobile(mobile);
        if (getUserInfo.status === false) {
            return {
                status: false,
                error: constant.userMessages.ERR_IN_GET_USER_ORGANIZATION_INFO
            };
        } else if (getUserInfo.content.length === 0) {
            return {
                status: false,
                error: constant.userMessages.ERR_USER_NOT_EXIST
            }
        } else {
            debug("getUserInfo----->", getUserInfo.content[0]);
            return {
                status: true,
                data: common.prepareSignInApiResponse(getUserInfo)
            }
        }
    }
}

/***********************************************************************************************************************************/
var checkAndCreateAccessToken = async (request, userInfo) => {
    let user_id = userInfo[0].user_id;
    let token = uuid.v1();
    let deviceId = request.headers["udid"];
    let deviceType = (request.headers["device-type"]).toLowerCase();
    // let pushToken = request.body.push_token;
    let expiryDateTime = DateLibrary.getRelativeDate(new Date(), {
        operationType: "Absolute_DateTime",
        granularityType: "hours",
        value: constant.appConfig.MAX_ACCESS_TOKEN_EXPIRY_HOURS
    });
    //let host = request.hostname;

    let expireToken = await userDAL.expireAccessToken(user_id, deviceId);
    if (expireToken.status === false) {
        return expireToken;
    } else {
        let createAccessToken = await userDAL.createAccessToken(user_id, token, expiryDateTime, deviceId);
        debug("createAccessToken---------->", createAccessToken);
        if (createAccessToken.status === false) {
            return createAccessToken;
        } else {
            let checkUserTransaction = await userDAL.checkUserTransaction(deviceId, deviceType, user_id);
            if (checkUserTransaction.status === false) {
                return checkUserTransaction;
            }
            else if (checkUserTransaction.content[0].totalCount > 0) {
                console.log("---------!!!----------------");
                let fieldValueUpdate = [];
                fieldValueUpdate.push({
                    field: "isLogedIn",
                    fValue: 1
                });
                fieldValueUpdate.push({
                    field: "lastLoginDatetime",
                    fValue: d3.timeFormat(dbDateFormat)(new Date())
                });
                let updateUserTransaction = await userDAL.updateUserTransaction(deviceId, deviceType, fieldValueUpdate, user_id);
                if (updateUserTransaction.status === false) {
                    return updateUserTransaction;
                } else {
                    return {
                        status: true,
                        "access_token": token,
                        data: userInfo
                    }
                }
            } else if (checkUserTransaction.content[0].totalCount === 0) {
                console.log("---------!!!---test-------------");
                let createUserTransaction = await userDAL.createUserTransaction(deviceId, deviceType, user_id, d3.timeFormat(dbDateFormat)(new Date()), 1);
                if (createUserTransaction.status === false) {
                    return createUserTransaction;
                } else {
                    return {
                        status: true,
                        "access_token": token,
                        data: userInfo
                    }
                }
            }
        }
    }
};

/***********************************************************************************************************************************/
var updateUserOrgInfoService = async (request, response) => {
    let res = await Promise.all([
        updateUserInfoService(request),
        organizationService.updateOrganizationService(request)
    ])
        .then(([result1, result2]) => {
            if (result1.status === false) {
                return common.sendResponse(response, result1.error, false)
            } else if (result2.status === false) {
                return common.sendResponse(response, result2.error, false)
            } else {
                return common.sendResponse(response, constant.userMessages.USER_INFO_UPDATE_SUCCESSFULLY, true)
            }
        })
        .catch(ex => {
            debug(ex);
        })
}

/***********************************************************************************************************************************/
var getUserOrgInfoService = async (request, response) => {
    debug("------>  ", request.session);
    let isValidParam = common.validateParams([request.session.userInfo.user_id]);
    if (!isValidParam) {
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_GET_USER_ORGANIZATION_REQUEST, false)
    }
    let result = await userDAL.getUserInfoByUserId(request.session.userInfo.user_id);
    debug("result---->", result);
    if (result.status === false) {
        return common.sendResponse(response, constant.userMessages.ERR_IN_GET_USER_ORGANIZATION_INFO, false)
    } else {
        result.content.forEach(d => {
            let fullUrl = common.createMedialUrl(constant.mediaType.user, request);
            d.photo = fullUrl + d.photo;
            // d.photo = fullUrl + 'thumb_'+ d.photo;
        });
        return common.sendResponse(response, result.content[0], true);
    }
}

/***********************************************************************************************************************************/
let signout = async (request, response) => {
    debug("user.service -> signoutService");
    let deviceId = request.headers["udid"];
    let userId = request.session.userInfo.user_id;
    debug("userId--->", userId);
    var deviceType = request.headers["device-type"];

    let result = await userDAL.expireAccessToken(userId, deviceId);
    if (result.status === false) {
        return common.sendResponse(response, constant.userMessages.ERR_SIGNOUT_IS_NOT_PROPER, false)
    } else {
        var fieldValueUpdate = [];
        fieldValueUpdate.push({
            field: "isLogedIn",
            fValue: 0
        });
        let updateUser = await userDAL.updateUserTransaction(deviceId, deviceType, fieldValueUpdate, userId);
        if (updateUser.status === false) {
            return common.sendResponse(response, constant.userMessages.ERR_SIGNOUT_IS_NOT_PROPER, false)
        } else {
            return common.sendResponse(response, constant.userMessages.MSG_SIGNOUT_SUCCESSFULLY, true)
        }
    }
};

/***********************************************************************************************************************************/
module.exports = {
    signup: signupService,
    verifyOTPMsg: verifyOTPService,
    saveAuthentication: saveAuthentication,
    verifyAuthentication: verifyAuthentication,
    insertUserInfo: insertUserInfoService,
    updateUserInfo: updateUserInfo,
    deleteUserInfo: deleteUserInfoService,
    updateUserOrgInfo: updateUserOrgInfoService,
    getUserOrgInfo: getUserOrgInfoService,
    signout: signout
};