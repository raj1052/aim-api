let constant = require('../constant');
let debug = require('debug')('server:api:v1:device:DAL');
let common = require('../common');
let query = require('./device.query');

/***********************************************************************************************************************************/
let insertLocation = async (data) => {
    debug("device.DAL -> insertDeviceLocation");
    let insertDeviceLocationQuery = common.cloneObject(query.insertDeviceLocationQuery);
    insertDeviceLocationQuery.insert.fValue = [data.locationName, data.fk_deviceLocationTypeID, data.fk_userID, data.createdBy, data.modifiedBy, data.recordStatus];
    return await common.executeQuery(insertDeviceLocationQuery);
};

/***********************************************************************************************************************************/
let updateLocation = async (fieldValueUpdate, device_location_id) => {
    debug("device.DAL -> updateDeviceLocation");
    let updateDeviceLocationQuery = common.cloneObject(query.updateDeviceLocationQuery);
    updateDeviceLocationQuery.update = fieldValueUpdate;
    updateDeviceLocationQuery.filter = { field: 'pk_deviceLocationID', operator: 'EQ', value: device_location_id }
    return await common.executeQuery(updateDeviceLocationQuery);
};

/***********************************************************************************************************************************/
let getUserLocations = async (dbServerDateTime, limit, user_id) => {
    debug("device.DAL -> getUserLocations");
    let getUserLocations = common.cloneObject(query.getUserLocationsQuery);
    getUserLocations.filter.and[1].value = dbServerDateTime;
    getUserLocations.filter.and[2].value = user_id;
    getUserLocations.limit = limit;
    return await common.executeQuery(getUserLocations);
}

/***********************************************************************************************************************************/
let getDevices = async (dbServerDateTime, limit) => {
    debug("device.DAL -> getDevices");
    let getDevicesQuery = common.cloneObject(query.getDevicesQuery);
    getDevicesQuery.filter.and[1].value = dbServerDateTime;
    getDevicesQuery.limit = limit;
    return await common.executeQuery(getDevicesQuery);
}

/***********************************************************************************************************************************/
let getUserDevices = async (dbServerDateTime, user_id, limit) => {
    debug("device.DAL -> getDevices");
    let getUserDevicesQuery = common.cloneObject(query.getUserDevicesQuery);
    getUserDevicesQuery.filter.and[1].value = dbServerDateTime;
    getUserDevicesQuery.filter.and[2].value = user_id;
    getUserDevicesQuery.limit = limit;
    return await common.executeQuery(getUserDevicesQuery);
}

/***********************************************************************************************************************************/
let insertDevice = async (data) => {
    debug("device.DAL -> insertDevice");
    let raw_query = `INSERT INTO tbl_Device (fk_deviceTypeID, deviceKey, secretKey, version, manufacturedDate, createdBy, modifiedBy, recordStatus) VALUES ('${data.fk_deviceTypeID}', '${data.deviceKey}', AES_ENCRYPT('${data.secretKey}', '${constant.appConfig.SECRETPASSPHRASE}'), ${data.version}, '${data.manufacturedDate}', ${data.createdBy}, ${data.modifiedBy}, ${data.recordStatus})`;
    return await common.executeRawQuery(raw_query);
};

/***********************************************************************************************************************************/
let checkDevice = async (device_type_id, device_key, secret_key) => {
    debug("device.DAL -> checkDevice");
    let checkDeviceQuery = common.cloneObject(query.checkDeviceQuery);
    checkDeviceQuery.filter.and[0].value = device_type_id;
    checkDeviceQuery.filter.and[1].value = device_key;
    checkDeviceQuery.filter.and.push({
        field: `CAST(aes_decrypt(secretKey, '${constant.appConfig.SECRETPASSPHRASE}') AS CHAR(50) )`,
        encloseField: false,
        operator: 'EQ',
        value: secret_key
    });
    // let raw_query = `select * from tbl_device where fk_deviceTypeID = ${device_type_id} and deviceKey = ${device_key} and CAST(aes_decrypt(secretKey, ${constant.appConfig.SECRETPASSPHRASE}) AS CHAR(50) ) = ${secret_key}`;
    return await common.executeQuery(checkDeviceQuery);
};

