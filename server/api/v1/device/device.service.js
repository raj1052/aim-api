let debug = require('debug')('server:api:v1:user:service');
let randomstring = require("randomstring");
let common = require('../common');
let constant = require('../constant');
let mosca = require('mosca');
let d3 = require('d3');
let dbDateFormat = constant.appConfig.DB_DATE_FORMAT;
let mqtt = require('mqtt');
let deviceDAL = require('./device.DAL');
const uuidv1 = require('uuid/v1');
let query = require('./device.query');

/***********************************************************************************************************************************/

// var pubsubsettings = {
//     type: 'mqtt',
//     json: false,
//     mqtt: require('mqtt'),
//     host: '192.168.0.3',
//     port: 1883
// };

// var server = new mosca.Server(pubsubsettings);
// server.on('ready', setup);

// server.on('clientConnected', function (client) {
//     console.log('client connected', client.id);
// });

// // fired when a message is received
// server.on('published', function (packet, client) {
//     console.log('Published', packet.payload.toString());
//     var packet = packet.payload.toString();
//     debug("packet------------->", packet);
// });

// server.on('clientDisconnected', function(client) {
//     console.log('Client Disconnected:', client.id);
// });

// // fired when the mqtt server is ready
// function setup() {
//     console.log('Mosca server is up and running')
// }

/***********************************************************************************************************************************/
let saveDeviceLocation = async (request, response) => {
    debug("device.service -> saveDeviceLocation");
    let isValidObject = common.validateObject([request.body]);
    let isValidParam = common.validateParams([request.body.location_name])
    if (!isValidObject || !isValidParam)
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_INSERT_DEVICE_LOCATION_REQUEST, false)

    if (request.body.device_location_id !== undefined && request.body.device_location_id > 0) {

        let deviceLocationJson = {
            "locationName": request.body.location_name === undefined || request.body.location_name === "" ? "NULL" : request.body.location_name,
            "fk_deviceLocationTypeID": request.body.device_location_type_id === undefined || request.body.device_location_type_id === "" ? "NULL" : request.body.device_location_type_id,
            "fk_userID": request.session.userInfo.user_id === undefined || request.session.userInfo.user_id === "" ? "NULL" : request.session.userInfo.user_id,
            "createdBy": request.session.userInfo.user_id,
            "modifiedBy": request.session.userInfo.user_id,
            "recordStatus": constant.recordStatus.Active
        }
        let fieldValueUpdate = [];
        let fields = Object.keys(deviceLocationJson);
        fields.forEach(function (field) {
            if (deviceLocationJson[field] != undefined) {
                fieldValueUpdate.push({
                    field: field,
                    fValue: deviceLocationJson[field]
                });
            }
        });
        let updateLocation = await deviceDAL.updateLocation(fieldValueUpdate, request.body.device_location_id);
        if (updateLocation.status === false) {
            return common.sendResponse(response, constant.deviceMessages.ERR_IN_UPDATE_DEVICE_LOCATION_DATA, false)
        } else {
            return common.sendResponse(response, constant.userMessages.SUCCESSFULLY_UPDATED_DEVICE_LOCATION, true)
        }
    } else {
        let deviceLocationJson = {
            "locationName": request.body.location_name === undefined || request.body.location_name === "" ? "NULL" : request.body.location_name,
            "fk_deviceLocationTypeID": request.body.device_location_type_id === undefined || request.body.device_location_type_id === "" ? "NULL" : request.body.device_location_type_id,
            "fk_userID": request.session.userInfo.user_id === undefined || request.session.userInfo.user_id === "" ? "NULL" : request.session.userInfo.user_id,
            "createdBy": request.session.userInfo.user_id,
            "modifiedBy": request.session.userInfo.user_id,
            "recordStatus": constant.recordStatus.Active
        }
        let insertLocation = await deviceDAL.insertLocation(deviceLocationJson);
        if (insertLocation.status === false) {
            return common.sendResponse(response, constant.deviceMessages.ERR_IN_INSERT_DEVICE_LOCATION_DATA, false);
        } else {
            return common.sendResponse(response, constant.deviceMessages.SUCCESSFULLY_INSERTED_DEVICE_LOCATION, true);
        }
    }
}

