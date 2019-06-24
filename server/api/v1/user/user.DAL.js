let debug = require('debug')('server:api:v1:user:DAL');
let d3 = require("d3");
let DateLibrary = require('date-management');
let common = require('../common');
let constant = require('../constant');
let query = require('./user.query');
let dbDateFormat = constant.appConfig.DB_DATE_FORMAT;

/***********************************************************************************************************************************/
let checkUserIsExist = async (mobile) => {
    debug("user.DAL -> checkUserIsExist");
    let checkUserIsExistQuery = common.cloneObject(query.checkUserIsExistQuery);
    checkUserIsExistQuery.filter.value = mobile;
    return await common.executeQuery(checkUserIsExistQuery);
};

/***********************************************************************************************************************************/

//DELETED
// let insertOwnerInfo = function (mobile, cb) {
//     debug("user.DAL -> insertOwnerInfo");
//     let insertOwnerInfoQuery = common.cloneObject(query.insertOwnerInfoQuery);
//     insertOwnerInfoQuery.insert.fValue = [mobile];
//     common.executeQuery(insertOwnerInfoQuery, cb);
// };

/***********************************************************************************************************************************/

let signUpUser = async (countryCode, mobile, user_type_id) => {
    debug("user.DAL -> createUser");
    let singupUserQuery = common.cloneObject(query.singupUserQuery);
    singupUserQuery.insert.fValue = [mobile, countryCode, user_type_id];
    return await common.executeQuery(singupUserQuery);
};

/***********************************************************************************************************************************/
let insertUserInfo = async (userJson) => {
    debug("user.DAL -> insertUserInfo");
    let insertUserInfoQuery = common.cloneObject(query.insertUserInfoQuery);
    insertUserInfoQuery.insert.fValue = [userJson.fk_userTypeID, userJson.name, userJson.email, userJson.mobile, userJson.pin, userJson.dob, userJson.fk_cityID, userJson.countryCode, userJson.createdBy, userJson.modifiedBy, userJson.recordStatus];
    return await common.executeQuery(insertUserInfoQuery);
};

/***********************************************************************************************************************************/

let updateUserInfoByMobile = async (fieldValueUpdate, mobile) => {
    debug("user.DAL -> updateUserInfoByMobile");
    let updateUserInfoQuery = common.cloneObject(query.updateUserQuery);
    updateUserInfoQuery.update = fieldValueUpdate;
    updateUserInfoQuery.filter = { field: 'mobile', operator: 'EQ', value: mobile }
    return await common.executeQuery(updateUserInfoQuery);
};

/***********************************************************************************************************************************/

let updateUserInfoByUserId = async (fieldValueUpdate, user_id) => {
    debug("user.DAL -> updateUserInfoByUserId");
    let updateUserInfoQuery = common.cloneObject(query.updateUserQuery);
    updateUserInfoQuery.update = fieldValueUpdate;
    updateUserInfoQuery.filter = { field: 'pk_userID', operator: 'EQ', value: user_id }
    return await common.executeQuery(updateUserInfoQuery);
};

/***********************************************************************************************************************************/

let deleteUserInfo = async (fieldValueUpdate, mobile) => {
    debug("user.DAL -> deleteUserInfo");
    let deleteUserInfoQuery = common.cloneObject(query.updateUserQuery);
    deleteUserInfoQuery.update = fieldValueUpdate;
    deleteUserInfoQuery.filter.value = mobile;
    return await common.executeQuery(deleteUserInfoQuery);
};

/***********************************************************************************************************************************/

let checkOTPLimit = async (countryCode, mobile) => {
    debug("user.DAL -> checkOTPLimit");
    let checkOTPLimitQuery = common.cloneObject(query.checkOTPLimitQuery);
    let currDate = new Date();
    let startDate = d3.timeFormat(dbDateFormat)(DateLibrary.getRelativeDate(currDate, {
        operationType: "First_Date",
        granularityType: "Days"
    }));
    let endDate = d3.timeFormat(dbDateFormat)(DateLibrary.getRelativeDate(currDate, {
        operationType: "Last_Date",
        granularityType: "Days"
    }));
    checkOTPLimitQuery.filter.and[0].value = countryCode;
    checkOTPLimitQuery.filter.and[1].value = mobile;
    checkOTPLimitQuery.filter.and[2].value = startDate;
    checkOTPLimitQuery.filter.and[3].value = endDate;
    return await common.executeQuery(checkOTPLimitQuery);
};

