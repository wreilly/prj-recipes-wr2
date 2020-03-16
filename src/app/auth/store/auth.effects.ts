import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect, createEffect } from '@ngrx/effects';
import {catchError, switchMap, map, tap} from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User } from '../user.model';

import { environment } from '../../../environments/environment';
import * as AuthActions from './auth.actions';
import {AuthService} from '../auth.service'; // Hah! now we do, for logging out // not used seems


/* TABLE OF CONTENTS
I.
export interface AuthResponseData { ... }

II.
Helper Functions
const handleAuthentication = () => {}

const handleError = () => {}

III.
@Injectable()
export class AuthEffects { ...

1.
@Effect()
myAuthLoginStartEffect

2.
@Effect({dispatch: false})
myAuthSuccessRedirectEffect

3.
@Effect()
myAuthSignUpStartEffect

4.
@Effect()
myAuthAutoLoginEffect

5.
@Effect({dispatch: false})
myAuthLogoutEffect

// N.B. constructor() on BOTTOM, fwiw
 */

// I. REFACTORED HERE from AuthService. Cheers.
export interface AuthResponseData {
    kind: string; // YER WRONG >> << No longer used by Firebase (or us). Was 'identitytoolkit#VerifyPasswordResponse', fwiw.
    // Hmm, I'm WRONG about above. We DO see this *come back* (we did not *send it*): e.g. kind: "identitytoolkit#VerifyPasswordResponse",
    idToken: string; // big long token...
    email: string;
    refreshToken: string; // another big long token...
    expiresIn: string; // a number we handle/receive as a string, simply
    localId: string; // Firebase "User UID" e.g. 'WFVtoZD1FogRdnkQ3qP6fhNzdxl2'
    registered?: boolean; // '?' because: comes back on Log In, but not Sign Up
}
/*   ***************************************************
       re: AuthResponseData
       LOG IN:
     ***************************************************
Request URL: https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28
Request Method: POST
Status Code: 200

Query String Parameters
key: AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28

Request Payload
{email: "wednesday@week.com", password: "asdf99", returnSecureToken: true}
email: "wednesday@week.com"
password: "asdf99"
returnSecureToken: true

RESPONSE
{kind: "identitytoolkit#VerifyPasswordResponse", localId: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1",…}
displayName: ""
email: "wednesday@week.com"
expiresIn: "3600"
idToken: "eyJhbGciOiJSUzI1NiIsImtpZC ... vD1W_WA"
kind: "identitytoolkit#VerifyPasswordResponse"
localId: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1"
refreshToken: "AEu4IL0 ... arwsI"
registered: true
  ***************************************************
 */

/*
II. Helper Functions
(akin to what we had in AuthService)
 */
const handleAuthentication = (
    /*
    Invoked, upon success, by both LOG_IN_START and SIGN_UP_START ...
     */
    email: string,
    localId: string,
    idToken: string,
    expiresIn: number,
) => {
    const expiresInCalculated: Date = new Date( new Date().getTime() +  expiresIn );

    // Don't forget LocalStorage !
    // Need to new up a User for that
    /* User Model:
    public email;
    public id;
    private readonly _token;
    private readonly _tokenExpirationDate;
     */
    const myUserForLocalStorage = new User(
        email,
        localId,
        idToken,
        expiresInCalculated,
    );
    localStorage.setItem(
        'myUserData',
        JSON.stringify(myUserForLocalStorage),
    );

    return new AuthActions.AuthenticateSuccessActionClass( // << LOG_IN "SUCCESS"
        { // << Send this "payload," NOT a User object. okay.
            id: localId,
            email: email,
            _token: idToken,
            _tokenExpirationDate: expiresInCalculated,
        }
    );

};

