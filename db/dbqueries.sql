create database aimapp;
use aimapp;

CREATE TABLE `tbl_DatabaseVersion` (
  `pk_dbID` int(11) NOT NULL AUTO_INCREMENT,
  `dbVersion` float NOT NULL,
  `currentScriptVersion` float NOT NULL,
  `lastScriptVersion` float NOT NULL,
  `updatedDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pk_dbID`)
);

Insert into tbl_DatabaseVersion (dbVersion,currentScriptVersion,lastScriptVersion,updatedDatetime)VALUES (1,'0.1',0,now());

CREATE TABLE `tbl_UserType` (
  `pk_userTypeID` INT(11) NOT NULL AUTO_INCREMENT,
  `userType` VARCHAR(45) NOT NULL,
  `createdDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NULL DEFAULT 0,
  `modifiedDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NULL DEFAULT 0,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_userTypeID`),
  UNIQUE INDEX `pk_userID_UNIQUE` (`pk_userTypeID` ASC));

CREATE TABLE `tbl_CountryMaster` (
  `pk_countryID` int(11) NOT NULL AUTO_INCREMENT,
  `countryCode` varchar(10) NOT NULL,
  `countryName` varchar(100) NOT NULL,
  `mobileMaxLength` int(11) DEFAULT NULL,
  `createdDateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy`int(11) DEFAULT '0',
  `modifiedDateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy`int(11) DEFAULT '0',
  `recordStatus` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`pk_countryID`),
  UNIQUE KEY `countryCode` (`countryCode`)
);

CREATE TABLE `tbl_StateMaster` (
  `pk_stateID` INT NOT NULL AUTO_INCREMENT,
  `fk_countryID` INT(11) NOT NULL,
  `stateName` VARCHAR(45) NOT NULL,
  `createdDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NULL DEFAULT 0,
  `modifiedDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NULL DEFAULT 0,
  `recordStatus` TINYINT(1) NULL DEFAULT 1,
  PRIMARY KEY (`pk_stateID`),
  INDEX `fk_tbl_StateMaster_1_idx` (`fk_countryID` ASC),
  CONSTRAINT `fk_tbl_StateMaster_1`
    FOREIGN KEY (`fk_countryID`)
    REFERENCES `tbl_CountryMaster` (`pk_countryID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `tbl_CityMaster` (
  `pk_cityID` INT(11) NOT NULL AUTO_INCREMENT,
  `fk_countryID` INT(11) NOT NULL,
  `fk_stateID` INT(11) NOT NULL,
  `cityName` VARCHAR(100) NOT NULL,
  `createdDateTime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NULL DEFAULT 0,
  `modifiedDateTime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NULL DEFAULT 0,
  `recordStatus` TINYINT(1) NULL DEFAULT 1,
  PRIMARY KEY (`pk_cityID`),
  INDEX `fk_tbl_CityMaster_1_idx` (`fk_countryID` ASC),
  INDEX `fk_tbl_CityMaster_2_idx` (`fk_stateID` ASC),
  CONSTRAINT `fk_tbl_CityMaster_1`
    FOREIGN KEY (`fk_countryID`)
    REFERENCES `tbl_CountryMaster` (`pk_countryID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_CityMaster_2`
    FOREIGN KEY (`fk_stateID`)
    REFERENCES `tbl_StateMaster` (`pk_stateID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `tbl_UserMaster` (
  `pk_userID` INT(11) NOT NULL AUTO_INCREMENT,
  `fk_userTypeID` INT(11) NOT NULL DEFAULT 1,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(50) NULL DEFAULT NULL,
  `mobile` VARCHAR(50) NOT NULL,
  `photo` VARCHAR(100) NULL DEFAULT NULL,
  `pin` VARCHAR(30) NULL DEFAULT NULL,
  `dob` DATE NULL DEFAULT NULL,
  `fk_cityID` INT(11) NOT NULL DEFAULT 1,
  `countryCode` VARCHAR(10) NOT NULL,
  `createdDateTime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL DEFAULT 0,
  `modifiedDateTime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL DEFAULT 0,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_userID`),
  UNIQUE INDEX `mobile_UNIQUE` (`mobile` ASC),
  INDEX `fk_tbl_UserMaster_1_idx` (`fk_userTypeID` ASC),
  INDEX `fk_tbl_UserMaster_2_idx` (`fk_cityID` ASC),
  CONSTRAINT `fk_tbl_UserMaster_1`
    FOREIGN KEY (`fk_userTypeID`)
    REFERENCES `tbl_UserType` (`pk_userTypeID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_UserMaster_2`
    FOREIGN KEY (`fk_cityID`)
    REFERENCES `tbl_CityMaster` (`pk_cityID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `tbl_OTP` (
  `pk_otpID` int(11) NOT NULL AUTO_INCREMENT,
  `countryCode` varchar(10) DEFAULT NULL,
  `mobile` varchar(20) NOT NULL,
  `otp` int(11) NOT NULL,
  `expiryDateTime` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `isExpired` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`pk_otpID`)
);

CREATE TABLE `tbl_AccessToken` (
  `pk_tokenID` INT(11) NOT NULL AUTO_INCREMENT,
  `fk_userID` INT(11) NOT NULL,
  `token` VARCHAR(100) NOT NULL,
  `deviceID` VARCHAR(100) NOT NULL,
  `expiryDateTime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `createdDateTime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `isExpired` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`pk_tokenID`),
  INDEX `fk_tbl_AccessToken_1_idx` (`fk_userID` ASC),
  CONSTRAINT `fk_tbl_AccessToken_1`
    FOREIGN KEY (`fk_userID`)
    REFERENCES `tbl_UserMaster` (`pk_userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `tbl_UserTransaction` (
  `pk_tranID` int(11) NOT NULL AUTO_INCREMENT,
  `fk_userID` int(11) NOT NULL,
  `deviceID` varchar(100) DEFAULT NULL,
  `pushToken` varchar(100) DEFAULT NULL,
  `deviceType` varchar(100) DEFAULT NULL,
  `lastLoginDateTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `isLogedIn` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`pk_tranID`),
  INDEX `fk_tbl_UserTransaction_1_idx` (`fk_userID` ASC),
  CONSTRAINT `fk_tbl_UserTransaction_1`
    FOREIGN KEY (`fk_userID`)
    REFERENCES `tbl_UserMaster` (`pk_userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `tbl_Logger` (
  `pk_logID` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(10) NOT NULL,
  `URL` varchar(5000) NOT NULL,
  `headers` text,
  `body` text,
  `params` varchar(5000) DEFAULT NULL,
  `query` varchar(5000) DEFAULT NULL,
  `fk_userID` int(11) DEFAULT NULL,
  `createdDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ipAddress` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`pk_logID`),
  INDEX `fk_tbl_Logger_1_idx` (`fk_userID` ASC),
  CONSTRAINT `fk_tbl_Logger_1`
    FOREIGN KEY (`fk_userID`)
    REFERENCES `tbl_UserMaster` (`pk_userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO `tbl_UserType` (`pk_userTypeID`, `userType`, `createdBy`, `modifiedBy`, `recordStatus`) VALUES ('1', 'admin', '1', '1', '1');
INSERT INTO `tbl_UserType` (`pk_userTypeID`, `userType`, `createdBy`, `modifiedBy`, `recordStatus`) VALUES ('2', 'user', '1', '1', '1');

INSERT into tbl_CountryMaster (countryCode, countryName, mobileMaxLength) values ( "+91", "India", "10");
INSERT into tbl_StateMaster (fk_countryID, stateName) values (1 ,"Gujarat");
INSERT into tbl_CityMaster (fk_countryID, fk_stateID, cityName) values (1, 1, "Ahmedabad");


CREATE TABLE `tbl_DeviceType` (
  `pk_deviceTypeID` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceName` VARCHAR(45) NOT NULL,
  `deviceVersion` VARCHAR(45) NOT NULL,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceTypeID`));

INSERT INTO tbl_DeviceType (deviceName, deviceVersion, createdBy, modifiedBy) VALUES ('Raspberrypi', '3 Model B', '1', '1');
INSERT INTO tbl_DeviceType (deviceName, deviceVersion, createdBy, modifiedBy) VALUES ('Arduino', 'UNO', '1', '1');
INSERT INTO tbl_DeviceType (deviceName, deviceVersion, createdBy, modifiedBy) VALUES ('ESP8266', '01', '1', '1');
INSERT INTO tbl_DeviceType (deviceName, deviceVersion, createdBy, modifiedBy) VALUES ('ESP8266', '12E', '1', '1');

CREATE TABLE `tbl_Device` (
  `pk_deviceID` INT NOT NULL AUTO_INCREMENT,
  `fk_deviceTypeID` INT(11) NOT NULL,
  `deviceKey` VARCHAR(45) NOT NULL,
  `secretKey` VARCHAR(45) NOT NULL,
  `version` FLOAT NOT NULL DEFAULT 0.1,
  `manufacturedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceID`),
  UNIQUE INDEX `deviceKey_UNIQUE` (`deviceKey` ASC),
  UNIQUE INDEX `secretKey_UNIQUE` (`secretKey` ASC),
  INDEX `fk_tbl_Device_1_idx` (`fk_deviceTypeID` ASC),
  CONSTRAINT `fk_tbl_Device_1_idx`
    FOREIGN KEY (`fk_deviceTypeID`)
    REFERENCES `tbl_DeviceType` (`pk_deviceTypeID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `tbl_DeviceLocation` (
  `pk_deviceLocationID` INT(11) NOT NULL,
  `locationName` VARCHAR(45) NOT NULL,
  `fk_userID` INT(11) NOT NULL,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceLocationID`),
  UNIQUE INDEX `pk_deviceLocation_UNIQUE` (`pk_deviceLocationID` ASC),
  INDEX `fk_tbl_DeviceLocation_1_idx` (`fk_userID` ASC),
  CONSTRAINT `fk_tbl_DeviceLocation_1_idx`
    FOREIGN KEY (`fk_userID`)
    REFERENCES `tbl_UserMaster` (`pk_userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `tbl_DeviceLocation` 
CHANGE COLUMN `pk_deviceLocationID` `pk_deviceLocationID` INT(11) NOT NULL AUTO_INCREMENT ;

CREATE TABLE `tbl_DeviceLocationType` (
  `pk_deviceLocationTypeID` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceLocationType` VARCHAR(45) NOT NULL,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceLocationTypeID`),
  UNIQUE INDEX `pk_deviceLocationTypeID_UNIQUE` (`pk_deviceLocationTypeID` ASC));


INSERT INTO tbl_DeviceLocationType (deviceLocationType, createdBy, modifiedBy, recordStatus) VALUES('Home', 1,1,1);
INSERT INTO tbl_DeviceLocationType (deviceLocationType, createdBy, modifiedBy, recordStatus) VALUES('Organization', 1,1,1);
INSERT INTO tbl_DeviceLocationType (deviceLocationType, createdBy, modifiedBy, recordStatus) VALUES('Public Place', 1,1,1);

ALTER TABLE `tbl_DeviceLocation` 
ADD COLUMN `fk_deviceLocationTypeID` INT(11) NOT NULL DEFAULT 1 after `locationName`,
ADD INDEX `fk_tbl_DeviceLocation_2_idx` (`fk_deviceLocationTypeID` ASC);
ALTER TABLE `tbl_DeviceLocation` 
ADD CONSTRAINT `fk_tbl_DeviceLocation_2_idx`
  FOREIGN KEY (`fk_deviceLocationTypeID`)
  REFERENCES `tbl_DeviceLocationType` (`pk_deviceLocationTypeID`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `tbl_Device` 
CHANGE COLUMN `deviceKey` `deviceKey` VARCHAR(255) NOT NULL ,
CHANGE COLUMN `secretKey` `secretKey` VARBINARY(255) NOT NULL ;

CREATE TABLE `tbl_UserDevice` (
  `pk_userDeviceID` INT(11) NOT NULL AUTO_INCREMENT,
  `fk_userID` INT(11) NOT NULL,
  `fk_deviceID` INT(11) NOT NULL,
  `status` INT(4) NOT NULL,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_userDeviceID`),
  UNIQUE INDEX `pk_userDeviceID_UNIQUE` (`pk_userDeviceID` ASC),
  INDEX `fk_tbl_UserDevice_1_idx` (`fk_userID` ASC),
  INDEX `fk_tbl_UserDevice_2_idx` (`fk_deviceID` ASC),
  CONSTRAINT `fk_tbl_UserDevice_1`
    FOREIGN KEY (`fk_userID`)
    REFERENCES `tbl_UserMaster` (`pk_userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_UserDevice_2`
    FOREIGN KEY (`fk_deviceID`)
    REFERENCES `tbl_Device` (`pk_deviceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `tbl_UserDevice` 
ADD COLUMN `fk_deviceLocationID` INT(11) NOT NULL DEFAULT 1 AFTER `fk_deviceID`,
ADD INDEX `fk_tbl_UserDevice_3_idx` (`fk_deviceLocationID` ASC);
ALTER TABLE `tbl_UserDevice` 
ADD CONSTRAINT `fk_tbl_UserDevice_3`
  FOREIGN KEY (`fk_deviceLocationID`)
  REFERENCES `tbl_DeviceLocation` (`pk_deviceLocationID`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


Insert into tbl_DatabaseVersion ( dbVersion, currentScriptVersion, lastScriptVersion, updatedDatetime ) VALUES (1, '0.11', '0.1', now());

CREATE TABLE `tbl_DeviceControllerType` (
  `pk_deviceControllerTypeID` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceControllerTypeName` VARCHAR(100) NOT NULL,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceControllerTypeID`),
  UNIQUE INDEX `pk_deviceControllerTypeID_UNIQUE` (`pk_deviceControllerTypeID` ASC));

CREATE TABLE `tbl_DeviceController` (
  `pk_deviceControllerID` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceControllerName` VARCHAR(100) NOT NULL,
  `fk_userDeviceID` INT(11) NOT NULL,
  `fk_deviceControllerTypeID` INT(11) NOT NULL,
  `pin` TINYINT(1) NULL,
  `voltage` INT(11) NOT NULL,
  `createdDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` TINYINT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceControllerID`),
  UNIQUE INDEX `pk_deviceControllerID_UNIQUE` (`pk_deviceControllerID` ASC),
  INDEX `fk_tbl_DeviceController_1_idx` (`fk_userDeviceID` ASC),
  INDEX `fk_tbl_DeviceController_2_idx` (`fk_deviceControllerTypeID` ASC),
  CONSTRAINT `fk_tbl_DeviceController_1`
    FOREIGN KEY (`fk_userDeviceID`)
    REFERENCES `tbl_UserDevice` (`pk_userDeviceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_DeviceController_2`
    FOREIGN KEY (`fk_deviceControllerTypeID`)
    REFERENCES `tbl_DeviceControllerType` (`pk_deviceControllerTypeID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

INSERT INTO `tbl_DeviceControllerType` (`deviceControllerTypeName`, `createdBy`, `modifiedBy`) VALUES ('Fan', '1', '1');
INSERT INTO `tbl_DeviceControllerType` (`deviceControllerTypeName`, `createdBy`, `modifiedBy`) VALUES ('Light', '1', '1');

ALTER TABLE `tbl_DeviceController` 
DROP FOREIGN KEY `fk_tbl_DeviceController_1`;

ALTER TABLE `tbl_DeviceController` 
CHANGE COLUMN `fk_userDeviceID` `fk_deviceID` INT(11) NOT NULL ,
ADD INDEX `fk_tbl_DeviceController_1_idx` (`fk_deviceID` ASC),
DROP INDEX `fk_tbl_DeviceController_1_idx` ;

ALTER TABLE `tbl_DeviceController` 
ADD CONSTRAINT `fk_tbl_DeviceController_1`
  FOREIGN KEY (`fk_deviceID`)
  REFERENCES `tbl_Device` (`pk_deviceID`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


alter table tbl_DeviceController add column status tinyint(4) NOT NULL default 0 after fk_deviceControllerTypeID;

CREATE TABLE `tbl_DeviceControllerTransaction` (
  `pk_deviceControllerTransactionID` INT(11) NOT NULL AUTO_INCREMENT,
  `fk_deviceControllerID` INT(11) NOT NULL,
  `startDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endDate` DATETIME DEFAULT NULL,
  `createdDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT(11) NOT NULL,
  `modifiedDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` INT(11) NOT NULL,
  `recordStatus` INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pk_deviceControllerTransactionID`),
  UNIQUE INDEX `pk_deviceControllerTransactionID_UNIQUE` (`pk_deviceControllerTransactionID` ASC),
  INDEX `fk_tbl_DeviceControllerTransaction_1_idx` (`fk_deviceControllerID` ASC),
  CONSTRAINT `fk_tbl_DeviceControllerTransaction_1`
    FOREIGN KEY (`fk_deviceControllerID`)
    REFERENCES `tbl_DeviceController` (`pk_deviceControllerID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
