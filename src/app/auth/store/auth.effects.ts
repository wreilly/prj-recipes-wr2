// import { Injectable } from '@angular/core';
import { Actions, ofType, Effect, createEffect } from '@ngrx/effects';
import {catchError, switchMap, map} from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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


// @Injectable() // << Hmm. Max does NOT have
class AuthEffects {
    @Effect()
    myAuthLoginEffect = this.myActions$.pipe(
        // "don't .subscribe(). ngrx will subscribe for you. just call .pipe()
        ofType(AuthActions.LOG_IN_START_EFFECT_ACTION),
        // filter, ONLY this type of actions will proceed into this effect
        // btw, yes comma-separated list of actions above is possible

        switchMap(
        // switchMap() = "create a new observable, from a previous observable's data"
            (authDataWeGot: AuthActions.LogInStartEffectActionClass) => {
                return this.myHttpClient
                    .post<AuthResponseData>(
                        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKeyWR__,
                        /* nameRankSerialNumber // << nope. that was in Service. we now need object body as follows: */
                        {
                            email: authDataWeGot.myPayload.email,
                            password: authDataWeGot.myPayload.password,
                            returnSecureToken: true,
                        }
                    ).pipe( // INNER .pipe() Lect. 366 ~07:17
                        // N.B. catch error HERE on INNER, *NOT* on OUTER .pipe()
                        // In fact you MUST return a *NON*-Error Observable
                        catchError(
                            (errWeGot) => {
                                // ...
                                of();
                            }
                        ),
                        map(
                            (responseDataWeGot) => {
                                of();
                            }
                        )
                    );
            }), // /switchMap()
        // time to RETURN a new action...
    ); // /.pipe() OUTER

    constructor(
        private myActions$: Actions,
        private myHttpClient: HttpClient,
        // private myAuthService: AuthService, // not used seems
    ) { }

    /*
    Actions: a stream of observable dispatched actions...
    Here in Effects, as in Reducer, we do see ALL actions, app-wide (not just Auth actions).
    Here in Effects though, unlike Reducer, we do NOT "change state" (as we do in Reducer).
    No, instead, here in Effects we go off an action to trigger some other logic.
    Can be synchronous, or can await asynchronous completion before triggering.
     */

}
