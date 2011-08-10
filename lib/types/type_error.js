var StringType = require('./string');

var TypeError = module.exports = function (msg) {
    this.message = msg;
};

TypeError.prototype.toString = function () {
    return new StringType('TypeError: ' + this.message);
};

TypeError.prototype.inspect = function () {
    return new StringType('<TypeError ' + JSON.stringify(this.message) + '>');
};
