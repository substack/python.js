var StringType = require('./string');

module.exports = function (msg) {
    return {
        toString : function () {
            return new StringType('SyntaxError: ' + msg);
        }
    }
};
