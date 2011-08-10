function TypeError(msg) {
    this.toString = function () {
        return new StringType("TypeError: " + msg);
    };
}

function SyntaxError(msg) {
    this.toString = function () {
        return new StringType("SyntaxError: " + msg);
    };
}

