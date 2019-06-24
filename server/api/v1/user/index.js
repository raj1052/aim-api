let express = require('express');
let service = require('./user.service');
let middleware = require('../../../middleware');

let router = express.Router();
module.exports = router;

router.post('/signup', middleware.logger, service.signup);
router.post('/user-verifyotp', middleware.logger, service.verifyOTPMsg);
router.post('/user-verifyAuthentication', middleware.logger, service.verifyAuthentication);
router.put('/user-saveAuthentication', middleware.logger, service.saveAuthentication);
router.post('/user-insert', middleware.checkAccessToken, middleware.logger, service.insertUserInfo);
router.post('/user-update', middleware.checkAccessToken, middleware.logger, service.updateUserInfo);
// router.get('/get-userInfo', middleware.checkAccessToken, middleware.logger, service.getUserOrgInfo);
router.post('/signout', middleware.checkAccessToken, service.signout);