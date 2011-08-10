var StringType = require('./string');

var SyntaxError = module.exports = function (msg) {
    this.message = msg;
};

SyntaxError.prototype.toString = function () {
    return new StringType('SyntaxError: ' + this.message);
};

SyntaxError.prototype.inspect = function () {
    return new StringType('<SyntaxError ' + JSON.stringify(this.message) + '>');
};
