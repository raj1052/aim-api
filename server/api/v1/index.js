var express = require('express');
var middleware = require('../../middleware');
var router = express.Router();
module.exports = router;

router.use('/user', middleware.checkRequestHeader, require('./user'));
router.use('/device', middleware.checkRequestHeader, require('./device'));



