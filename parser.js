// http://effbot.org/zone/simple-top-down-parsing.htm

function Parser() {
    var lex = new Lexer;
    
    lex.add_op({
        "op" : "+",
        "lbp" : 10,
        "nud" : function () {
            return expression(100).__pos__();
        },
        "led" : function (left) {
            return left.__add__( expression(10) );
        },
    });
    
    lex.add_op({
        "op" : "-",
        "lbp" : 10,
        "nud" : function () {
            return expression(100).__neg__();
        },
        "led" : function (left) {
            return left.__sub__( expression(10) );
        },
    });
    
    lex.add_op({
        "op" : "*",
        "lbp" : 20,
        "led" : function (left) {
            return left.__mul__( expression(20) );
        },
    });
    
    lex.add_op({
        "op" : "/",
        "lbp" : 20,
        "led" : function (left) {
            return left.__div__( expression(20) );
        },
    });
    
    lex.add_op({
        "op" : "**",
        "lbp" : 30,
        "led" : function () {
            return left.__pow__( expression(30 - 1) );
        },
    });
    
    var token;
    this.eval = function (expr) {
        lex.set(expr);
        //try {
            token = lex.next();
            return expression();
        /*
        }
        catch (err) {
            throw err + " " + lex.where();
        }
        //*/
    }
    
    function expression(rbp) {
        rbp = rbp || 0;
        // left, token = token.nud(), lex.next();
        var t = token;
        token = lex.next();
        left = t.nud();
        while (rbp < token.lbp) {
            t = token;
            token = lex.next();
            left = t.led(left);
        }
        return left;
    }
    
    function Token() {
        this.toString = function () {
            return ("{" + [
                "type: '" + this.type + "'",
                "value: '" + this.value + "'",
            ].join(", ") + "}");
        }
        this.value = "";
        this.type = ""; // string, ident, number, op
        this.start = -1;
        this.end = -1;
        this.lbp = 0; // end token by default
        
        this.nud = function () {
            // For literals
            return this.value;
        };
    }

    function Lexer() {
        var expr;
        this.set = function (expr_string) {
            expr = new String(expr_string);
            expr.pos = 0;
            expr.line = 0;
            expr.next = function (n) {
                n = n || 1;
                var s = expr.ahead(n);
                this.pos += n;
                this.line += (s.match(/\n/g) || "").length;
                return s;
            };
            
            expr.ahead = function (n) {
                n = n || 1;
                return expr.slice(this.pos, this.pos + n);
            };
            
            expr.end = function () {
                return expr.ahead().length == 0;
            };
        };
        
        this.where = function () {
            // Generate a happy source snippit for error detection
            var near = "";
            var chr = 0;
            for (var i = expr.pos - 1; i >= 0; i--) {
                if (expr.charAt(i) == "\n") { break }
                chr ++;
                // Look backward
                near = expr.charAt(i) + near;;
            }
            for (var i = expr.pos; i < expr.length; i++) {
                if (expr.charAt(i) == "\n") { break }
                // Look forward
                near += expr.charAt(i);
            }
            return (
                "at line " + expr.line + ", character " + chr + ", in " + near
            );
        }
        
        this.next = function () {
            // Ignore whitespace (!)
            while (expr.ahead().match(/\s/)) {
                expr.next();
            }
            
            // Single-line comments
            if (expr.ahead(2).match(/^#/)) {
                console.log("comment");
                while (expr.ahead() != "\n") {
                    expr.next();
                    if ( expr.end() ) { return new Token }
                }
                expr.next();
                return this.next();
            }
            
            // Line-continuation
            if (expr.ahead() == "\\") {
                expr.next();
                if (expr.ahead() == "\r") {
                    expr.next();
                }
                if (expr.ahead() != "\n") {
                    throw new SyntaxError(
                        "Expected newline after line continuation"
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
                token.type = "string";
                token.start = expr.pos;
                var raw = false;
                if (expr.ahead() == "r") {
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
                        throw new SyntaxError("Can't find string terminator");
                    }
                    
                    if (expr.ahead() == "\\") {
                        if (raw == true) {
                            token.value += expr.next(2);
                        }
                        else {
                            // interpolate escape sequence
                            var c = expr.next(2).charAt(1);
                            token.value += {
                                "a" : "\a",
                                "b" : "\b",
                                "e" : "\e",
                                "f" : "\f",
                                "n" : "\n",
                                "r" : "\r",
                                "t" : "\t",
                                "\\" : "\\",
                            }[c] || "\\" + c;
                        }
                    }
                    else {
                        token.value += expr.next();
                    }
                }
                
                token.value = new StringType(token.value);
                token.end = expr.pos;
                return token;
            }
            
            // Identifier
            if (expr.ahead().match(/[A-Za-z_]/)) {
                token.start = expr.pos;
                token.type = "ident";
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
                token.type = "number";
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
                
                var num = "";
                while (expr.ahead().match(digits)) {
                    num += expr.next();
                }
                if (num == "") { num = "0" }
                
                if (base == 10 && expr.ahead() == ".") {
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
                    token.value = new FloatType( parseFloat(num) );
                }
                else if (expr.ahead().match(/[eE]/)) {
                    num += expr.next();
                    while (expr.ahead().match(digits)) {
                        num += expr.next();
                    }
                    token.value = new FloatType( parseFloat(num, base) );
                }
                else {
                    token.value = new IntType( parseInt(num, base) );
                }
                
                if (expr.ahead() == "L") {
                    // Ignore any trailing "L"s for now
                    expr.next();
                }
                
                token.end = expr.pos;
                return token;
            }
            
            // Operators
            for (var i = 0; i < this.ops.length; i++) {
                if (expr.ahead(this.ops[i].op.length) == this.ops[i].op) {
                    token.type = "op";
                    token.lbp = this.ops[i].lbp;
                    token.nud = this.ops[i].nud;
                    token.led = this.ops[i].led;
                    token.start = expr.pos;
                    token.value = expr.next(this.ops[i].op.length);
                    token.end = expr.pos;
                    return token;
                }
            }
            
            throw new SyntaxError("invalid syntax");
        };
        
        this.ops = [];
        this.add_op = function (op) {
            this.ops.push(op);
            // Longer ops first so that they don't get undercut by subsets
            this.ops = this.ops.sort(
                function (a, b) { return b.op.length - a.op.length }
            );
        };
    }
}

