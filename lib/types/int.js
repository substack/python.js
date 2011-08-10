var Type = require('./type');
var FloatType = require('./float');
var StringType = require('./string');

var Int = module.exports = function (n) {
    this.value = Number(n);
    this.__class__ = new Type('int');
};

Int.prototype.__add__ = function (left) {
    if (left instanceof Int) {
        return new Int(this.value + Number(left));
    }
    if (left instanceof FloatType) {
        return new FloatType(this.value + Number(left));
    }
    throw new TypeError(
        'unsupported operand types for +: ' + this.__class__.type
            + ' and ' + left.__class__.type
    );
};

Int.prototype.__mul__ = function (left) {
    return new FloatType(this.value * Number(left));
};

Int.prototype.__div__ = function (left) {
    return new FloatType(Math.floor(this.value / Number(left)));
};

Int.prototype.__neg__ = function (left) {
    return new FloatType(-this.value);
};

Int.prototype.__pos__ = function (left) {
    return new FloatType(+this.value);
};

Int.prototype.__pow__ = function (left) {
    if (left instanceof Int) {
        return new Int( Math.pow(this.value, Number(left)) );
    }
    if (left instanceof FloatType) {
        return new FloatType( Math.pow(this.value, Number(left)) );
    }
    throw new TypeError(
        'unsupported operand types for ** or pow(): '
            + this.__class__.type + ' and ' + left.__class__.type
    );
};

Int.prototype.__repr__ = function () {
    return new StringType(this.value);
};

Int.prototype.__str__ = function () {
    return new StringType(this.value);
};

Int.prototype.toString = function () {
    return this.value.toString();
};

Int.prototype.inspect = function () {
    return '<Int ' + this.toString() + '>';
};