/***********************************************************************************************************************************/
let getUserLocations = async (request, response) => {
    debug("device.service -> getUserLocations");
    let getPaginationObject = common.getPaginationObject(request);
    let dbServerDateTime = getPaginationObject.dbServerDateTime;
    let limit = getPaginationObject.limit;
    let pageNo = getPaginationObject.pageNo;
    let serverDateTime = getPaginationObject.serverDateTime;

    let getUserLocations = await deviceDAL.getUserLocations(dbServerDateTime, limit, request.session.userInfo.user_id);
    if (getUserLocations.status === false) {
        return common.sendResponse(response, constant.deviceMessages.ERR_IN_GET_USER_Locations, false);
    } else {
        let errorMsg = constant.deviceMessages.ERR_IN_GET_USER_Locations;
        let result = await common.paginationListing(request, getUserLocations, pageNo, serverDateTime, errorMsg);
        return common.sendResponse(response, result.data, true, result.page)
    }
}

/***********************************************************************************************************************************/
let changeDeviceStatus = async (request, response) => {
    debug("device.service -> changeDeviceStatus");
    let isValidObject = common.validateObject([request.body]);
    let isValidParam = common.validateParams([request.body.device_id, request.body.pin, request.body.status]);
    if (isValidObject === false || isValidParam === false) {
        return common.sendResponse(response, "Invalid request for change status", false)
    }
    var message = {
        topic: request.body.device_key,
        payload: 'L' + '1'+ request.body.pin + request.body.status, // or a Buffer
        qos: 2, // 0, 1, or 2
        retain: false // or true
    };
    debug("message------>", message);
    server.publish(message, function () {
        console.log('done!');
        return common.sendResponse(response, "status changed", true);
    });
};

/***********************************************************************************************************************************/
let getDevices = async (request, response) => {
    debug("device.service -> getDevices");
    let getPaginationObject = common.getPaginationObject(request);
    let dbServerDateTime = getPaginationObject.dbServerDateTime;
    let limit = getPaginationObject.limit;
    let pageNo = getPaginationObject.pageNo;
    let serverDateTime = getPaginationObject.serverDateTime;

    if (request.session.userInfo.user_type_id !== 1) {
        return common.sendResponse(response, constant.deviceMessages.USER_IS_NOT_AUTHORISED, false);
    } else {
        let getDevices = await deviceDAL.getDevices(dbServerDateTime, limit);
        if (getDevices.status === false) {
            return common.sendResponse(response, constant.deviceMessages.ERR_IN_GET_DEVICES, false);
        } else {
            let errorMsg = constant.deviceMessages.ERR_IN_GET_DEVICES;
            let result = await common.paginationListing(request, getDevices, pageNo, serverDateTime, errorMsg);
            return common.sendResponse(response, result.data, true, result.page)
        }
    }
}

