python.js
=========

Years ago I wrote this for the browser while reading 
[this article about top-down parsers in
python](http://effbot.org/zone/simple-top-down-parsing.htm).

I got as far as making it into a nifty little calculator at least.

example
=======

````
> var py = require('py')
> py('2**4')
<Int 16>
> py('"do\\"om"')
<String "do\\\"om">
> py('1+2+3') 
<Int 6>
````

install
=======

With [npm](http://npmjs.org) do:

````
npm install py
````
