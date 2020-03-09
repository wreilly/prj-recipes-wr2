import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect, createEffect } from '@ngrx/effects';
import {catchError, switchMap, map, tap} from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User } from '../user.model';

import { environment } from '../../../environments/environment';
import * as AuthActions from './auth.actions';
// import {AuthService} from '../auth.service'; // not used seems

// REFACTORED HERE from AuthService. Cheers.
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


@Injectable() // << OK later, we DO. << Hmm. Max does NOT have
export class AuthEffects { // N.B. constructor() on BOTTOM, fwiw

    /* TABLE OF CONTENTS
    1.
    @Effect()
    myAuthLoginStartEffect

    2.
    @Effect()
    myAuthLoginSuccessEffect

    // N.B. constructor() on BOTTOM, fwiw
     */

    @Effect()
    myAuthLoginStartEffect = this.myEffectActions$.pipe( // << OUTER .pipe(). NO catchERROR here!
        // "don't .subscribe(). ngrx will subscribe for you. just call .pipe()
        ofType(AuthActions.LOG_IN_START_EFFECT_ACTION),
        // Above is a filter. ONLY this type of actions will proceed into this effect
        // btw, yes comma-separated list of multiple actions is possible

        switchMap(
        // switchMap() = "create a new observable, from a previous observable's data"
            (authDataWeGot: AuthActions.LogInStartEffectActionClass) => {
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
                        map( // "map() automatically wraps what is returned into an Observable..."
                            // We moved the catchError() BELOW this here map(). OK.
                            (responseDataWeGot: AuthResponseData) => {
                                /* e.g.
                                 wholeThingWeGot.email,
                            wholeThingWeGot.localId,
                            wholeThingWeGot.idToken,
                            +wholeThingWeGot.expiresIn, // << we '+' it
                                 */

                                /*
                                expiresIn logic ~copied over from AuthService.handleAuthentication()
                                 */
                                const expiresInCalculated: Date = new Date( new Date().getTime() +  +responseDataWeGot.expiresIn );
                                // N.B. the '+' to numberize that +responseDataWeGot.expiresIn

/* Do not use of() to create an Observable to return.
We are already inside map(), which creates an Observable to return. (Don't want doubly-wrapped Observable.) Cheers.

                                return of( // << YEP Lect. 369 ~03:13
*/

                                // << Having successfully gotten here, we now want to cause the LOG_IN_ACTION to get called/dispatched.
                                // recall, LOG_IN_ACTION could be (re-)named Login *Success* action

                                // btw, ngrx/effects automatically dispatches for you. ( ? )
                                // That is, just "new" it up; Effects will dispatch it.
                                return new AuthActions.LogInActionClass({
                                        id: responseDataWeGot.localId,
                                        email: responseDataWeGot.email,
                                        _token: responseDataWeGot.idToken,
                                        _tokenExpirationDate: expiresInCalculated,
                                    }
                                );
                                /* removing of()
                                ); // /of()  << N.B. Max code apparently removes the of() << YEP Lect. 369 ~03:13
*/
                            }
                        ), // /map()
                        // N.B. catch error HERE on INNER, *NOT* on OUTER .pipe()
                        // In fact you MUST return a *NON*-Error Observable
                        catchError(
                            (errorResponseWeGot) => {
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
                                ); // TODO empty good enough for moment
                                /*
                                Now while our "catchError()" is NOT returning/catching any error, you must or ought to ? put it
                                AFTER the map(). Cheers. Done.
                                 */
                            }
                        ), // /catchError()
                    );
            }), // /switchMap()
        // time to RETURN a new action... ?
        /* Hmm, until we did the "Inner .pipe()" above, you could have done
        the "catchError()" business right here, on Outer .pipe(). But DON'T.
        Do the catchError() on that Inner .pipe(). Thank you.
        (And, return ONLY NON-ERROR new Observable!
        */
    ); // /.pipe() OUTER  /myAuthLoginStartEffect
    // << Make sure to NOT catchError on this Outer .pipe() !!! Do so on INNER .pipe()

    @Effect({ dispatch: false })
    myAuthLoginSuccessEffect = this.myEffectActions$.pipe(
        ofType(AuthActions.LOG_IN_ACTION), // << "Log In Success" action, could be named...
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
                this.myRouter.navigate(['/recipes']); // Max to ['/'].
                // "You could pass in as a payload the redirect URL you wanted..."
            }
        ) // /tap()
        /*
        N.B. ({dispatch: false}) >> This particular Effect does NOT result in returning a new Observable, which in turn holds
        a new Effect, which would hold an (Effect) Action that should be dispatched...
        Most Effects do. This Effect does not. Lect. 369 ~01:53
         */
    ); // /.pipe() "OUTER" (only) /myAuthLoginSuccessEffect

    constructor(
        private myEffectActions$: Actions, // << from ngrx/Effects
        private myHttpClient: HttpClient,
        // private myAuthService: AuthService, // not used seems
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