/***********************************************************************************************************************************/
let insertDevice = async (request, response) => {
    debug("device.service -> insertDevice");
    let isValidObject = common.validateObject([request.body]);
    let isValidParam = common.validateParams([request.body.device_type_id, request.body.manufactured_date, request.body.version])
    if (!isValidObject || !isValidParam)
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_INSERT_DEVICE_REQUEST, false)

    const v1options = {
        node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
        clockseq: 0x1234,
        msecs: new Date().getTime(),
        nsecs: 5678
    };

    const v2options = {
        node: [0x01, 0x25, 0x37, 0x40, 0x26, 0x35],
        clockseq: 0x3725,
        msecs: new Date().getTime(),
        nsecs: 5678
    };

    // Incantations
    let device_key = uuidv1(v1options);
    let secret_key = uuidv1(v2options);

    debug("device_key-------->", device_key);
    debug("secret_key---->", secret_key);
    let deviceJson = {
        "fk_deviceTypeID": request.body.device_type_id,
        "deviceKey": device_key,
        "secretKey": secret_key,
        "version": request.body.version,
        "manufacturedDate": d3.timeFormat(dbDateFormat)(new Date(request.body.manufactured_date)),
        "createdBy": request.session.userInfo.user_id,
        "modifiedBy": request.session.userInfo.user_id,
        "recordStatus": constant.recordStatus.Active
    }
    let insertDevice = await deviceDAL.insertDevice(deviceJson);
    if (insertDevice.status === false) {
        return common.sendResponse(response, constant.deviceMessages.ERR_IN_INSERT_DEVICE_DATA, false);
    } else {
        return common.sendResponse(response, constant.deviceMessages.SUCCESSFULLY_INSERTED_DEVICE, true);
    }
}

/***********************************************************************************************************************************/
let insertUserDevice = async (request, response) => {
    debug("device.service -> insertUserDevice");
    let isValidObject = common.validateObject([request.body.device_type_id, request.body.device_key, request.body.secret_key]);
    if (!isValidObject)
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_INSERT_USER_DEVICE_REQUEST, false)

    let device_type_id = request.body.device_type_id;
    let device_key = request.body.device_key;
    let secret_key = request.body.secret_key;
    let checkDevice = await deviceDAL.checkDevice(device_type_id, device_key, secret_key);
    if (checkDevice.status === false) {
        return common.sendResponse(response, constant.deviceMessages.ERR_IN_CHECK_DEVICE, false);
    } else {
        if (checkDevice.content.length === 0) {
            return common.sendResponse(response, constant.deviceMessages.ERR_INCORRECT_DEVICE_DETAILS, false);
        } else {
            let device_id = checkDevice.content[0].device_id;
            let userDeviceJson = {
                "fk_userID": request.session.userInfo.user_id,
                "fk_deviceID": device_id,
                "fk_deviceLocationID": request.body.device_location_id,
                "status": constant.deviceStatus.Verified,
                "createdBy": request.session.userInfo.user_id,
                "modifiedBy": request.session.userInfo.user_id,
                "recordStatus": constant.recordStatus.Active
            }
            let insertUserDevice = await deviceDAL.insertUserDevice(userDeviceJson);
            if (insertUserDevice.status === false) {
                return common.sendResponse(response, constant.deviceMessages.ERR_IN_INSERT_DEVICE_DATA, false);
            } else {
                return common.sendResponse(response, constant.deviceMessages.SUCCESSFULLY_INSERTED_DEVICE, true);
            }
        }
    }
}

/***********************************************************************************************************************************/
let insertDeviceController = async (request, response) => {
    debug("device.service -> insertDeviceController");
    let isValidObject = common.validateObject([request.body]);
    let isValidParam = common.validateParams([request.body.device_controller_name, request.body.device_id, request.body.device_controller_type_id])
    if (!isValidObject)
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_INSERT_USER_DEVICE_REQUEST, false)

    let device_controller_name = request.body.device_controller_name;
    let device_id = request.body.device_id;
    let device_controller_type_id = request.body.device_controller_type_id;
    let pin = request.body.pin;
    let voltage = request.body.voltage === undefined || request.body.voltage === "" ? "NULL": request.body.voltage;

    let insertDeviceControllerJson = {
        "deviceControllerName": device_controller_name,
        "fk_deviceID": device_id,
        "fk_deviceControllerTypeID": device_controller_type_id,
        "pin": pin,
        "voltage": voltage,
        "createdBy": request.session.userInfo.user_id,
        "modifiedBy": request.session.userInfo.user_id,
        "recordStatus": constant.recordStatus.Active
    }
    let insertDeviceController = await deviceDAL.insertDeviceController(insertDeviceControllerJson);
    if (insertDeviceController.status === false) {
        return common.sendResponse(response, constant.deviceMessages.ERR_IN_INSERT_DEVICE_CONTROLLER, false);
    } else {
        return common.sendResponse(response, constant.deviceMessages.SUCCESSFULLY_INSERTED_DEVICE_CONTROLLER, true);
    }
}

