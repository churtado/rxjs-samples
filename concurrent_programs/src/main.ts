import * as Rx from 'rxjs-es/Rx';
import { Observable } from 'rxjs-es/Observable';
import { Observer } from 'rxjs-es/Observer';
import { Subject } from 'rxjs-es/Subject';
import { AsyncSubject } from 'rxjs-es/AsyncSubject';
import { Subscription } from 'rxjs-es/Subscription';

// simple example of an observable
/*
Rx.Observable
    .from([1,2,3,4,5,6,7,8])
    .filter( ( val, i ) => { return val % 2  === 0; } )
    .map( ( val ) => { 
        return val * 10; 
    })
    .subscribe( ( e ) => {
        console.log(e);
    });
*/

// external state example
/*
var evenTicks:number = 0;

function updateDistance( i:number ) {
    if ( i % 2 === 0 ){
        evenTicks += 1;
    }
    return evenTicks;
}

var ticksObservable = Rx.Observable
    .interval(1000)
    .map(updateDistance);

ticksObservable.subscribe(() => {
    console.log('Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});

ticksObservable.subscribe(function() {
    console.log('Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
});
*/

// storing state externally
/*
var evenTicks:number = 0;
var index:number = 0;

function updateDistance( i:number ) {
    if ( i % 2 === 0 ){
        evenTicks += 1;
        console.log('increased even ticks to '+evenTicks);
    }
    index++;
    console.log('increased index to '+index);
    return evenTicks;
}

var ticksObservable = Rx.Observable
    .interval(1000)
    .map(updateDistance);

ticksObservable.subscribe(() => {
    console.log(' Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});

ticksObservable.subscribe(function() {
    console.log(' Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
});
*/

// no external state
/*
function updateDistance(acc, i, j) {
    console.log(acc);
    console.log(i);
    console.log(j);
    if (i % 2 === 0) {
        acc += 1;
    }
    return acc;
}

var ticksObservable = Rx.Observable
    .interval(1000)
    .scan(updateDistance);

ticksObservable.subscribe( ( evenTicks ) => {
    console.log(' Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});

ticksObservable.subscribe( ( evenTicks ) => {
    console.log(' Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
});
*/

// subject example
/*
var subject:Subject<any> = new Rx.Subject();
var source:Observable<String> = Rx.Observable.interval(300)
    .map( (v: number) => { return `Interval message #${v}`})
    .take(5);

source.subscribe(subject);

var subscription:Subscription = subject.subscribe(
    function next(x) { console.log(`next: ${x}`)},
    function error(e) { console.log(`error: ${e}`)},
    function complete() { console.log(`complete`)}
);

subject.next('Our message #1');
subject.next('Our message #2');

setTimeout(() => {
    subject.complete();
}, 1000);
*/

// async subject
/*
var delayedRange: Observable<number> = Rx.Observable.range(0,5).delay(1000);
var subject: AsyncSubject<any> = new Rx.AsyncSubject();

delayedRange.subscribe(subject);

subject.subscribe(
    function next(x: any) { console.log(`Value: ${x}`)},
    function error(e: any) { console.log(`Error: ${e}`)},
    function complete() { console.log(`Complete`)}
)
*/

function paintStars(stars){
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    stars.forEach( (star) => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    })
}

function drawTriangle(x, y, width, color, direction) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.lineTo(x, direction === 'up' ? y - width : y + width);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x - width, y);
    ctx.fill();
}

function paintSpaceShip(x, y) {
    drawTriangle(x, y, 20, '#ff0000', 'up');
}

function renderScene(actors) {
    paintStars(actors.stars);
    paintSpaceShip(actors.spaceship.x, actors.spaceship.y);
}

var canvas:HTMLCanvasElement = document.createElement('canvas');
var ctx:CanvasRenderingContext2D = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var SPEED:number = 40;
var STAR_NUMBER:number = 250;
var StarStream: Observable<any> = Rx.Observable.range(1, STAR_NUMBER)
    .map(() => {
        return {
            x: Math.floor(Math.random() * canvas.width),
            y: Math.floor(Math.random() * canvas.height),
            size: Math.random() * 3 + 1
        };
    })
    .toArray()
    .flatMap( (starArray) => {
        return Rx.Observable.interval(SPEED).map( () => {
            starArray.forEach( (star) => {
                if (star.y >= canvas.height) {
                    star.y = 0 // reset star to top of screen
                }
                star.y += 3;
            });
            return starArray;
        });
    });


var HERO_Y = canvas.height - 30;
var mouseMove = Rx.Observable.fromEvent<MouseEvent>(canvas, 'mousemove');
var SpaceShip = mouseMove
    .map( (event) => {
        return {
            x: event.clientX,
            y: HERO_Y
        };
    })
    .startWith({
        x: canvas.width / 2,
        y: HERO_Y
    });

var ENEMY_FREQ = 1500;
var Enemies:Observable<any> = Rx.Observable.interval(ENEMY_FREQ)
    .scan( (enemyArray: any[]) => {
        var enemy = {
            x: Math.floor(Math.random()) * canvas.width,
            y: -30
        };

        enemyArray.push(enemy);
        return enemyArray;
    }, []);

var Game = Rx.Observable
    .combineLatest(
        StarStream, SpaceShip,
        (stars, spaceship) => {
            return { stars: stars, spaceship: spaceship };
    });

Game.subscribe(renderScene)
