DROP VIEW IF exists `view_GetUserDetail`;
CREATE VIEW `view_GetUserDetail` AS
    SELECT
        `um`.`pk_userID` AS `pk_userID`,
        `um`.`name` AS `name`,
        `um`.`mobile` AS `mobile`,
        `um`.`email` AS `email`,
        `um`.`photo` AS `photo`,
        `um`.`pin` AS `pin`,
        `um`.`dob` AS `dob`,
        `um`.`fk_cityID` AS `cityID`,
        `um`.`countryCode` AS `countryCode`,
        `um`.`recordStatus` AS `recordStatus`,
        `um`.`fk_userTypeID` AS `user_type_id`,
        `ut`.`userType` AS `userType`
    FROM `tbl_UserMaster` AS `um`
        LEFT JOIN `tbl_UserType` AS `ut` ON `ut`.`pk_userTypeID` = `um`.`fk_userTypeID`
    ORDER BY `um`.`pk_userID`;

DROP VIEW IF exists `view_AccessToken`;
CREATE VIEW `view_AccessToken` AS
    SELECT
        `UM`.`pk_userID` AS `user_id`,
        `UM`.`name` AS `name`,
        `UM`.`mobile` AS `mobile`,
        `UM`.`countryCode` AS `country_code`,
        `UM`.`fk_userTypeID` AS `user_type_id`,
        `UM`.`fk_cityID` AS `city_id`,
        `UM`.`photo` AS `photo`,
        `AT`.`token` AS `token`,
        `AT`.`deviceID` AS `deviceID`,
        `AT`.`expiryDateTime` AS `expiryDateTime`
    FROM
		`tbl_UserMaster` `UM`
        LEFT JOIN `tbl_AccessToken` `AT` ON `UM`.`pk_userID` = `AT`.`fk_userID`
    WHERE
        ((`AT`.`isExpired` = 0)
            AND (`AT`.`expiryDateTime` > NOW()));