const handleError = (errorResponseWeGot) => {
    let errorMessageToReturnBack = 'Something who knows what went wrong';
    console.error('errorResponseWeGot ', errorResponseWeGot); // yes whole HttpErrorResponse {}

    // Test if we have what we expect: a 'message' down under sub-sub properties:
    if (!errorResponseWeGot.error || !errorResponseWeGot.error.error) {
        /* NO. No "throwing" of an error here in the Effect. Breaks it.
               return throwError(JSON.stringify(errorResponseWeGot));
        */
        return of(new AuthActions.LogInFailEffectActionClass(errorMessageToReturnBack));
        // << here it is just dummy message
    }

    // O.K., we do have an error with these sub-sub-sub properties:
    switch (errorResponseWeGot.error.error.message) {
        case 'EMAIL_EXISTS': {
            errorMessageToReturnBack = 'That e-mail address is already taken';
            break;
        }
        case 'EMAIL_NOT_FOUND': {
            errorMessageToReturnBack = 'That e-mail address is not found';
            break;
        }
        case 'INVALID_PASSWORD': {
            errorMessageToReturnBack = 'Incorrect password. Sorry!';
            break;
        }
    }

    return of(
        /*
        Unlike map(), catchError() does NOT return an Observable... so,
        we create an Observable ourselves using of(), to return an (Effect) Action
        to be dispatched (by ngrx/Effects automatically)
         */
        new AuthActions.LogInFailEffectActionClass(errorMessageToReturnBack) // (errorResponseWeGot.message)
    ); // We now have our Fail Effect in place...

};


@Injectable() // III. << OK later, we DO. << Hmm. Max does NOT have
export class AuthEffects { // N.B. constructor() on BOTTOM, fwiw