/***********************************************************************************************************************************/
let getUserDevices = async (request, response) => {
    debug("device.service -> getDevices");
    let getPaginationObject = common.getPaginationObject(request);
    let dbServerDateTime = getPaginationObject.dbServerDateTime;
    let limit = getPaginationObject.limit;
    let pageNo = getPaginationObject.pageNo;
    let serverDateTime = getPaginationObject.serverDateTime;
    let user_id = request.session.userInfo.user_id;

    let getUserDevices = await deviceDAL.getUserDevices(dbServerDateTime, user_id, limit);
    if (getUserDevices.status === false) {
        return common.sendResponse(response, constant.deviceMessages.ERR_IN_GET_USER_DEVICES, false);
    } else {
        let errorMsg = constant.deviceMessages.ERR_IN_GET_USER_DEVICES;
        let result = await common.paginationListing(request, getUserDevices, pageNo, serverDateTime, errorMsg);
        return common.sendResponse(response, result.data, true, result.page)
    }
}

/***********************************************************************************************************************************/
let deleteUserDevice = async (request, response) => {
    debug("device.service -> deleteUserDevice");
    let isValidParam = common.validateParams([request.params.user_device_id]);
    if (!isValidParam) {
        return common.sendResponse(response, constant.requestMessages.ERR_INVALID_DELETE_USER_DEVICE_REQUEST, false)
    } else {
        let user_device_id = request.params.user_device_id;
        let deleteUserDeviceQuery = common.cloneObject(query.deleteUserDeviceQuery);
        let fieldValueUpdates = [{
            field: 'recordStatus',
            fValue: 0
        }];
        deleteUserDeviceQuery.update = fieldValueUpdates;
        deleteUserDeviceQuery.filter.value = user_device_id;
        let result = await common.executeQuery(deleteUserDeviceQuery);
        if (result.status === false) {
            return common.sendResponse(response, constant.deviceMessages.ERR_IN_DELETE_USER_DEVICES, false);
        } else {
            return common.sendResponse(response, constant.deviceMessages.USER_DEVICE_DELETED_SUCCESSFULLY, true);
        }
    }
}

/***********************************************************************************************************************************/
let getDeviceController = async (request, response) => {
    debug("device.service -> getDeviceController");
    let getPaginationObject = common.getPaginationObject(request);
    let dbServerDateTime = getPaginationObject.dbServerDateTime;
    let limit = getPaginationObject.limit;
    let pageNo = getPaginationObject.pageNo;
    let serverDateTime = getPaginationObject.serverDateTime;
    let device_id = request.params.device_id;

    let getDeviceController = await deviceDAL.getDeviceController(dbServerDateTime, device_id, limit);
    if (getDeviceController.status === false) {
        return common.sendResponse(response, constant.deviceMessages.ERR_IN_GET_DEVICE_CONTROLLER, false);
    } else {
        let errorMsg = constant.deviceMessages.ERR_IN_GET_DEVICE_CONTROLLER;
        let result = await common.paginationListing(request, getDeviceController, pageNo, serverDateTime, errorMsg);
        return common.sendResponse(response, result.data, true, result.page)
    }
}

/***********************************************************************************************************************************/
module.exports = {
    saveDeviceLocation: saveDeviceLocation,
    getUserLocations: getUserLocations,
    changeDeviceStatus: changeDeviceStatus,
    getDevices: getDevices,
    insertDevice: insertDevice,
    getUserDevices: getUserDevices,
    insertUserDevice: insertUserDevice,
    deleteUserDevice: deleteUserDevice,
    insertDeviceController: insertDeviceController,
    getDeviceController: getDeviceController
};