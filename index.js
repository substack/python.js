var Parser = require('./lib/parser');

module.exports = function (expr) {
    return new Parser().eval(expr)
};