    @Effect() // 1. *****************************************************
    myAuthLoginStartEffect = this.myEffectActions$.pipe( // << OUTER .pipe(). NO catchERROR here!
        // "don't .subscribe(). ngrx will subscribe for you. just call .pipe()
        ofType(AuthActions.LOG_IN_START_EFFECT_ACTION),
        // Above is a filter. ONLY this type of actions will proceed into this effect
        // btw, yes comma-separated list of multiple actions is possible

        switchMap(
        // switchMap() = "create a new observable, from a previous observable's data"
            (authDataWeGot: AuthActions.LogInStartEffectActionClass) => {
                /* authDataWeGot = essentially:
                     myPayload { email, password }
                 */
                return this.myHttpClient
                    .post<AuthResponseData>(
                        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKeyWR__,
                        /* nameRankSerialNumber // << nope.
                        That object variable NRSN I created was over in Service. Here we'll just use an object body simply as follows: */
                        {
                            email: authDataWeGot.myPayload.email,
                            password: authDataWeGot.myPayload.password,
                            returnSecureToken: true,
                        }
                    ).pipe( // INNER .pipe() Lect. 366 ~07:17
                        tap( // Lect. 374 ~03:34 Same for LoginStart and for SignUpStart
                            (authResponseDataWeGot) => {
/* Used for TESTING! Just 3.6 seconds. PASS :o)
                                this.myAuthService.setLogOutTimer(+authResponseDataWeGot.expiresIn); // * 1000);
*/
                                this.myAuthService.setLogOutTimer(+authResponseDataWeGot.expiresIn * 1000);
                                // 1. don't forget '+'; 2. milliseconds requires * 1000
                            }
                        ),
                        map( // "map() automatically wraps what is returned into an Observable..."
                            // and so, no need herein to do an 'of()' to create an Observable. cheers.

                            // We moved the catchError() BELOW this here map(). OK.

                            (responseDataWeGot: AuthResponseData) => {
                                /* e.g. AuthResponseData:
                            wholeThingWeGot.email,
                            wholeThingWeGot.localId,
                            wholeThingWeGot.idToken,
                            +wholeThingWeGot.expiresIn, // << N.B. we '+' it, coerce string to number
                                 */

                                /* Lect. 371 ...
                                UPDATE
                                Refactor logic below from here, up to handleAuthentication()

                                N.B. Don't forget to 'return' it!

                                Also: Be careful about ORDER of parameters in the signature!
                                 */
                                return handleAuthentication(
                                    responseDataWeGot.email,
                                    responseDataWeGot.localId,
                                    responseDataWeGot.idToken,
                                    +responseDataWeGot.expiresIn,
                                );
// N.B. the '+' to numberize that +responseDataWeGot.expiresIn

                                /*
                                expiresIn logic ~copied over from AuthService.handleAuthentication()
                                 */
/* Refactored to handleAuthentication()
                                const expiresInCalculated: Date = new Date( new Date().getTime() +  +responseDataWeGot.expiresIn );
*/


/* Do not use of() to create an Observable to return.
We are already inside map(), which creates an Observable to return. (Don't want doubly-wrapped Observable.) Cheers.

                                return of( // << Lect. 369 ~03:13
*/

                                // << Having *successfully* gotten here, positive response from Firebase,
                                // we now want to cause the LOG_IN_ACTION to get called/dispatched.
                                // Recall, LOG_IN_ACTION could be (re-)named Login *Success* action

                                // btw, ngrx/effects automatically dispatches for you. ( ? )
                                // That is, just "new" it up; Effects will dispatch it.
                                // But, don't forget to 'return' it!

/* Refactored to handleAuthentication()
                                return new AuthActions.LogInActionClass({
                                        id: responseDataWeGot.localId,
                                        email: responseDataWeGot.email,
                                        _token: responseDataWeGot.idToken,
                                        _tokenExpirationDate: expiresInCalculated,
                                    }
                                );
*/

                                /* removing of()
                                ); // /of()  << N.B. Max code apparently removes the of() << YEP Lect. 369 ~03:13
*/
                            }
                        ), // /map()
                        // N.B. catch error HERE on INNER, *NOT* on OUTER .pipe()
                        // In fact you MUST return a *NON*-Error Observable
                        catchError(
                            (errorResponseWeGot: any) => {
                                // We REFACTORED from AuthService.handleError()
                                // to here in AuthEffects:

                                console.log('CATCHERROR errorResponseWeGot ', errorResponseWeGot);
                                /*
                                error: {error: {…}}
headers: HttpHeaders {normalizedNames: Map(0), lazyUpdate: null, lazyInit: ƒ}
message: "Http failure response for https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?
key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28: 400 OK"
name: "HttpErrorResponse"
ok: false
status: 400
statusText: "OK"
url: "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28"
__proto__: HttpResponseBase
                                 */

                                // REFACTORED from AuthService.handleError()

                                /*
                                UPDATE - now refactoring to helper function handleError here in AuthEffects
                                 */
                                return handleError(errorResponseWeGot);

                                // ********************************************
                                // ****  COMMENT OUT **************************
/*
                                let errorMessageToReturnBack = 'Something who knows what went wrong';
                                console.error('errorResponseWeGot ', errorResponseWeGot); // yes whole HttpErrorResponse {}

                                // Test if we have what we expect: a 'message' down under sub-sub properties:
                                if (!errorResponseWeGot.error || !errorResponseWeGot.error.error) {
/!* NO. No "throwing" of an error here in the Effect. Breaks it.
                                    return throwError(JSON.stringify(errorResponseWeGot));
*!/
                                    return of(new AuthActions.LogInFailEffectActionClass(errorMessageToReturnBack));
                                    // << here it is just dummy message
                                }

                                // O.K., we do have an error with these sub-sub-sub properties:
                                switch (errorResponseWeGot.error.error.message) {
                                    case 'EMAIL_EXISTS': {
                                        errorMessageToReturnBack = 'That e-mail address is already taken';
                                        break;
                                    }
                                    case 'EMAIL_NOT_FOUND': {
                                        errorMessageToReturnBack = 'That e-mail address is not found';
                                        break;
                                    }
                                    case 'INVALID_PASSWORD': {
                                        errorMessageToReturnBack = 'Incorrect password. Sorry!';
                                        break;
                                    }
                                }



                                return of(
                                    /!*
                                    Unlike map(), catchError() does NOT return an Observable... so,
                                    we create an Observable ourselves using of(), to return an (Effect) Action
                                    to be dispatched (by ngrx/Effects automatically)
                                     *!/
                                    new AuthActions.LogInFailEffectActionClass(errorMessageToReturnBack) // (errorResponseWeGot.message)
                                ); // We now have our Fail Effect in place... TODONE empty good enough for moment
                                /!*
                                Now while our "catchError()" is NOT returning/catching any error, you must or ought to ? put it
                                AFTER the map(). Cheers. Done.

                                Update: Hmm, now our catchError() IS returning etc., yet we still leave it
                                on bottom, after map(). Okay? Guess so. Max code does, I now see. Cheers.
                                 *!/
*/
                                // ***   /COMMENT OUT  ************************
                                // ********************************************

                            } // /(errorResponseWeGot: any) => {...
                        ), // /catchError()
                    );
            }), // /switchMap()
        // time to RETURN a new action... ?
        /* Hmm, until we did the "Inner .pipe()" above, you could have done
        the "catchError()" business right here, on Outer .pipe(). But DON'T.
        Do the catchError() on that Inner .pipe(). Thank you.
        (And, return ONLY NON-ERROR new Observable! Do NOT actually "throw" any Error. No.)
        */
    ); // /.pipe() OUTER  /myAuthLoginStartEffect
    // << Make sure to NOT catchError on this Outer .pipe() !!! Do so on INNER .pipe()


