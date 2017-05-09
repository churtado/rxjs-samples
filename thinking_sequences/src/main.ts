import * as Rx from 'rxjs-es/Rx';
import { Observable } from 'rxjs-es/Observable';
import { Observer } from 'rxjs-es/Observer';

/*
var clickStream: Observable<MouseEvent> = Rx.Observable
    .fromEvent<MouseEvent>(document, 'click')
    .filter((click: MouseEvent, index:number) => {
        return click.clientX > window.innerWidth / 2;
        //return true;
    })
    .take(10);


clickStream.subscribe((click)=>{
    console.log(click.clientX, click.clientY);
});
*/

/*
var a: Observable<string> = Rx.Observable.interval(200).map((i:number)=>{
    return 'A'+i;
});

var b: Observable<string> = Rx.Observable.interval(100).map((i:number)=>{
    return 'B'+i;
});

var m: Observable<string> = Observable.merge(a,b);
m.subscribe((e)=>{
    console.log(e);
})*/

/* 
//basic operators
var logValue = (val) => { console.log(val); }

var src = Rx.Observable.range(1,5);
var upper = src.map((e)=>{
    return e*2;
});
var merged = src.merge(upper);

var filtered = merged.filter((e)=>{
    return e%2===0;
});

var summed = filtered.reduce((a,b)=>{
    return a + b;
})

summed.subscribe(logValue);
*/

var avg = Rx.Observable.range(0,5)
    .reduce((prev, cur)=>{
        return {
            sum : prev.sum + cur,
            count: prev.count + 1
        };
    }, {sum: 0, count: 0})
    .map((o)=>{
        return o.sum / o.count;
    });

var sub = avg.subscribe((x)=>{
    console.log(`Average is ${x}`);
})