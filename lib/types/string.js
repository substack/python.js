var Type = require('./type');

var StringType = module.exports = function (s) {
    this.value = String(s);
    this.__class__ = new Type('str');
};

StringType.prototype.__add__ = function (left) {
    if (! left instanceof StringType ) {
        throw new TypeError('Cannot concatenate ');
    }
    return new StringType( this.value + String(left) );
};

StringType.prototype.__repr__ = function () {
    var repr = this.value;
    repr = repr.replace(/\\/g, '\\\\');
    repr = repr.replace(/\a/g, '\\a');
    repr = repr.replace(/[\b]/g, '\\b');
    repr = repr.replace(/\e/g, '\\e');
    repr = repr.replace(/\f/g, '\\f');
    repr = repr.replace(/\n/g, '\\n');
    repr = repr.replace(/\r/g, '\\r');
    repr = repr.replace(/\t/g, '\\t');
    repr = repr.replace(/'/, "\\'");
    return new StringType('"' + repr + '"').__str__();
};

StringType.prototype.__str__ = function () {
    return this.value;
};

StringType.prototype.toString = function () {
    return this.value;
};

StringType.prototype.inspect = function () {
    return '<String ' + JSON.stringify(this.toString()) + '>';
};