    @Effect({ dispatch: false }) // 2. *****************************************************
        // << This Effect does NOT dispatch a new action. Nope.
    myAuthSuccessRedirectEffect = this.myEffectActions$.pipe(
        ofType(
            AuthActions.AUTHENTICATE_SUCCESS_ACTION,
            AuthActions.LOG_OUT_ACTION,
        ), // << "Log In Success" action, could be named...
        tap(
            (authDataWeGot: AuthResponseData) => {
                console.log('authDataWeGot 888', authDataWeGot);
                /*
                myPayload:
email: "wednesday@week.com"
id: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1"
_token: "eyJhbGciOiJSUzI1Ni...aTjw"
_tokenExpirationDate: Mon Mar 09 2020 07:18:52 GMT-0400 (Eastern Daylight Time) {}
                 */
                // this.myRouter.navigate(['/recipes']); // Max to ['/'].
                this.myRouter.navigate(['/']); // Now that using this "redirect" action for multiple
                // "You could pass in as a payload the redirect URL you wanted..."
            }
        ) // /tap()
        /*
        N.B. ({dispatch: false}) >> This particular Effect does NOT result in returning a new Observable, which in turn holds
        a new Effect, which would hold an (Effect) Action that should be dispatched...
        Most Effects do. This Effect does not. Lect. 369 ~01:53
         */
    ); // /.pipe() "OUTER" (only) /myAuthSuccessRedirectEffect


    @Effect() // 3. *****************************************************
    myAuthSignUpStartEffect = this.myEffectActions$.pipe(
        ofType(AuthActions.SIGN_UP_START_EFFECT_ACTION),
        switchMap( // returns a new Observable...
            // Next line: AuthComponent dispatches this action, passing email, password as payload:
            (authDataWeGot: AuthActions.SignUpStartEffectActionClass) => {
                console.log('authDataWeGot SIGNUP EFFECT', authDataWeGot);
                return this.myHttpClient.post<AuthResponseData>(
                    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKeyWR__,
                    {
                        email: authDataWeGot.myPayload.email,
                        password: authDataWeGot.myPayload.password,
                        returnSecureToken: true,
                    }
                ).pipe(
                    tap( // Lect. 374 ~03:34 Same for LoginStart and for SignUpStart
                        (authResponseDataWeGot: AuthResponseData) => {
                            this.myAuthService.setLogOutTimer(+authResponseDataWeGot.expiresIn * 1000);
                            // 1. don't forget '+'; 2. milliseconds requires * 1000
                        }
                    ),
                    map( // returns an Observable.
                    (authResponseDataWeGotFromFirebase: AuthResponseData) => {
                        console.log('authResponseDataWeGotFromFirebase SIGNUP ', authResponseDataWeGotFromFirebase);
                        /* presumably something like this:
                        kind: "identitytoolkit#VerifyPasswordResponse",
                        localId: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1",
displayName: ""
email: "wednesday@week.com"
expiresIn: "3600"
idToken: "eyJhbGciOiJSUzI1NiIsImtpZC ... vD1W_WA"
kind: "identitytoolkit#VerifyPasswordResponse"
localId: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1"
refreshToken: "AEu4IL0 ... arwsI"
                         */
                        /* ? Q. Another dispatch? SignUp (Success) ? LogIn (Success) ?
                        A. No. Don't "dispatch". NGRX/Effects does it for you (yeesh).
                        Just new up an Action. (and, 'return' it)
                        Recall, payload for that class (LogInActionClass) is:
        email: string,
        id: string, // sheesh. Max has id: on User model, but userId: on his Login Action. Sheesh.
        _token: string, // sheesh. Max uses token
        _tokenExpirationDate: Date,
                         */

                        /*
                        UPDATE we now Refactor from here up to handleAuthentication()

                        N.B. Don't forget to 'return' it!
                         */
                        return handleAuthentication(
                            authResponseDataWeGotFromFirebase.email,
                            authResponseDataWeGotFromFirebase.localId,
                            authResponseDataWeGotFromFirebase.idToken,
                            +authResponseDataWeGotFromFirebase.expiresIn, // << don't forget '+'
                        );

/* Refactored to handleAuthentication()
                        const newExpirationDate = new Date(new Date().getTime() + (+authResponseDataWeGotFromFirebase.expiresIn * 1000));
                        // << don't forget '+'

                        return new AuthActions.LogInActionClass(
                            {
                                email: authResponseDataWeGotFromFirebase.email,
                                id: authResponseDataWeGotFromFirebase.localId,
                                _token: authResponseDataWeGotFromFirebase.idToken,
                                _tokenExpirationDate: newExpirationDate,
                            }
                        );
*/
                    }), // /map()
                    catchError(
                        (errWeGot) => {

                            return handleError(errWeGot);

                            // ***   COMMENT OUT  ************************
                            // ********************************************

/*
                            const defaultErrorMessage = 'Something default went wrong on SIGNUP';

                            // << need to wrap in an Observable. catchError() does not do so. cheers.
/!* TODOnope DOING THIS WRONG

                            return of(
                                if (!defaultErrorMessage.error || !defaultErrorMessage.error.error ) {
                                    // If no special error message available (from Firebase signup), then default:
                                    return defaultErrorMessage;
                                }
                            );
*!/
                            return of(); // TODOnope empty for the non
*/

                            // ***   /COMMENT OUT  ************************
                            // ********************************************

                        }
                    ) // /catchError()
                ); // /.pipe() INNER
            }
        ) // /switchMap
    ); // /.pipe() OUTER myAuthSignUpStartEffect


