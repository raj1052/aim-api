let path = require('path');
let applicationConfiguration = {
    "MOBILE_NUMBER_LENGTH": 10,
    "MAX_OTP_SEND_LIMIT": 100,
    "MAX_OTP_EXPIRY_SECONDS": 300, // 5 minute
    "OTP_SETTINGS": {
        "length": 5, // max length 10
        "charset": 'numeric'
    },
    "APPLICATION_API_KEY": "1",
    "MAX_ACCESS_TOKEN_EXPIRY_HOURS": 720, // 30 days
    "PAGE_SIZE": 10, //
    "API_START_PATH": '/api/',
    "API_VERSION": 'v1',
    "DB_DATE_FORMAT": '%Y-%m-%d %H:%M:%S',
    "MEDIA_GET_STATIC_URL": '/api/v1/other/get-media/',
    "UPLOAD_DIR": '',
    //MEDIA_UPLOAD_DIR: '',
    MEDIA_UPLOAD_DIR: '',
    MEDIA_UPLOAD_FILE_NAME_SETTINGS: {
        "length": 12,
    },
    MEDIA_UPLOAD_SUBFOLDERS_NAME: {
        USER: "user_profile/"
    },
    MEDIA_UPLOAD_THUMBNAIL_WIDTH: {
        USER: 300
    },
    "IMAGE_GET_STATIC_URL": '/images/Upload_Images/',
    "MEDIA_DEFAULT_IMAGES_PATH": '/server/images/', // path must be same level of app.js
    "MEDIA_DEFAULT_IMAGES_NAME": {
        USER_PROFILE: 'default_user_profile.png'
    },

    "MEDIA_MOVING_PATH": {
        "CATEGORY": "category"
    },
    "TMP_DIR_NAME":'tmp',
    "SECRETPASSPHRASE": "Ai0M12TeStQptOEX"
};



let requestMessages = {
    'ERR_API_KEY_NOT_FOUND': {
        code: 2001,
        message: 'api-key not found'
    },
    'ERR_INVALID_API_KEY': {
        code: 2002,
        message: 'Invalid api-key'
    },
    'ERR_UDID_NOT_FOUND': {
        code: 2003,
        message: 'UDID not found'
    },
    'ERR_DEVICE_TYPE_NOT_FOUND': {
        code: 2004,
        message: 'device-type not found'
    },
    'ERR_INVALID_SIGNUP_REQUEST': {
        code: 2005,
        message: 'Invalid SignUp Request.'
    },
    'ERR_INVALID_SEND_OTP_REQUEST': {
        code: 2006,
        message: 'Invalid send otp request'
    },
    'ERR_INVALID_VERIFY_OTP_REQUEST': {
        code: 2007,
        message: 'Invalid verify otp request'
    },
    'ERR_INVALID_USER_PROFILE_UPDATE_REQUEST': {
        code: 2008,
        message: 'Invalid user profile update request'
    },
    'ERR_INVALID_SIGNIN_REQUEST': {
        code: 2009,
        message: 'Invalid SignIn request'
    },
    'ERR_INVALID_FORGOT_PASSWORD_REQUEST': {
        code: 2010,
        message: 'Invalid forgot password request'
    },
    'ERR_INVALID_INSERT_DEVICE_LOCATION_REQUEST': {
        code: 2011,
        message: 'Invalid insert device location request'
    },
    'ERR_INVALID_INSERT_DEVICE_REQUEST': {
        code: 2012,
        message: 'Invalid insert device request'
    },
    'ERR_INVALID_INSERT_USER_DEVICE_REQUEST': {
        code: 2013,
        message: 'Invalid insert user device request'
    },
    'ERR_INVALID_DELETE_USER_DEVICE_REQUEST': {
        code: 2014,
        message: "Invalid request for delete device"
    },
};

let recordStatus = {
    Deleted: 0,
    Active: 1,
    Verified: 2,
    Hidden: 3
}

let userType = {
    Admin: 1,
    User: 2
};

let mediaType = {
    user: 1
}

let countryCode = {
    'India': 91
};

let deviceStatus = {
    Pending: 1,
    Verified: 2
}

