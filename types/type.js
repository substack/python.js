var Type = module.exports = function (t) {
    this.type = String(t);
};

Type.prototype.__str__ = function () {
    return new StringType(this.type);
};

Type.prototype.__repr__ = function () {
    return new StringType(this.type);
};

Type.prototype.toString = function () {
    return this.type;
};

var StringType = require('./string');