/***********************************************************************************************************************************/
let insertUserDevice = async (data) => {
    debug("device.DAL -> insertUserDevice");
    let insertUserDeviceQuery = common.cloneObject(query.insertUserDeviceQuery);
    insertUserDeviceQuery.insert.fValue = [data.fk_userID, data.fk_deviceID, data.fk_deviceLocationID, data.status, data.createdBy, data.modifiedBy, data.recordStatus];
    return await common.executeQuery(insertUserDeviceQuery);
};

/***********************************************************************************************************************************/
let insertDeviceController = async (data) => {
    debug("device.DAL -> insertDeviceController");
    let insertDeviceControllerQuery = common.cloneObject(query.insertDeviceControllerQuery);
    insertDeviceControllerQuery.insert.fValue = [data.deviceControllerName, data.fk_deviceID, data.fk_deviceControllerTypeID, data.pin, data.voltage, data.createdBy, data.modifiedBy, data.recordStatus];
    return await common.executeQuery(insertDeviceControllerQuery);
};

/***********************************************************************************************************************************/
let getDeviceController = async (dbServerDateTime, device_id, limit) => {
    debug("device.DAL -> getDeviceController");
    let getDeviceControllerQuery = common.cloneObject(query.getDeviceControllerQuery);
    getDeviceControllerQuery.filter.and[1].value = dbServerDateTime;
    getDeviceControllerQuery.filter.and[2].value = device_id;
    getDeviceControllerQuery.limit = limit;
    return await common.executeQuery(getDeviceControllerQuery);
}

/***********************************************************************************************************************************/
let getDeviceControllerStatus = async (device_id, device_controller_id) => {
    debug("device.DAL -> getDeviceControllerStatus");
    let getDeviceControllerStatusQuery = common.cloneObject(query.getDeviceControllerStatusQuery);
    getDeviceControllerStatusQuery.filter.and[1].value = device_id;
    getDeviceControllerStatusQuery.filter.and[2].value = device_controller_id;
    return await common.executeQuery(getDeviceControllerStatusQuery);
}

/***********************************************************************************************************************************/
let updateCurrentStatus = async (device_id, device_controller_id, status) => {
    debug("device.DAL -> updateDeviceLocation");
    let updateCurrentStatusQuery = common.cloneObject(query.updateCurrentStatusQuery);
    updateCurrentStatusQuery.update.push({
        field: "status",
        fValue: status
    })
    updateCurrentStatusQuery.filter = {
        and: [{ field: 'pk_deviceControllerID', operator: 'EQ', value: device_controller_id },
        { field: 'fk_deviceID', operator: 'EQ', value: device_id }]
    }
    return await common.executeQuery(updateCurrentStatusQuery);
};

/***********************************************************************************************************************************/
let insertDeviceControllerTransaction = async (device_controller_id, start_date, user_id) => {
    debug("device.DAL -> insertUserDevice");
    let insertDeviceControllerTransactionQuery = common.cloneObject(query.insertDeviceControllerTransactionQuery);
    insertDeviceControllerTransactionQuery.insert.fValue = [device_controller_id, start_date, "NULL", user_id, user_id];
    return await common.executeQuery(insertDeviceControllerTransactionQuery);
};

/***********************************************************************************************************************************/
let updateDeviceControllerTransaction = async (device_controller_id, end_date, user_id, limit) => {
    debug("device.DAL -> updateDeviceControllerTransaction");
    let updateDeviceControllerTransactionQuery = common.cloneObject(query.updateDeviceControllerTransactionQuery);
    let raw_query = `UPDATE tbl_DeviceControllerTransaction SET endDate = "${ end_date }" WHERE fk_deviceControllerID = ${device_controller_id} order by pk_deviceControllerTransactionID DESC LIMIT 1`;
    return await common.executeRawQuery(raw_query);
};
/***********************************************************************************************************************************/
module.exports = {
    getDevices: getDevices,
    getUserLocations: getUserLocations,
    insertLocation: insertLocation,
    updateLocation: updateLocation,
    insertDevice: insertDevice,
    checkDevice: checkDevice,
    insertUserDevice: insertUserDevice,
    getUserDevices: getUserDevices,
    insertDeviceController: insertDeviceController,
    getDeviceController: getDeviceController,
    getDeviceControllerStatus: getDeviceControllerStatus,
    updateCurrentStatus: updateCurrentStatus,
    insertDeviceControllerTransaction: insertDeviceControllerTransaction,
    updateDeviceControllerTransaction: updateDeviceControllerTransaction
};