/***********************************************************************************************************************************/

let expireOTP = async (countryCode, mobile) => {
    debug("user.DAL -> exprieOTP");
    let updateOTPQuery = common.cloneObject(query.updateOTPQuery);
    updateOTPQuery.filter.and[0].value = countryCode;
    updateOTPQuery.filter.and[1].value = mobile;
    return await common.executeQuery(updateOTPQuery);
};

/***********************************************************************************************************************************/

let saveOTP = async (countryCode, mobile, OTP, expiryDateTime) => {
    debug("user.DAL -> saveOTP");
    let insertOTPQuery = common.cloneObject(query.insertOTPQuery);
    let dbExpiryDateTime = d3.timeFormat(dbDateFormat)(new Date(expiryDateTime));
    insertOTPQuery.insert.fValue = [countryCode, mobile, OTP, dbExpiryDateTime];
    return await common.executeQuery(insertOTPQuery);
};

/***********************************************************************************************************************************/

let validOTP = async (countryCode, mobile, currDateTime) => {
    debug("user.DAL -> validOTP");
    let verifyOTPQuery = common.cloneObject(query.verifyOTPQuery);
    verifyOTPQuery.filter.and[0].value = countryCode;
    verifyOTPQuery.filter.and[1].value = mobile;
    verifyOTPQuery.filter.and[2].value = d3.timeFormat(dbDateFormat)(currDateTime);
    return await common.executeQuery(verifyOTPQuery);
};

/***********************************************************************************************************************************/

let getUserInfoByCountryCodeAndMobile = async (mobile) => {
    debug("user.DAL -> getUserInfoByCountryCodeAndMobile");
    let getUserInfoQuery = common.cloneObject(query.getUserInfoQuery);
    // getUserInfoQuery.filter.and[1].or[0].and[0].value = countryCode;
    getUserInfoQuery.filter.and[1].value = mobile;
    return await common.executeQuery(getUserInfoQuery);
};

/***********************************************************************************************************************************/

let expireAccessToken = async (user_id, deviceId) => {
    debug("user.DAL -> expireAccessToken");
    let updateAccessTokenQuery = common.cloneObject(query.updateAccessTokenQuery);
    if (user_id === undefined) {
        updateAccessTokenQuery.filter.or[1].value = deviceId;
    } else {
        updateAccessTokenQuery.filter.or[0].and[0].value = user_id;
        updateAccessTokenQuery.filter.or[0].and[1].value = deviceId;
    }
    return await common.executeQuery(updateAccessTokenQuery);
};

/***********************************************************************************************************************************/

let checkUserTransaction = async (deviceId, deviceType, user_id) => {
    debug("user.DAL -> checkUserTransaction");
    let checkUserTransactionQuery = common.cloneObject(query.checkUserTransactionQuery);
    checkUserTransactionQuery.filter.and[0].value = deviceId;
    checkUserTransactionQuery.filter.and[1].value = deviceType;
    checkUserTransactionQuery.filter.and[2].value = user_id;
    return await common.executeQuery(checkUserTransactionQuery);
};

/***********************************************************************************************************************************/

let createAccessToken = async (user_id, token, expiryDateTime, deviceId) => {
    debug("user.DAL -> accessTokenGenerate");
    let insertAccessTokenQuery = common.cloneObject(query.insertAccessTokenQuery);
    let dbExpiryDateTime = d3.timeFormat(dbDateFormat)(new Date(expiryDateTime));
    insertAccessTokenQuery.insert.fValue = [user_id, token, dbExpiryDateTime, deviceId];
    return await common.executeQuery(insertAccessTokenQuery);
};

