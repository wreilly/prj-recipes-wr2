import { Injectable } from '@angular/core';
import { Actions, ofType, Effect, createEffect } from '@ngrx/effects';
import {catchError, switchMap, map} from 'rxjs/operators';
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


@Injectable() // << OK later, we DO. << Hmm. Max does NOT have
export class AuthEffects { // N.B. constructor() on BOTTOM, fwiw
    @Effect()
    myAuthLoginEffect = this.myEffectActions$.pipe( // << OUTER .pipe(). NO catchERROR here!
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
                        map( // We moved the catchError() BELOW the map() OK
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

                                return of( // << Having gotten here, we now want to cause the LOG_IN_ACTION to get called/dispatched.
                                    // btw, ngrx/effects automatically dispatches for you. ( ? )
                                    new AuthActions.LogInActionClass({
                                        id: responseDataWeGot.localId,
                                        email: responseDataWeGot.email,
                                        _token: responseDataWeGot.idToken,
                                        _tokenExpirationDate: expiresInCalculated,
                                        }
                                    )
                                ); // /of()  << N.B. Max code apparently removes the of()
                            }
                        ), // /map()
                        // N.B. catch error HERE on INNER, *NOT* on OUTER .pipe()
                        // In fact you MUST return a *NON*-Error Observable
                        catchError(
                            (errWeGot) => {
                                // ...
                                return of(); // TODO empty good enough for moment
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
    ); // /.pipe() OUTER << Make sure to NOT catchError on this Outer .pipe() !!! Do so on INNER .pipe()

    constructor(
        private myEffectActions$: Actions,
        private myHttpClient: HttpClient,
        // private myAuthService: AuthService, // not used seems
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
