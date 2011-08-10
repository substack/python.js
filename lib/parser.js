var Lexer = require('./lexer');

var Parser = module.exports = function () {
    this.token = null;;
    var lexer = this.lexer = new Lexer;
    var expression = this.expression.bind(this);
    
    lexer.op('+', 10, {
        'nud' : function () { return expression(100).__pos__() },
        'led' : function (left) { return left.__add__( expression(10) ) }
    });
    
    lexer.op('-', 10, {
        'nud' : function () { return expression(100).__neg__() },
        'led' : function (left) { return left.__sub__( expression(10) ) }
    });
    
    lexer.op('*', 20, {
        'led' : function (left) { return left.__mul__( expression(20) ) }
    });
    
    lexer.op('/', 20, {
        'led' : function (left) { return left.__div__( expression(20) ) }
    });
    
    lexer.op('**', 30, {
        'led' : function () { return left.__pow__( expression(30 - 1) ) }
    });
};

Parser.prototype.eval = function (expr) {
    this.lexer.set(expr);
    this.token = this.lexer.next();
    return this.expression();
};
 
Parser.prototype.expression = function (rbp) {
    rbp = rbp || 0;
    // left, token = token.nud(), lex.next();
    var t = this.token;
    this.token = this.lexer.next();
    left = t.nud();
    while (rbp < this.token.lbp) {
        t = this.token;
        this.token = this.lexer.next();
        left = t.led(left);
    }
    return left;
};
