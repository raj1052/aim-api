let express = require('express');
let service = require('./device.service');
let middleware = require('../../../middleware');

let router = express.Router();
module.exports = router;

router.post('/save-device-location', middleware.checkAccessToken, middleware.logger, service.saveDeviceLocation);
router.get('/get-user-locations', middleware.checkAccessToken, middleware.logger, service.getUserLocations);

// router.post('/change-device-status', middleware.checkAccessToken, middleware.logger, service.changeDeviceStatus);

router.get('/get-devices', middleware.checkAccessToken, middleware.logger, service.getDevices);
router.post('/insert-device', middleware.checkAccessToken, middleware.logger, service.insertDevice);

// router.put('/update-device', middleware.checkAccessToken, middleware.logger, service.updateDevice);

router.get('/get-user-devices', middleware.checkAccessToken, middleware.logger, service.getUserDevices);
router.post('/insert-user-device', middleware.checkAccessToken, middleware.logger, service.insertUserDevice);
router.post('/insert-device-controller', middleware.checkAccessToken, middleware.logger, service.insertDeviceController);
router.get('/get-device-controller/:device_id', middleware.checkAccessToken, middleware.logger, service.getDeviceController);
router.delete('/delete-user-device/:user_device_id', middleware.checkAccessToken, middleware.logger, service.deleteUserDevice);