/***********************************************************************************************************************************/

let updateUserTransaction = async (deviceId, deviceType, fieldValue, user_id) => {
    debug("user.DAL -> updateUserTransaction");
    let updateUserTransactionQuery = common.cloneObject(query.updateUserTransactionQuery);
    updateUserTransactionQuery.filter.and[0].value = deviceId;
    updateUserTransactionQuery.filter.and[1].value = deviceType;
    updateUserTransactionQuery.filter.and[2].value = user_id;
    updateUserTransactionQuery.update = fieldValue;
    return await common.executeQuery(updateUserTransactionQuery);
};

/***********************************************************************************************************************************/

let createUserTransaction = async (deviceId, deviceType, user_id, lastLoginDatetime, isLogedIn) => {
    debug("user.DAL -> createUserTransaction");
    let insertUserTransactionQuery = common.cloneObject(query.insertUserTransactionQuery);
    insertUserTransactionQuery.insert.fValue = [deviceId, deviceType, user_id, lastLoginDatetime, isLogedIn];
    return await common.executeQuery(insertUserTransactionQuery);
};

/***********************************************************************************************************************************/

let getUserProfilePhotoByUserId = async (user_id) => {
    debug("user.DAL -> getUserProfilePhotoByUserId");
    let getUserProfilePhotoQuery = common.cloneObject(query.getUserProfilePhotoQuery);
    getUserProfilePhotoQuery.filter = { field: 'pk_userID', operator: 'EQ', value: user_id };
    return await common.executeQuery(getUserProfilePhotoQuery);
};

/***********************************************************************************************************************************/

let getUserInfoByUserId = async (user_id) => {
    debug("user.DAL -> getUserInfoByUserId");
    let getUserInfoByUserIdQuery = common.cloneObject(query.getUserInfoByUserIdQuery);
    getUserInfoByUserIdQuery.filter = { field: 'pk_userID', operator: 'EQ', value: user_id };
    return await common.executeQuery(getUserInfoByUserIdQuery);
};

/***********************************************************************************************************************************/
let updateAuthentication = async(data) => {
    debug("user.DAL -> updateAuthentication");
    let updateAuthenticationQuery = common.cloneObject(query.updateAuthenticationQuery);
    updateAuthenticationQuery.filter.and[0].value = data.mobile;
    if(data.password !== undefined && data.password.length > 8) {
        updateAuthenticationQuery.update.push({
            field: 'password',
            encloseField: false,
            fValue: AES_ENCRYPT( data.password, "T3$eI@Ao0!P5q&xZ")
        })
    }
    if(data.pin !== undefined && data.pin.length === 4) {
        updateAuthenticationQuery.update.push({
            field: 'pinPassword',
            encloseField: false,
            fValue: AES_ENCRYPT( data.pin, "P1nT3$eI@A0!P5q&")
        })
    }
    debug("updateAuthenticationQuery", updateAuthenticationQuery);
    // return await common.executeQuery(updateAuthenticationQuery);
}

/***********************************************************************************************************************************/
module.exports = {
    checkUserIsExist: checkUserIsExist,
    insertUserInfo: insertUserInfo,
    updateAuthentication: updateAuthentication,
    checkOTPLimit: checkOTPLimit,
    expireOTP: expireOTP,
    saveOTP: saveOTP,
    validOTP: validOTP,
    getUserInfoByCountryCodeAndMobile: getUserInfoByCountryCodeAndMobile,
    expireAccessToken: expireAccessToken,
    checkUserTransaction: checkUserTransaction,
    createAccessToken: createAccessToken,
    updateUserTransaction: updateUserTransaction,
    createUserTransaction: createUserTransaction,
    updateUserInfoByMobile: updateUserInfoByMobile,
    updateUserInfoByUserId: updateUserInfoByUserId,
    deleteUserInfo: deleteUserInfo,
    signUpUser: signUpUser,
    getUserProfilePhotoByUserId: getUserProfilePhotoByUserId,
    getUserInfoByUserId: getUserInfoByUserId
};