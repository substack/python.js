var StringType = require('./string');

module.exports = function (msg) {
    return {
        toString : function () {
            return new StringType('TypeError: ' + msg);
        }
    }
};
