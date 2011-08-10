function TypeType(t) {
    this.type = String(t);
    
    this.__str__ = function () {
        return new StringType(this.type);
    }
    
    this.__repr__ = function () {
        return new StringType(this.type);
    }
    
    this.toString() == function () {
        return this.type;
    }
}

function FloatType(n) {
    this.value = Number(n);
    
    this.__class__ = new TypeType("float");
    
    this.__add__ = function (left) {
        return new FloatType(this.value + Number(left));
    };
    
    this.__mul__ = function (left) {
        return new FloatType(this.value * Number(left));
    };
    
    this.__neg__ = function (left) {
        return new FloatType(-this.value);
    };
    
    this.__pos__ = function (left) {
        return new FloatType(+this.value);
    };
    
    this.__pow__ = function (left) {
        return new FloatType( Math.pow(this.value, Number(left)) );
    };
    
    this.__repr__ = function () {
        return new StringType( this.toString() );
    };
    
    this.__str__ = function () {
        return new StringType( this.toString() );
    };
    
    this.toString = function () {
        var v = String(this.value);
        if ( !v.match(/\./) ) {
            v = v.replace(/([eE]\d+)?$/, ".0$1");
        }
        return v;
    };
}

function IntType(n) {
    this.value = Number(n);
    
    this.__class__ = new TypeType("int");
    
    this.__add__ = function (left) {
        if (left instanceof IntType) {
            return new IntType(this.value + Number(left));
        }
        if (left instanceof FloatType) {
            return new FloatType(this.value + Number(left));
        }
        throw new TypeError(
            "unsupported operand types for +: " + this.__class__.type
                + " and " + left.__class__.type
        );
    };
    
    this.__mul__ = function (left) {
        return new FloatType(this.value * Number(left));
    };
    
    this.__neg__ = function (left) {
        return new FloatType(-this.value);
    };
    
    this.__pos__ = function (left) {
        return new FloatType(+this.value);
    };
    
    this.__pow__ = function (left) {
        if (left instanceof IntType) {
            return new IntType( Math.pow(this.value, Number(left)) );
        }
        if (left instanceof FloatType) {
            return new FloatType( Math.pow(this.value, Number(left)) );
        }
        throw new TypeError(
            "unsupported operand types for ** or pow(): "
                + this.__class__.type + " and " + left.__class__.type
        );
    };
    
    this.__repr__ = function () {
        return new StringType(this.value);
    };
    
    this.__str__ = function () {
        return new StringType(this.value);
    };
    
    this.toString = function () {
        return this.value;
    };
}

function StringType(s) {
    this.value = String(s);
    
    this.__class__ = new TypeType("str");
    
    this.__add__ = function (left) {
        if (! left instanceof StringType ) {
            throw new TypeError("Cannot concatenate ");
        }
        return new StringType( this.value + String(left) );
    };
    
    this.__repr__ = function () {
        var repr = this.value;
        repr = repr.replace(/\\/g, "\\\\");
        repr = repr.replace(/\a/g, "\\a");
        repr = repr.replace(/[\b]/g, "\\b");
        repr = repr.replace(/\e/g, "\\e");
        repr = repr.replace(/\f/g, "\\f");
        repr = repr.replace(/\n/g, "\\n");
        repr = repr.replace(/\r/g, "\\r");
        repr = repr.replace(/\t/g, "\\t");
        repr = repr.replace(/'/, "\\'");
        return (new StringType('"' + repr + '"')).__str__();
    };
    
    this.__str__ = function () {
        return this.value;
    };
    
    this.toString = function () {
        return this.value;
    };
}