    // 4.  *************************************************************
    @Effect()
    myAuthAutoLoginEffect = this.myEffectActions$.pipe(
        ofType(AuthActions.AUTO_LOG_IN_ACTION),
        map( // returns an Observable - good
            () => {
                if (localStorage.getItem('myUserData') === null) {
                    console.log('No myUserData in localStorage!');
                    // if no valid token on that User in localStorage:
                    return { type: 'DUMMY_IDENTIFIER No myUserData'}; // Lect. 373 ~07:24
                }

                if (localStorage.getItem('myUserData') !== null) {
                    const heyWeAreLoggedInUserDataString: string = localStorage.getItem('myUserData');
                    console.log('heyWeAreLoggedInUserDataString ', heyWeAreLoggedInUserDataString);
                    /*
                    email: "necessary@cat.edu"
            id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
            _token: "eyJhbG...CNywVQ"
            _tokenExpirationDate: "2020-01-05T14:39:34.039Z"
                     */
                    const loggedInUserObjectLiteral: {
                        /* N.B. Object literal, obtained via JSON.parse()
                        The "date" here is still just a string.
                        (We make to a Date further below, when we new User()
                        a real User Object, vs. this sort of interim Object literal. cheers.
                        */

                        // Let's explicitly show the Type we get,
                        // once we "JSON.parse()" the string that we got back out of localStorage:
                        email: string;
                        id: string;
                        _token: string;
                        _tokenExpirationDate: string; // << all strings, not a Date
                    } = JSON.parse(heyWeAreLoggedInUserDataString);

                    /* Nope. Almost. Good idea. But,
                          instead of going into that "handler"
                          (which basically just does new User()),
                          we'll just do our own new User() right here (below)

                                this.handleAuthentication(
                                    loggedInUserObjectLiteral.email,
                                    loggedInUserObjectLiteral.id,
                                    loggedInUserObjectLiteral._token,
                                    new Date(loggedInUserObjectLiteral._tokenExpirationDate)
                                );
                    */

                    const thisHereAutoLogInUser = new User(
                        loggedInUserObjectLiteral.email,
                        loggedInUserObjectLiteral.id,
                        loggedInUserObjectLiteral._token,
                        new Date(loggedInUserObjectLiteral._tokenExpirationDate)
                    );

                    console.log('thisHereAutoLogInUser ', thisHereAutoLogInUser);
                    /*
                    Good. I have test situation here where:
                     There IS localStorage user,
                     but,
                     The token is EXPIRED (12/Jan/20 - today is 13/Jan/20).
                    Bueno.
                    We are Not Logged In (correct-a-mundo)
                     */

                    if (thisHereAutoLogInUser.token) {
                        /*
                        Now that we've got a real User object, we get the .token GETTER. Cheers.
                        And, we (below) use the result from that .token GETTER,
                        to simply determine whether the token that the localStorage
                         User has is still valid ("live") or not
                        If still good (not older than 3,600 seconds = 1 hour),
                        then we are good to go.
                        If token is too old, user will NOT get AutoLogIn and has to
                        do regular Log In.

                        Hmm: We save the exact same User data back in to localStorage,
                        including that TokenExpiration if I am not mistaken. Hmmmmmmm.
                         */

                        /* No longer. Now NGRX
                                        this.userSubject$.next(thisHereAutoLogInUser);
                        */

                        /*
                        CALCULATE the LogOutTimer DURATION in milliseconds
                        - Go back to the "loggedInUserObjectLiteral" to get the STRING value
                        for the "._tokenExpirationDate" (some large number of milliseconds since 1970)
                        - Subtract from that number the milliseconds for *now*, to get "duration" result
                        - If token still valid (expiration still in *future*) that "duration" number should be positive
                        (See more Commented notes in AuthService.autoLogIn() )
                         */
                        const myLogOutTimerExpirationDuration = new Date(loggedInUserObjectLiteral._tokenExpirationDate).getTime() -
                            new Date().getTime();
                        this.myAuthService.setLogOutTimer(myLogOutTimerExpirationDuration);

                        localStorage.setItem('myUserData', JSON.stringify(thisHereAutoLogInUser));
                        /*
                        LOCALSTORAGE << Do we do this, here ??
            --------------
            myUserData

            email: "necessary@cat.edu"
            id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
            _token: "eyJhbG...CNywVQ"
            _tokenExpirationDate: "2020-01-05T14:39:34.039Z"
            --------------
                         */

/* Refactored here from AuthService, which DID use Store and .dispatch()
                        this.myStore.dispatch(new AuthActions.ogInActionClass(
*/
// But here in NGRX/Effects, we just want to return a newed up Action/Effect. NGRX does dispatch automatically.
                        return new AuthActions.AuthenticateSuccessActionClass(
                            // thisHereAutoLogInUser // << No. Not a User object
                            {
                                email: thisHereAutoLogInUser.email,
                                id: thisHereAutoLogInUser.id,
                                _token: thisHereAutoLogInUser.token,
                                _tokenExpirationDate: new Date(loggedInUserObjectLiteral._tokenExpirationDate)
                            }
                        );
                    } else {
                        // if no valid token on that User in localStorage:
                        return { type: 'DUMMY_IDENTIFIER No valid token on myUserData'}; // Lect. 373 ~07:24
                    }
                }
            }), // /map()
    ); // /.pipe OUTER myAuthAutoLoginEffect


