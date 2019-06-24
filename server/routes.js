let middleware = require('./middleware');

module.exports = (app) => {
    app.use('/api/v1', require('./api/v1'));
};