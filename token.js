var Token = module.exports = function () {
    this.value = '';
    this.type = ''; // string, ident, number, op
    this.start = -1;
    this.end = -1;
    this.lbp = 0; // end token by default
};

Token.prototype.toString = function () {
    return JSON.stringify({
        type : this.type,
        value : this.value
    });
};

Token.prototype.nud = function () {
    // For literals
    return this.value;
};
