var sorted = require('sorted');
var Token = require('./token');
var types = require('./types');

var Lexer = module.exports = function () {
    var self = {};
    this.expression = null;
    this.ops = sorted([], function (a, b) {
        return b.op.length - a.op.length;
    });
};

Lexer.prototype.set = function (exprString) {
    var expr = this.expression = new String(exprString);
    expr.pos = 0;
    expr.line = 0;
    expr.next = function (n) {
        n = n || 1;
        var s = expr.ahead(n);
        this.pos += n;
        this.line += (s.match(/\n/g) || '').length;
        return s;
    };
    
    expr.ahead = function (n) {
        n = n || 1;
        return expr.slice(this.pos, this.pos + n);
    };
    
    expr.end = function () {
        return expr.ahead().length == 0;
    };
    
    return this;
};

Lexer.prototype.where = function () {
    // Generate a happy source snippit for error detection
    var expr = this.expression;
    var near = '';
    var chr = 0;
    for (var i = expr.pos - 1; i >= 0; i--) {
        if (expr.charAt(i) == '\n') break;
        chr ++;
        // Look backward
        near = expr.charAt(i) + near;;
    }
    for (var i = expr.pos; i < expr.length; i++) {
        if (expr.charAt(i) == '\n') break;
        // Look forward
        near += expr.charAt(i);
    }
    return 'at line ' + expr.line + ', character ' + chr + ', in ' + near;
};

Lexer.prototype.next = function () {
    var expr = this.expression;
    
    // Ignore whitespace (!)
    while (expr.ahead().match(/\s/)) {
        expr.next();
    }
    
    // Single-line comments
    if (expr.ahead(2).match(/^#/)) {
        console.log('comment');
        while (expr.ahead() != '\n') {
            expr.next();
            if ( expr.end() ) { return new Token }
        }
        expr.next();
        return this.next();
    }
    
    // Line-continuation
    if (expr.ahead() == '\\') {
        expr.next();
        if (expr.ahead() == '\r') {
            expr.next();
        }
        if (expr.ahead() != '\n') {
            throw new(types.SyntaxError)(
                'Expected newline after line continuation'
            );
        }
        // Gobble up whitespace
        while (expr.ahead().match(/\s/)) {
            expr.next();
        }
    }
    
    if ( expr.end() ) { return new Token }
    
    var token = new Token;
    
    // Strings can start with r, ', ''', ", """
    if (expr.ahead(2).match(/^r?['"]/)) {
        token.type = 'string';
        token.start = expr.pos;
        var raw = false;
        if (expr.ahead() == 'r') {
            raw = true;
            expr.next();
        }
        
        if (expr.ahead(3).match(/(['"])\1\1/)) {
            var delim = expr.next(3);
        }
        else {
            var delim = expr.next();
        }
        
        while (true) {
            if (expr.ahead(delim.length) == delim) {
                // end of string
                expr.next(delim.length);
                break;
            }
            
            if ( expr.end() ) {
                throw new(types.SyntaxError)("Can't find string terminator");
            }
            
            if (expr.ahead() == '\\') {
                if (raw == true) {
                    token.value += expr.next(2);
                }
                else {
                    // interpolate escape sequence
                    var c = expr.next(2).charAt(1);
                    token.value += {
                        'a' : '\a',
                        'b' : '\b',
                        'e' : '\e',
                        'f' : '\f',
                        'n' : '\n',
                        'r' : '\r',
                        't' : '\t',
                        '\\' : '\\',
                    }[c] || '\\' + c;
                }
            }
            else {
                token.value += expr.next();
            }
        }
        
        token.value = new(types.String)(token.value);
        token.end = expr.pos;
        return token;
    }
    
    // Identifier
    if (expr.ahead().match(/[A-Za-z_]/)) {
        token.start = expr.pos;
        token.type = 'ident';
        while (expr.ahead().match(/\w/)) {
            token.value += expr.next();
        }
        token.end = expr.pos;
        return token;
    }
    
    // Numbers can be decimals, hexadecimals, or octals.
    // All bases get converted to base 10 here.
    var num_re = /^\d|^\.\d|^0[0-7]|^0x[A-Fa-f0-9]/;
    if (expr.ahead(3).match(num_re)) {
        token.type = 'number';
        token.start = expr.pos;
        
        var base = 10;
        var digits = /[0-9]/;
        if (expr.ahead(2).match(/^0x/)) {
            base = 16;
            expr.next(2);
            digits = /[A-Fa-f0-9]/;
        }
        else if (expr.ahead(2).match(/^0[0-7]/)) {
            base = 8;
            expr.next(1);
            digits = /[0-7]/;
        }
        
        var num = '';
        while (expr.ahead().match(digits)) {
            num += expr.next();
        }
        if (num == '') { num = '0' }
        
        if (base == 10 && expr.ahead() == '.') {
            num += expr.next();
            while (expr.ahead().match(digits)) {
                num += expr.next();
            }
            if (expr.ahead().match(/[eE]/)) {
                num += expr.next();
                while (expr.ahead().match(digits)) {
                    num += expr.next();
                }
            }
            token.value = new(types.Float)(parseFloat(num));
        }
        else if (expr.ahead().match(/[eE]/)) {
            num += expr.next();
            while (expr.ahead().match(digits)) {
                num += expr.next();
            }
            token.value = new(types.Float)(parseFloat(num, base));
        }
        else {
            token.value = new(types.Int)(parseInt(num, base));
        }
        
        if (expr.ahead() == 'L') {
            // Ignore any trailing "L"s for now
            expr.next();
        }
        
        token.end = expr.pos;
        return token;
    }
    
    // Operators
    for (var i = 0; i < this.ops.length; i++) {
        var op = this.ops.get(i);
        if (expr.ahead(op.op.length) == op.op) {
            token.type = 'op';
            token.lbp = op.lbp;
            token.nud = op.nud;
            token.led = op.led;
            token.start = expr.pos;
            token.value = expr.next(op.op.length);
            token.end = expr.pos;
            return token;
        }
    }
    
    throw new(types.SyntaxError)('invalid syntax');
};

Lexer.prototype.op = function (opSym, lbp, op) {
    if (!op) op = {};
    op.op = opSym;
    op.lbp = lbp;
    this.ops.push(op);
    return this;
};
