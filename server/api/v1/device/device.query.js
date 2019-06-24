let tbl_DeviceLocation = "tbl_DeviceLocation";
let tbl_Device = "tbl_Device";
let tbl_DeviceType = "tbl_DeviceType";
let tbl_UserDevice = "tbl_UserDevice";
let tbl_DeviceLocationType = "tbl_DeviceLocationType";
let tbl_DeviceController = "tbl_DeviceController";
let tbl_DeviceControllerType = "tbl_DeviceControllerType";
let tbl_DeviceControllerTransaction = "tbl_DeviceControllerTransaction";

let query = {

    insertDeviceLocationQuery: {
        table: tbl_DeviceLocation,
        insert: {
            field: ["locationName", "fk_deviceLocationTypeID", "fk_userID", "createdBy", "modifiedBy", "recordStatus"],
            fValue: []
        }
    },

    updateDeviceLocationQuery: {
        table: tbl_DeviceLocation,
        update: [],
        filter: {}
    },

    updateCurrentStatusQuery: {
        table: tbl_DeviceController,
        update: [],
        filter: {}
    },

    insertDeviceQuery: {
        table: tbl_Device,
        insert: {
            field: ["fk_deviceTypeID", "deviceKey", "secretKey", "version", "manufacturedDate", "createdBy", "modifiedBy", "recordStatus"],
            encloseField: false,
            fValue: []
        }
    },

    insertUserDeviceQuery: {
        table: tbl_UserDevice,
        insert: {
            field: ["fk_userID", "fk_deviceID", "fk_deviceLocationID", "status", "createdBy", "modifiedBy", "recordStatus"],
            fValue: []
        }
    },

    insertDeviceControllerTransactionQuery: {
        table: tbl_DeviceControllerTransaction,
        insert: {
            field: ["fk_deviceControllerID", "startDate", "endDate", "createdBy", "modifiedBy"],
            fValue: []
        }
    },

    updateDeviceControllerTransactionQuery: {
        table: tbl_DeviceControllerTransaction,
        update: [],
        filter: {}
    },

    insertDeviceControllerQuery: {
        table: tbl_DeviceController,
        insert: {
            field: ["deviceControllerName", "fk_deviceID", "fk_deviceControllerTypeID", "pin", "voltage", "createdBy", "modifiedBy", "recordStatus"],
            fValue: []
        }
    },

    deleteUserDeviceQuery: {
        table: tbl_UserDevice,
        update: [],
        filter: {
            field: 'pk_userDeviceID',
            operator: 'EQ',
            value: ''
        }
    },

    // updateUserTransactionQuery: {
    //     table: tbl_DeviceLocation,
    //     update: [{
    //         field: 'isLogedIn',
    //         fValue: 1
    //     }],
    //     filter: {
    //         and: [{
    //             field: 'deviceID',
    //             operator: 'EQ',
    //             value: ''
    //         }, {
    //             field: 'deviceType',
    //             operator: 'EQ',
    //             value: ''
    //         }, {
    //             field: 'fk_userID',
    //             operator: 'EQ',
    //             value: ''
    //         }]
    //     }
    // },

    getUserLocationsQuery: {
        join: {
            table: tbl_DeviceLocation,
            alias: 'DL',
            joinwith: [{
                table: tbl_DeviceLocationType,
                alias: 'DLT',
                joincondition: {
                    table: 'DL',
                    field: 'fk_deviceLocationTypeID',
                    operator: 'eq',
                    value: {
                        table: 'DLT',
                        field: 'pk_deviceLocationTypeID'
                    }
                }
            }]
        },
        select: [{
            field: 'pk_deviceLocationID',
            alias: 'device_location_id'
        }, {
            field: 'locationName',
            alias: 'location_name'
        }, {
            field: 'fk_deviceLocationTypeID',
            alias: 'device_location_type_id'
        }, {
            field: 'deviceLocationType',
            alias: 'device_location_type'
        }],
        filter: {
            and: [{
                field: 'DL.recordStatus',
                encloseField: false,
                operator: 'EQ',
                value: 1
            }, {
                field: 'DL.createdDate',
                encloseField: false,
                operator: 'LT',
                value: ''
            },  {
                field: 'DL.fk_userID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }]
        }
    },

    getDevicesQuery: {
        join: {
            table: tbl_Device,
            alias: 'DM',
            joinwith: [{
                table: tbl_DeviceType,
                alias: 'DT',
                joincondition: {
                    table: 'DM',
                    field: 'fk_deviceTypeID',
                    operator: 'eq',
                    value: {
                        table: 'DT',
                        field: 'pk_deviceTypeID'
                    }
                }
            }]
        },
        select: [{
            field: 'pk_deviceID',
            alias: 'device_id'
        }, {
            field: 'fk_deviceTypeID',
            alias: 'device_type_id'
        }, {
            field: 'deviceName',
            alias: 'device_name'
        }, {
            field: 'deviceVersion',
            alias: 'device_version'
        }, {
            field: 'deviceKey',
            alias: 'device_key'
        }, {
            field: 'version',
            alias: 'version'
        }, {
            field: 'manufacturedDate',
            alias: 'manufactured_date'
        }],
        filter: {
            and: [{
                field: 'DM.recordStatus',
                encloseField: false,
                operator: 'EQ',
                value: 1
            }, {
                field: 'DM.createdDate',
                encloseField: false,
                operator: 'LT',
                value: ''
            }]
        }
    },

    getUserDevicesQuery: {
        join: {
            table: tbl_UserDevice,
            alias: 'UD',
            joinwith: [{
                table: tbl_Device,
                alias: 'DM',
                joincondition: {
                    table: 'DM',
                    field: 'pk_deviceID',
                    operator: 'eq',
                    value: {
                        table: 'UD',
                        field: 'fk_deviceID'
                    }
                }
            }, {
                table: tbl_DeviceType,
                alias: 'DT',
                joincondition: {
                    table: 'DM',
                    field: 'fk_deviceTypeID',
                    operator: 'eq',
                    value: {
                        table: 'DT',
                        field: 'pk_deviceTypeID'
                    }
                }
            }, {
                table: tbl_DeviceLocation,
                alias: 'DL',
                joincondition: {
                    table: 'UD',
                    field: 'fk_deviceLocationID',
                    operator: 'eq',
                    value: {
                        table: 'DL',
                        field: 'pk_deviceLocationID'
                    }
                }
            }, {
                table: tbl_DeviceLocationType,
                alias: 'DLT',
                joincondition: {
                    table: 'DL',
                    field: 'fk_deviceLocationTypeID',
                    operator: 'eq',
                    value: {
                        table: 'DLT',
                        field: 'pk_deviceLocationTypeID'
                    }
                }
            }]
        },
        select: [{
            field: 'pk_userDeviceID',
            alias: 'user_device_id'
        }, {
            field: 'pk_deviceID',
            alias: 'device_id'
        }, {
            field: 'fk_deviceTypeID',
            alias: 'device_type_id'
        }, {
            field: 'deviceName',
            alias: 'device_name'
        }, {
            field: 'locationName',
            alias: 'location_name'
        }, {
            field: 'deviceLocationType',
            alias: 'device_location_type'
        }, {
            field: 'deviceVersion',
            alias: 'device_version'
        }, {
            field: 'deviceKey',
            alias: 'device_key'
        }, {
            field: 'version',
            alias: 'version'
        }, {
            field: 'manufacturedDate',
            alias: 'manufactured_date'
        }],
        filter: {
            and: [{
                field: 'DM.recordStatus',
                encloseField: false,
                operator: 'EQ',
                value: 1
            }, {
                field: 'DM.createdDate',
                encloseField: false,
                operator: 'LT',
                value: ''
            }, {
                field: 'UD.fk_userID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }]
        }
    },

    getDeviceControllerQuery: {
        join: {
            table: tbl_DeviceController,
            alias: 'DC',
            joinwith: [{
                table: tbl_DeviceControllerType,
                alias: 'DCT',
                joincondition: {
                    table: 'DC',
                    field: 'fk_deviceControllerTypeID',
                    operator: 'eq',
                    value: {
                        table: 'DCT',
                        field: 'pk_deviceControllerTypeID'
                    }
                }
            }, {
                table: tbl_Device,
                alias: 'DR',
                joincondition: {
                    table: 'DR',
                    field: 'pk_deviceID',
                    operator: 'eq',
                    value: {
                        table: 'DC',
                        field: 'fk_deviceID'
                    }
                }
            }]
        }, 
        select: [{
            field: 'pk_deviceControllerID',
            alias: 'device_controller_id'
        }, {
            field: 'deviceControllerName',
            alias: 'device_controller_name'
        }, {
            field: 'deviceControllerTypeName',
            alias: 'device_controller_type_name'
        }, {
            field: 'deviceKey',
            alias: 'device_key'
        }, {
            field: 'fk_deviceID',
            alias: 'device_id'
        }, {
            field: 'fk_deviceControllerTypeID',
            alias: 'device_controller_type_id'
        }, {
            field: 'status',
            alias: 'status'
        }, {
            field: 'pin',
            alias: 'pin'
        }, {
            field: 'voltage',
            alias: 'voltage'
        }],
        filter: {
            and: [{
                field: 'DC.recordStatus',
                encloseField: false,
                operator: 'EQ',
                value: 1
            }, {
                field: 'DC.createdDate',
                encloseField: false,
                operator: 'LT',
                value: ''
            }, {
                field: 'DC.fk_deviceID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }]
        }
    },

    getDeviceControllerStatusQuery: {
        table: tbl_DeviceController,
        select: [{
            field: 'pk_deviceControllerID',
            alias: 'device_controller_id'
        }, {
            field: 'fk_deviceID',
            alias: 'device_id'
        }, {
            field: 'status',
            alias: 'status'
        }, {
            field: 'pin',
            alias: 'pin'
        }],
        filter: {
            and: [{
                field: 'recordStatus',
                encloseField: false,
                operator: 'EQ',
                value: 1
            }, {
                field: 'fk_deviceID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }, {
                field: 'pk_deviceControllerID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }]
        }
    },

    checkDeviceQuery: {
        join: {
            table: tbl_Device,
            alias: 'DM',
            joinwith: [{
                table: tbl_DeviceType,
                alias: 'DT',
                joincondition: {
                    table: 'DM',
                    field: 'fk_deviceTypeID',
                    operator: 'eq',
                    value: {
                        table: 'DT',
                        field: 'pk_deviceTypeID'
                    }
                }
            }]
        },
        select: [{
            field: 'pk_deviceID',
            alias: 'device_id'
        }, {
            field: 'deviceName',
            alias: 'device_name'
        }, {
            field: 'version',
            alias: 'version'
        }, {
            field: 'manufacturedDate',
            encloseField: false,
            alias: 'menufactured_date'
        }],
        filter: {
            and: [{
                field: 'DM.fk_deviceTypeID',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }, {
                field: 'DM.deviceKey',
                encloseField: false,
                operator: 'EQ',
                value: ''
            }]
        }
    }
};



module.exports = query;