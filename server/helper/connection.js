// var Client = require('mariasql');
var mysql = require('mysql');
var config = require('../../config');
var constant = require('./constant');
var debug = require('debug')('server:helper:connection');

var connectionpool = mysql.createPool(config.dbConfig);
// var connectionpool = new Client(config.dbConfig);
/**
 * Executes raw query
 * @param  {string}   query raw query
 * @param  {Function} cb    callback function with response
 * @api private
 */
// exports.executeRawQuery = function (query) {
//     debug('constants: ', constant);
//     return new Promise(function (resolve, reject) {

//       connectionpool.getConnection(function (err, connection) {
//         if (err) {
//           var errStatus = constant.status['DB_CONN_ERR'];
//           debug('db-conn-err: ', err);
//           reject({
//             status: false,
//             error: errStatus
//           });
//           return;
//         }
//         connection.query(query, function (err, result) {
//           if (err) {
//             debug(err);
//             if (err.code === "ER_DUP_ENTRY") {
//               reject({
//                 status: false,
//                 error: constant.status.ER_DUP_ENTRY
//               });
//             } else {
//               var errStatus = constant.status['DB_QUERY_ERR'];
//               reject({
//                 status: false,
//                 error: errStatus
//               });
//             }
//             connection.release();
//             return;
//           }
//           resolve({
//             status: true,
//             content: result
//           });
//           connection.release();
//         }); // END query
//       }); // END connection
//     })

exports.executeRawQuery = function (query) {
    return new Promise(function (resolve, reject) {
    connectionpool.getConnection(function (err, connection) {
        if (err) {
            var errStatus = constant.status['DB_CONN_ERR'];
              debug('db-conn-err: ', err);
              reject({
                status: false,
                error: errStatus
              });
            return;
        } else {
            connection.query(query, function (err, result, fields) {
            if(err){
                debug(err);
                if (err.code === "ER_DUP_ENTRY") {
                    reject({
                        status: false,
                        error: constant.status.ER_DUP_ENTRY
                    });
                } else {
                  var errStatus = constant.status['DB_QUERY_ERR'];
                    reject({
                        status: false,
                        error: errStatus
                    });
                }
                connection.release();
                return;
              }
              resolve({
                status: true,
                content: result
              });
              connection.release();
            }); // END query
            // connection.query(query, function (error, result, fields) {
            //     if (error) {
            //         connection.release();
            //         cb({
            //             status: false,
            //             error: error
            //         });
            //     } else {
            //         connection.release();
            //         cb({
            //             status: true,
            //             content: result
            //         });
            //     }
            // });
        }

    });
    })
    // connectionpool.query(query, function (err, result) {
    //     if (err) {
    //         debug(err);
    //         if (err.code === "ER_DUP_ENTRY") {
    //             cb({
    //                 status: false,
    //                 error: constant.status.ER_DUP_ENTRY
    //             });
    //         } else {
    //             var errStatus = constant.status['DB_QUERY_ERR'];
    //             cb({
    //                 status: false,
    //                 error: errStatus
    //             });
    //         }
    //         connectionpool.end();
    //         connectionpool.release();
    //         return;
    //     }
    //     cb({
    //         status: true,
    //         content: result
    //     });
    //     // connectionpool.end();
    // }); // END query
};
//************************************************************************************ */
// exports.executeRawQueryWithTransactions = function (querys, cb) {
    // connectionpool.getConnection(function(err, connection) {
    // if (err) {
    //   var errStatus = constant.status['DB_CONN_ERR'];
    //   cb({
    //     status: false,
    //     error: errStatus
    //   });
    //   return;
    // }

    // connectionpool.beginTransaction(function(err) {
    //   if (err) {
    //     var errStatus = constant.status['DB_CONN_ERR'];
    //     cb({
    //       status: false,
    //       error: errStatus
    //     });
    //     return;
    //   }
    // executeRawQueryRecursion(0);
    // function executeRawQueryRecursion(index) {
    //     if (querys.length > index) {
    //         var query = querys[index];
    //         connectionpool.query(query, function (err, result) {
    //             if (err) {
    //                 debug(err);
    //                 connectionpool.rollback();
    //                 connectionpool.release();
    //                 var errStatus = constant.status['DB_QUERY_ERR'];
    //                 cb({
    //                     status: false,
    //                     error: errStatus
    //                 });
    //                 return;
    //             } else {
    //                 executeRawQueryRecursion((index + 1));
    //             }
    //         }); // END connectionpool.query
    //     } else {
    //         connectionpool.commit(function (err) {
    //             if (err) {
    //                 connectionpool.rollback();
    //                 connectionpool.release();
    //                 var errStatus = constant.status['DB_QUERY_ERR'];
    //                 cb({
    //                     status: false,
    //                     error: errStatus
    //                 });
    //                 return;
    //             }
    //             connectionpool.release();
    //             cb({
    //                 status: true,
    //                 content: constant.status.MSG_TRANSACTION_SUCCESS
    //             });
    //             debug('Transaction success!');
    //         }); // end connection.commit
    //     }
    // } // END executeRawQueryRecursion
    // }); // END beginTransaction
    // }); // END connection
// };
//************************************************************** */

exports.executeRawQueryWithTransactions = function (querys) {
    debug("executeRawQueryWithTransactions ---> ");
    return new Promise((resolve, reject) => {
      connectionpool.getConnection((err, connection) => {
        if (err) {
          var errStatus = constant.status['DB_CONN_ERR'];
          reject({
            status: false,
            error: errStatus
          });
          return;
        }
  
        connection.beginTransaction((err) => {
          if (err) {
            var errStatus = constant.status['DB_CONN_ERR'];
            reject({
              status: false,
              error: errStatus
            });
            return;
          }
          executeRawQueryRecursion(0);
          function executeRawQueryRecursion(index) {
            if (querys.length > index) {
              var query = querys[index];
              connection.query(query, (err, result) => {
                if (err) {
                  debug(err);
                  connection.rollback();
                  connection.release();
                  var errStatus = constant.status['DB_QUERY_ERR'];
                  reject({
                    status: false,
                    error: errStatus
                  });
                  return;
                } else {
                  executeRawQueryRecursion((index + 1));
                }
              }); // END connection.query
            } else {
              connection.commit((err) => {
                if (err) {
                  connection.rollback();
                  connection.release();
                  var errStatus = constant.status['DB_QUERY_ERR'];
                  reject({
                    status: false,
                    error: errStatus
                  });
                  return;
                }
                connection.release();
                resolve({
                  status: true,
                  content: constant.status['MSG_TRANSACTION_SUCCESS']
                });
                debug('Transaction success!');
              }); // end connection.commit
            }
          } // END executeRawQueryRecursion
        }); // END beginTransaction
      }); // END connection
    }); //END Promise
  };