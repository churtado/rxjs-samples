import * as Rx from 'rxjs-es/Rx';
import { Observable } from 'rxjs-es/Observable';
import * as $ from 'jquery';

interface GitHubUser {
    avatar_url:string;
    events_url:string;
    followers_url:string;
    following_url: string;
    gists_url: string;
    gravatar_id: string;
    html_url: string;
    id: number;
    login: string;
    organizations_url: string;
    received_events_url: string;
    repos_url: string;
    site_admin: boolean;
    starred_url: string;
    subscriptions_url: string;
    type: string;
    url: string;
}

var refreshButton: Element = document.querySelector('.refresh');
var closeButton1 = document.querySelector('.close1');
var closeButton2 = document.querySelector('.close2');
var closeButton3 = document.querySelector('.close3');

var refreshClickStream: Observable<any> = Rx.Observable.fromEvent(refreshButton, 'click');
var close1Clicks: Observable<any> = Rx.Observable.fromEvent(closeButton1, 'click');
var close2Clicks: Observable<any> = Rx.Observable.fromEvent(closeButton2, 'click');
var close3Clicks: Observable<any> = Rx.Observable.fromEvent(closeButton3, 'click');

var startupRequestStream = Rx.Observable.of('https://api.github.com/users');

var requestOnRefreshStream = refreshClickStream
    .map((ev: MouseEvent) => {
        var randomOffset = Math.floor(Math.random()*500);
        return 'https://api.github.com/users?since=' + randomOffset;
    });

// merging the first request (a manual one) with refresh requests coming from the button
var requestStream = startupRequestStream.merge(requestOnRefreshStream);

var responseStream: Observable<GitHubUser[]> = requestStream
    .flatMap((requestUrl: string) => {
        console.log("do network request"); // 3 subscribers to the stream, so 3 requests
        return Rx.Observable.fromPromise(Promise.resolve<GitHubUser[]>($.getJSON(requestUrl)));
    })
    // with the share method all 3 subscribers share one stream
    // console.log is now shown only once instead of 3 times
    // new subscribers get a replay of this same stream
    .share(); 

/*responseStream.subscribe( (response: GitHubUser[]) => {
    console.log(response[0]);
})*/

// refreshClickStream:  ------------f---------------------------->    
// requestStream:       r-----------r---------------------------->    
// responseStream:      -----R------------R---------------------->    
// closeClickStream:    ---------------------------x------------->    
// suggestion1Stream:   N----u------N-----u--------u------------->    
function getRandomUser(listUsers: GitHubUser[]){
    return listUsers[Math.floor(Math.random()*listUsers.length)];
}

function createSuggestionStream(responseStream: Observable<GitHubUser[]>, closeClickStream: Observable<any>) {
    return responseStream.map((listUser: GitHubUser[]) => {
        return listUser[Math.floor(Math.random()*listUser.length)];    
    })
    .startWith(null) // so the dom element isn't shown on startup
    /*
        so the dom element isn't show when refreshing
        it's effectively mapped to null in the flow until the data arrives
    */ 
    .merge(refreshClickStream.map((ev: GitHubUser[]) => null))
    .merge(
        // close stream gets the latest response from the sister stream
        // which is the response stream (look at the marble diagram, response and close streams)
        closeClickStream.withLatestFrom(responseStream, 
                                        (x: any, R: GitHubUser[]) => getRandomUser(R)
        )
    );
}

var suggestion1Stream:Observable<GitHubUser> = createSuggestionStream(responseStream, close1Clicks);
var suggestion2Stream:Observable<GitHubUser> = createSuggestionStream(responseStream, close2Clicks);
var suggestion3Stream:Observable<GitHubUser> = createSuggestionStream(responseStream, close3Clicks);

function renderSuggestion(suggestedUser: GitHubUser, selector:string): void {
    var suggestionEl: Element  = document.querySelector(selector);
    if (suggestedUser === null) {
        suggestionEl.setAttribute("style","visibility:hidden");
    }else{
        suggestionEl.setAttribute("style","visibility:visible");
        var usernameEl = suggestionEl.querySelector('.username');
        usernameEl.setAttribute('href', suggestedUser.html_url);
        usernameEl.textContent = suggestedUser.login;
        var imgEl = suggestionEl.querySelector('img');
        imgEl.src = "";
        imgEl.src = suggestedUser.avatar_url;
    }
    
}

suggestion1Stream.subscribe((user:GitHubUser) => {
    renderSuggestion(user, '.suggestion1');
});

suggestion2Stream.subscribe((user:GitHubUser) => {
    renderSuggestion(user, '.suggestion2');
});

suggestion3Stream.subscribe((user:GitHubUser) => {
    renderSuggestion(user, '.suggestion3');
});