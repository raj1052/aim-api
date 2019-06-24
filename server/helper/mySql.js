var debug = require('debug')('server:helper:mySql');
var connectionIdentifier = require('../../core_modules/node-database-connectors');
var connection = require('./connection');
var config = require('../../config');


// function prepareQuery(queryJSON, cb) {
//     try {
//         var objConnection = connectionIdentifier.identify(config.dbConfig);
//         // debug("objConnection", objConnection);
//         var query = objConnection.prepareQuery(queryJSON);
//         // debug("query", query);
//         cb({
//             status: true,
//             content: query
//         });
//     } catch (ex) {
//         cb({
//             status: false,
//             error: ex
//         });
//     }
// }

function prepareQuery(queryJSON) {

    return new Promise( (resolve, reject) => {
        try {
            var objConnection = connectionIdentifier.identify(config.dbConfig);
            var query = objConnection.prepareQuery(queryJSON);
            console.log(query);
            debug("query", query);
            
            resolve({
                status: true,
                content: query
            });
        } catch (ex) {
            reject({
                status: false,
                error: ex
            });
        }
    })
}

// exports.executeQuery = function (queryJSON, cb) {
//     console.log("mysqqql-----------------");
//     prepareQuery(queryJSON, function (result) {
//         if (result.status === false) {
//             cb(result);
//         } else {
//             var rawQuery = result.content;
//             console.log("rawQuery", rawQuery);
//             // debug("Raw Query ==>", rawQuery);
//             connection.executeRawQuery(rawQuery, cb);
//         }
//     });
// };

exports.executeQuery = async (queryJSON, cb) => {
    try {
        var result = await prepareQuery(queryJSON);
        debug(result);
        var rawQuery = result.content;
        console.log("rawQuery", rawQuery);
        var queryResult = await connection.executeRawQuery(rawQuery);
        debug("queryResult",queryResult);
        if (cb) {
            cb(queryResult);
        }
        else {
            return queryResult;
        }
    }
    catch (ex) {
        debug("in executeQuery ---->", ex);
        return ex;
    }
};

exports.executeRawQuery = async (rawQuery) => {
    debug(rawQuery);
    return await connection.executeRawQuery(rawQuery);
};

var prepareMultipleQuery = async (queryArrayJSON) => {
    
      return new Promise(function (resolve, reject) {
        try {
          var rawQueryArray = [];
          prepareMultipleQueryRecursion(0);
    
          async function prepareMultipleQueryRecursion(index) {
            if (queryArrayJSON.length > index) {
                var queryJSON = queryArrayJSON[index];
                debug("queryJSON -->", queryJSON);
                var result = await prepareQuery(queryJSON);
                if(result.status === false){
                    reject({
                        status: false
                    })
                } else {
                    var rawQuery = result.content;
                    debug(rawQuery);
                    rawQueryArray.push(rawQuery);
                    await prepareMultipleQueryRecursion((index + 1)); 
                }
            } else {
              resolve({
                status: true,
                content: rawQueryArray
              })
            }
          }
        } catch (ex) {
          reject({
            status: false,
            error: ex
          });
        }
      })
    }


// let prepareMultipleQuery = (queryArrayJSON) => {
//     debug("prepareMultipleQuery --->");
//     var rawQueryArray = [];
//     prepareMultipleQueryRecursion(0);

    // function prepareMultipleQueryRecursion(index) {
    //     if (queryArrayJSON.length > index) {
    //         var queryJSON = queryArrayJSON[index];
    //         prepareQuery(queryJSON, function (result) {
    //             if (result.status === false) {
    //                 cb(result);
    //                 return;
    //             } else {
    //                 var rawQuery = result.content;
    //                 // debug(rawQuery);
    //                 rawQueryArray.push(rawQuery);
    //                 prepareMultipleQueryRecursion((index + 1));
    //             }
    //         });
    //     } else {
    //         cb({
    //             status: true,
    //             content: rawQueryArray
    //         })
    //     }
    // }
// }
exports.executeQueryWithTransactions = async (queryArrayJSON) => {
    try {
      debug("executeQueryWithTransactions---> ");
      var result = await prepareMultipleQuery(queryArrayJSON);
      var rawQueryArray = result.content;
      debug("rawQuery---> ",rawQueryArray);
      var queryResult = await connection.executeRawQueryWithTransactions(rawQueryArray);
      debug("queryResult---> ",queryResult);
      return queryResult;
    }
    catch (ex) {
      throw ex;
    }
  };

  
// exports.executeQueryWithTransactions = async (queryArrayJSON) => {
//     let query = await prepareMultipleQuery(queryArrayJSON);
//     if(query.status === false){
//         return query;
//     } else {
//         var rawQueryArray = result.content;
//         connection.executeRawQueryWithTransactions(rawQueryArray);
//     }
    // prepareMultipleQuery(queryArrayJSON, function (result) {
    //     if (result.status === false) {
    //         cb(result);
    //     } else {
    //         var rawQueryArray = result.content;
    //         connection.executeRawQueryWithTransactions(rawQueryArray, cb);
    //     }
    // });
// };

exports.executeRawQueryWithTransactions = (rawQueryArray) => {
    // debug(rawQueryArray);
    connection.executeRawQueryWithTransactions(rawQueryArray);
};
