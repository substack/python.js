var Parser = require('./parser');

module.exports = function (expr) {
    return new Parser().eval(expr)
};
