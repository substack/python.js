var Type = require('./type');

var Float = module.exports = function (n) {
    this.value = Number(n);
    this.__class__ = new Type('float');
};

Float.prototype.__add__ = function (left) {
    return new Float(this.value + Number(left));
};

Float.prototype.__mul__ = function (left) {
    return new Float(this.value * Number(left));
};

Float.prototype.__div__ = function (left) {
    return new Float(this.value / Number(left));
};

Float.prototype.__neg__ = function (left) {
    return new Float(-this.value);
};

Float.prototype.__pos__ = function (left) {
    return new Float(+this.value);
};

Float.prototype.__pow__ = function (left) {
    return new Float( Math.pow(this.value, Number(left)) );
};

Float.prototype.__repr__ = function () {
    return new StringType( this.toString() );
};

Float.prototype.__str__ = function () {
    return new StringType( this.toString() );
};

Float.prototype.toString = function () {
    var v = String(this.value);
    if ( !v.match(/\./) ) {
        v = v.replace(/([eE]\d+)?$/, '.0$1');
    }
    return v;
};

Float.prototype.inspect = function () {
    return '<Float ' + this.toString() + '>';
};
