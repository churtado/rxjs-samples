import * as Rx from 'rxjs-es/Rx';
import { isNumeric } from 'rxjs-es/util/isNumeric';

console.clear();

var source = ['1', '1', 'foo', '2', '3', '5', 'bar', '8', '13'];

var result = 0;
for (var i = 0; i < source.length; i++) {
    var parsed = parseInt(source[i]);
    if (!isNaN(parsed)) {
        result += parsed;
    }
}

console.log(result); // should print the number `33` only

// Exercise 1

Rx.Observable.from(source).filter((x: any) => {
    return isNumeric(x)
}).reduce((x, y) => {
    return +x + +y;
}).subscribe((x) => console.log(x))
