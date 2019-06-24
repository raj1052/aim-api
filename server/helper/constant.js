var status = {
    // database errors
    'DB_CONN_ERR': {
        code: 10000,
        message: 'Cannot connect to database'
    },
    'DB_QUERY_ERR': {
        code: 10001,
        message: 'Cannot execute query'
    },
    'ER_DUP_ENTRY': {
        code: 10002,
        message: 'Error duplicate entry'
    },
    'MSG_TRANSACTION_SUCCESS': {
        code: 10003,
        message: 'Transaction completed successfully!'
    }
};

var constant = {
    status: status
};

module.exports = constant;