let userMessages = {
    'ERR_CHECK_USER_QUERY': {
        code: 17001,
        message: 'Error in Check User Is Exist Query'
    },
    'ERR_IN_EXEC_CHECK_OTP_QUERY': {
        code: 17002,
        message: 'Error in Check otp Query'
    },
    'ERR_IN_INSERT_OWNER_INFO': {
        code: 17003,
        message: 'Error in Insert Owner Mobile Number'
    },
    'OWNER_MOBILE_ADD_SUCCESSFULLY': {
        code: 17004,
        message: 'Insert Owner Mobile Number Successfully.'
    },
    'ERR_IN_INSERT_USER_MOBILE': {
        code: 17005,
        message: 'Error in Insert Owner Mobile Number in User Master'
    },
    'USER_MOBILE_ADD_SUCCESSFULLY': {
        code: 17006,
        message: 'Insert Owner Mobile Number Successfully.'
    },
    'ERR_OTP_LIMIT_EXCEEDED': {
        code: 17007,
        message: 'You have exceeded the maximum number of attempts at this time. Please wait 24 hours and try again later.'
    },
    'MSG_OTP_SENT_SUCCEFULLY': {
        code: 17008,
        message: 'One Time Password (OTP) has been sent to your mobile {{mobile}}, please enter the same here to verify.'
    },
    'ERR_OTP_IS_EXPIRED': {
        code: 17009,
        message: 'One Time Password (OTP) was expired.'
    },
    'ERR_OTP_INVALID': {
        code: 17010,
        message: 'Invalid one time password (OTP) entered.'
    },
    'ERR_USER_NOT_EXIST': {
        code: 17011,
        message: 'User is not exist.'
    },
    'ERR_IN_UPDATE_USER_INFO': {
        code: 17012,
        message: 'Error in user info update.'
    },
    'USER_INFO_UPDATE_SUCCESSFULLY': {
        code: 17013,
        message: 'User info updated successfully'
    },
    'ERR_IN_INSERT_USER_INFO': {
        code: 17014,
        message: 'Error in user info Insert.'
    },
    'USER_INFO_INSERT_SUCCESSFULLY': {
        code: 17015,
        message: 'User info inserted successfully'
    },
    'ERR_IN_DELETE_USER_INFO': {
        code: 17016,
        message: 'Error in user info delete.'
    },
    'USER_INFO_DELETE_SUCCESSFULLY': {
        code: 17017,
        message: 'User info deleted successfully'
    },
    'ERR_IN_GET_USER_ORGANIZATION_INFO': {
        code: 17018,
        message: 'Error in get user organization info'
    },
    'MSG_SIGNOUT_SUCCESSFULLY': {
        code: 17019,
        message: 'Signed out successfully'
    },
    'ERR_SIGNOUT_IS_NOT_PROPER': {
        code: 17020,
        message: 'Sorry, we could not sign you out. Try again.'
    },
    'ERR_IN_UPDATE_OTP': {
        code: 17021,
        message: 'Sorry, error in otp'
    },
    'ERR_IN_INSERT_OTP': {
        code: 17022,
        message: 'Sorry, error in otp'
    },
    'ERR_IN_EXEC_VERIFY_OTP': {
        code: 17023,
        message: 'Sorry, error in verify otp'
    },
};

let deviceMessages = {
    'ERR_IN_GET_DEVICE_LOCATION_DATA': {
        code: 18001,
        message: "Error in get device location data"
    },
    'ERR_IN_INSERT_DEVICE_LOCATION_DATA': {
        code: 18002,
        message: "Error in insert device location"
    },
    'ERR_IN_UPDATE_DEVICE_LOCATION_DATA': {
        code: 18003,
        message: "Error in update device location"
    },
    'SUCCESSFULLY_INSERTED_DEVICE_LOCATION': {
        code: 18004,
        message: "Device Location Inserted Successfully"
    },
    'SUCCESSFULLY_UPDATED_DEVICE_LOCATION': {
        code: 18005,
        message: "Device Location Updated Successfully"
    },
    'ERR_IN_INSERT_DEVICE_DATA': {
        code: 18006,
        message: "Error in insert device"
    },
    'SUCCESSFULLY_INSERTED_DEVICE': {
        code: 18007,
        message: "Device Inserted Successfully"
    },
    'ERR_IN_CHECK_DEVICE': {
        code: 18008,
        message: "Error in check device"
    },
    'ERR_INCORRECT_DEVICE_DETAILS': {
        code: 18009,
        message: "Incorrect device details, Please Check again!"
    },
    'SUCCESSFULLY_INSERTED_USER_DEVICE': {
        code: 18010,
        message: "Your device successfully inserted"
    },
    'USER_IS_NOT_AUTHORISED': {
        code: 18011,
        message: "You are not authorised!"
    },
    'ERR_IN_GET_DEVICES': {
        code: 18012,
        message: "Error in get devices"
    },
    'ERR_IN_GET_USER_DEVICES': {
        code: 18013,
        message: "Error in get devices"
    },
    'ERR_IN_DELETE_USER_DEVICES': {
        code: 18014,
        message: "Error in delete device"
    },
    'USER_DEVICE_DELETED_SUCCESSFULLY': {
        code: 18015,
        message: "Device deleted Successfully"
    },
    'ERR_IN_GET_USER_Locations': {
        code: 18016,
        message: "Error in get locations"
    },
    'ERR_IN_INSERT_DEVICE_CONTROLLER': {
        code: 18017,
        message: "Error in insert device controller"
    },
    'SUCCESSFULLY_INSERTED_DEVICE_CONTROLLER': {
        code: 18018,
        message: "Device Controller Inserted Successfully"
    },
    'ERR_IN_GET_DEVICE_CONTROLLER': {
        code: 18019,
        message: "Error in get device controller"
    },
}

let otherMessages = {
    'ERR_IN_GET_SYNC_META_DATA': {
        code: 19001,
        message: "Error in getting sync meta data."
    },
    'ERR_MEDIA_NOT_UPLOADED': {
        code: 19002,
        message: "Error in uploded media"
    }
}

module.exports = {
    requestMessages: requestMessages,
    appConfig: applicationConfiguration,
    userMessages: userMessages,
    userType: userType,
    mediaType: mediaType,
    deviceStatus: deviceStatus,
    countryCode: countryCode,
    recordStatus: recordStatus,
    deviceMessages: deviceMessages,
    otherMessages: otherMessages
};