    // 5.  **************************************************************
    @Effect({dispatch: false})
    myAuthLogoutEffect = this.myEffectActions$.pipe(
        ofType(AuthActions.LOG_OUT_ACTION),
        tap(
            (whatDidWeGet) => {
                console.log('whatDidWeGet ', whatDidWeGet);

                localStorage.removeItem('myUserData');

/* Nah - I forget what the hell this timeout thing even is. Sheesh.
Hmm, guess is setTimeout() on autoLogout. Hmm okay...

                if (this.myTimeoutId) {
                    clearTimeout(this.myTimeoutId);
                }
                this.myTimeoutId = null;
*/
                // Even if there was no timer, just set to null anyway

                this.myAuthService.clearLogoutTimer();

                /*
                One more thing to do (not so intuitive):
                Clear the LOCAL Recipe[].
                Q. Why?
                A. So that the user experience is consistent.
                - necessary@cat.edu logs in, fetches Recipes from Canonical Firebase, good.
                - Logs out, okay.
                - Does NOT refresh/reload page/app.
                - Logs in again - **the Recipes are already there** - from LOCAL.
                - Possible that those LOCAL are STALE, not up to date, not Canonical ("of record").
                Improvement: Require/force user to Fetch Recipes anew, upon new LogIn.
                 */
/* Guess was sort of Nice To Have ( ? ) not doing here in NGRX Effects. Hmm. ???
                this.myRecipeService.setRecipes([]); // << CLEAR/EMPTY the Local Recipe[], upon LogOut.
*/

                /* Wrong: We ARE doing this redirect here.  was: Nah not doing this redirect biz here */
                this.myRouter.navigate(['/auth'])
                    .then(goodOrBad => console.log(goodOrBad)); // e.g. true

            }
        )
    ); // /.pipe() OUTER  /myAuthLogoutEffect


    constructor(
        private myEffectActions$: Actions, // << from ngrx/Effects
        private myHttpClient: HttpClient,
        private myAuthService: AuthService, // now we do for logging out// not used seems
        private myRouter: Router,
    ) { }

    /*
    Actions: a stream of observable dispatched actions...

    In the constructor, I chose to call it:
   myEffectActions$: Actions

    Here in Effects, as in Reducer, we do see ALL actions, app-wide (not just Auth actions).
    Here in Effects though, unlike Reducer, we do NOT "change state" (as we do in Reducer).
    No, instead, here in Effects we go off an action to trigger some other logic.
    Can be synchronous, or can await asynchronous completion before triggering.
     */

}
