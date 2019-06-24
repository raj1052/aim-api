let tbl_UserMaster = "tbl_UserMaster";
let tbl_OTP = "tbl_OTP";
let view_getuserdetail = "view_GetUserDetail";
let tbl_AccessToken = "tbl_AccessToken";
let tbl_UserTransaction = "tbl_UserTransaction";
let tbl_UserType = "tbl_UserType";

let query = {

    checkUserIsExistQuery: {
        table: tbl_UserMaster,
        select: [{
            field: 'pk_userId',
            alias: 'user_id'
        }, {
            field: 'IFNULL(name,"")',
            encloseField: false,
            alias: 'name'
        }, {
            field: 'mobile',
            alias: 'mobile'
        }],
        filter: {
                field: 'mobile',
                operator: 'EQ',
                value: ''
        }
    },

    insertUserInfoQuery: {
        table: tbl_UserMaster,
        insert: {
            field: ["fk_userTypeID", "name", "email", "mobile", "pin", "dob", "fk_designationID","fk_cityID", "fk_organizationID", "panNumber", "countryCode", "createdBy", "modifiedBy", "recordStatus"],
            fValue: []
        }
    },

    //CREATE SEPRATE QUERY BECUASE WHEN WE PASS NULL VALUE THEN MYSQL SAVE IT AS STRING (LIKE "NULL") DUPLICATE ENTRY OF EMAIL IS COMMING
    singupUserQuery: {
        table: tbl_UserMaster,
        insert: {
            field: ["mobile", "countryCode", "fk_userTypeID"],
            fValue: []
        }
    },

    updateUserQuery: {
        table: tbl_UserMaster,
        update: [],
        filter: {}
    },

    updateAuthenticationQuery: {
        table: tbl_UserMaster,
        update: [],
        filter: {
            and: [{
                field: 'mobile',
                operator: 'EQ',
                value: ''
            }, {
                field: 'recordStatus',
                operator: 'EQ',
                value: 1
            }]
        }
    },
    //query before rolemapping code..
    // getUserInfoQuery: {
    //     join: {
    //         table: tbl_UserMaster,
    //         alias: 'UM',
    //         joinwith: [{
    //             table: tbl_OrganizationMaster,
    //             alias: 'OM',
    //             type: 'LEFT',
    //             joincondition: {
    //                 table: 'OM',
    //                 field: 'pk_organizationID',
    //                 operator: 'eq',
    //                 value: {
    //                     table: 'OM',
    //                     field: 'pk_organizationID'
    //                 }
    //             }
    //         }, {
    //             table: tbl_UserType,
    //             alias: 'UT',
    //             type: 'LEFT',
    //             joincondition: {
    //                 table: 'UM',
    //                 field: 'fk_userTypeID',
    //                 operator: 'eq',
    //                 value: {
    //                     table: 'UT',
    //                     field: 'pk_userTypeID'
    //                 }
    //             }
    //         }]
    //     },
    //     select: [{
    //         field: 'pk_userID',
    //         alias: 'user_id'
    //     }, {
    //         field: 'fk_userTypeID',
    //         alias: 'user_type_id'
    //     },{
    //         field: 'userType',
    //         alias: 'user_type'
    //     }, {
    //         field: 'IFNULL(name,"")',
    //         encloseField: false,
    //         alias: 'name'
    //     }, {
    //         field: 'IFNULL(email,"")',
    //         encloseField: false,
    //         alias: 'email'
    //     }, {
    //         field: 'IFNULL(mobile,"")',
    //         encloseField: false,
    //         alias: 'mobile'
    //     }, {
    //         field: 'IFNULL(photo,"")',
    //         encloseField: false,
    //         alias: 'photo'
    //     }, {
    //         field: 'IFNULL(pin,"")',
    //         encloseField: false,
    //         alias: 'pin'
    //     }, {
    //         field: 'IFNULL(dob,"")',
    //         encloseField: false,
    //         alias: 'dob'
    //     }, {
    //         field: 'IFNULL(fk_cityID,"0")',
    //         encloseField: false,
    //         alias: 'cityId'
    //     }, {
    //         field: 'IFNULL(fk_organizationID,"")',
    //         encloseField: false,
    //         alias: 'organization_Id'
    //     }, {
    //         field: 'IFNULL(organizationName,"")',
    //         encloseField: false,
    //         alias: 'organization_name'
    //     }, {
    //         field: 'IFNULL(panNumber,"")',
    //         encloseField: false,
    //         alias: 'pan'
    //     }, {
    //         field: 'IFNULL(countryCode,"")',
    //         encloseField: false,
    //         alias: 'country_code'
    //     }],
    //     filter: {
    //         and: [{
    //             field: 'UM.recordStatus',
    //             encloseField: false,
    //             operator: 'EQ',
    //             value: 1
    //         }, {
    //             field: 'UM.mobile',
    //             encloseField: false,
    //             operator: 'EQ',
    //             value: ''
    //         }]
    //     }
    // },

    checkOTPLimitQuery: {
        table: tbl_OTP,
        select: [{
            field: 'pk_otpID',
            aggregation: 'count',
            alias: 'totalCount'
        }],
        filter: {
            and: [{
                field: 'countryCode',
                operator: 'EQ',
                value: ''
            }, {
                field: 'mobile',
                operator: 'EQ',
                value: ''
            }, {
                field: 'expiryDateTime',
                operator: 'GTEQ',
                value: ''
            }, {
                field: 'expiryDateTime',
                operator: 'LTEQ',
                value: ''
            }]
        }
    },

    updateOTPQuery: {
        table: tbl_OTP,
        update: [{
            field: 'isExpired',
            fValue: 1
        }],
        filter: {
            and: [{
                field: 'countryCode',
                operator: 'EQ',
                value: ''
            }, {
                field: 'mobile',
                operator: 'EQ',
                value: ''
            }, {
                field: 'isExpired',
                operator: 'EQ',
                value: 0
            }]
        }
    },

    insertOTPQuery: {
        table: tbl_OTP,
        insert: {
            field: ["countryCode", "mobile", "OTP", "expiryDateTime"],
            fValue: []
        }
    },

    verifyOTPQuery: {
        table: tbl_OTP,
        select: [{
            field: 'expiryDateTime',
            alias: 'expiry_datetime'
        }, {
            field: 'OTP',
            alias: 'otp'
        }],
        filter: {
            and: [{
                field: 'countryCode',
                operator: 'EQ',
                value: ''
            }, {
                field: 'mobile',
                operator: 'EQ',
                value: ''
            }, {
                field: 'expiryDateTime',
                operator: 'GTEQ',
                value: ''
            }, {
                field: 'isExpired',
                operator: 'EQ',
                value: 0
            }]
        }
    },

    insertAccessTokenQuery: {
        table: tbl_AccessToken,
        insert: {
            field: ["fk_userID", "token", "expiryDateTime", "deviceID"],
            fValue: []
        }
    },

    updateAccessTokenQuery: {
        table: tbl_AccessToken,
        update: [{
            field: 'isExpired',
            fValue: 1
        }],
        filter: {
            or: [{
                and: [{
                    field: 'fk_userID',
                    operator: 'EQ',
                    value: ''
                }, {
                    field: 'deviceID',
                    operator: 'EQ',
                    value: ''
                }]
            }, {
                field: 'deviceID',
                operator: 'EQ',
                value: ''
            }]
        }
    },

    checkUserTransactionQuery: {
        table: tbl_UserTransaction,
        select: [{
            field: 'pk_tranID',
            aggregation: 'count',
            alias: 'totalCount'
        }],
        filter: {
            and: [{
                field: 'deviceID',
                operator: 'EQ',
                value: ''
            }, {
                field: 'deviceType',
                operator: 'EQ',
                value: ''
            }, {
                field: 'fk_userID',
                operator: 'EQ',
                value: ''
            }]
        }
    },

    updateUserTransactionQuery: {
        table: tbl_UserTransaction,
        update: [{
            field: 'isLogedIn',
            fValue: 1
        }],
        filter: {
            and: [{
                field: 'deviceID',
                operator: 'EQ',
                value: ''
            }, {
                field: 'deviceType',
                operator: 'EQ',
                value: ''
            }, {
                field: 'fk_userID',
                operator: 'EQ',
                value: ''
            }]
        }
    },

    insertUserTransactionQuery: {
        table: tbl_UserTransaction,
        insert: {
            field: ["deviceID", "deviceType", "fk_userID", "lastLoginDatetime", "isLogedIn"],
            fValue: []
        }
    },

    getUserProfilePhotoQuery: {
        table: tbl_UserMaster,
        select: [{
            field: 'photo',
            alias: 'photo'
        }],
        filter: {}
    },

    getUserInfoByUserIdQuery: {
        join: {
            table: tbl_UserMaster,
            alias: 'UM',
            joinwith: [{
                table: tbl_UserType,
                alias: 'UT',
                type: 'LEFT',
                joincondition: {
                    table: 'UM',
                    field: 'fk_userTypeID',
                    operator: 'eq',
                    value: {
                        table: 'UT',
                        field: 'pk_userTypeID'
                    }
                }
            }]
        },
        select: [{
            field: 'pk_userID',
            alias: 'user_id'
        }, {
            field: 'fk_userTypeID',
            alias: 'user_type_id'
        }, {
            field: 'userType',
            alias: 'user_type'
        }, {
            field: 'IFNULL(name,"")',
            encloseField: false,
            alias: 'name'
        }, {
            field: 'IFNULL(email,"")',
            encloseField: false,
            alias: 'email'
        }, {
            field: 'IFNULL(mobile,"")',
            encloseField: false,
            alias: 'mobile'
        }, {
            field: 'IFNULL(alternateNumber,"")',
            encloseField: false,
            alias: 'alternate_number'
        },{
            field: 'IFNULL(pin,"")',
            encloseField: false,
            alias: 'pin'
        },{
            field: 'IFNULL(dob,"")',
            encloseField: false,
            alias: 'dob'
        }, {
            field: 'IFNULL(fk_cityId, "0")',
            encloseField: false,
            alias: 'cityId'
        },{
            field: 'IFNULL(fk_organizationID,"")',
            encloseField: false,
            alias: 'organization_id'
        }, {
            field: 'IFNULL(panNumber,"")',
            encloseField: false,
            alias: 'pan_number'
        },  {
            field: 'IFNULL(countryCode,"")',
            encloseField: false,
            alias: 'country_code'
        }, {
            field: 'photo',
            alias: 'photo'
        },{
            field: 'IFNULL(organizationName,"")',
            encloseField: false,
            alias: 'organization_name'
        },{
            field: 'IFNULL(contactNumber,"")',
            encloseField: false,
            alias: 'contact_number'
        },{
            field: 'IFNULL(address,"")',
            encloseField: false,
            alias: 'address'
        },{
            field: 'IFNULL(panNo,"")',
            encloseField: false,
            alias: 'pan_no'
        }, {
            field: 'IFNULL(cstNo,"")',
            encloseField: false,
            alias: 'cst_no'
        },{
            field: 'IFNULL(gstNo,"")',
            encloseField: false,
            alias: 'gst_no'
        },
        {
            field: 'IFNULL(organizationLogo,"")',
            encloseField: false,
            alias: 'organization_logo'
        },{
            field: 'IFNULL(expiryDate,"")',
            encloseField: false,
            alias: 'expiry_date'
        }],
        filter: {
            and: [{
                field: 'UM.recordStatus',
                encloseField: false,
                operator: 'EQ',
                value: 1
            }, {
                field: 'UM.pk_userID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }]
        }
    },

    getUserInfoQuery: {
        table: view_getuserdetail,
        select: [{
            field: 'pk_userID',
            alias: 'user_id'
        },{
            field: 'IFNULL(name,"")',
            encloseField: false,
            alias: 'name'
        }, {
            field: 'IFNULL(email,"")',
            encloseField: false,
            alias: 'email'
        },{
            field: 'mobile',
            alias: 'mobile'
        }, {
            field: 'IFNULL(photo,"")',
            encloseField: false,
            alias: 'photo'
        }, {
            field: 'IFNULL(pin,"")',
            encloseField: false,
            alias: 'pin'
        }, {
            field: 'IFNULL(dob,"")',
            encloseField: false,
            alias: 'dob'
        }, {
            field: 'IFNULL(cityID,"0")',
            encloseField: false,
            alias: 'cityId'
        }, {
            field: 'IFNULL(countryCode,"")',
            encloseField: false,
            alias: 'country_code'
        }, {
            field: 'user_type_id',
            alias: 'user_type_id'
        }, {
            field: 'userType',
            alias: 'user_type'
        }],
        filter: {
            and: [{
                field: 'recordStatus',
                operator: 'EQ',
                value: '1'
            }, {
                field: 'mobile',
                operator: 'EQ',
                value: ''
            }/* , {
                field: 'password',
                operator: 'EQ',
                value: ''
            } */]
        }
    },
};



module.exports = query;