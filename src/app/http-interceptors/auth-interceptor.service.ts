// (part of) Ye Olde Barrel...
import {HttpInterceptor, HttpParams} from '@angular/common/http'; // No longer HttpResponse

import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError} from 'rxjs'; // No longer ObservableInput
import {take, exhaustMap, map} from 'rxjs/operators'; // nope: tap, catchError

import { Store } from '@ngrx/store';
import * as fromRoot from '../store/app.reducer';

import { AuthService } from '../auth/auth.service';
// import {User} from '../auth/user.model'; // << no
import {Injectable} from '@angular/core';


// Huh, so far at least, this is working WITHOUT putting the @Injectable() decorator here on top. Surprising. ?
/*
Q. "I did not get any error, even without attaching @Injectable metadata. Why?"

https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14466440#questions/9003692

A. " there has been an undocumented change under the hood in Angular 8."
 */
// So, we'll put in the "@Injectable()" decorator, even if not absolutely needed:
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(
        private myAuthService: AuthService,
        private myStore: Store<fromRoot.MyOverallRootState>,
    ) { }


/* COMMENTING IT ALL OUT NOW ...
    interceptOLDuserSubject$(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // intercept(req: HttpRequest<any>, next: HttpHandler): any {

        /!*  *****    REQUEST    *********
         *!/
        console.log('AUTH-INTERCEPT req.headers ', req.headers);
        console.log('AUTH-INTERCEPT JSON.stringify(req) ', JSON.stringify(req));
*/
        /*
        {
        "url":"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?
        key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28",
        "body":
        {
        "email":"necessary@cat.edu",
        "password":"iamacat",
        "returnSecureToken":true
        },
        "reportProgress":false,
        "withCredentials":false,
        "responseType":"json",
        "method":"POST",
        "headers":{"normalizedNames":{},"lazyUpdate":null,"headers":{}},
        "params":{"updates":null,"cloneFrom":null,"encoder":{},"map":null},
        "urlWithParams":"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28"
        }
         */

        /*
        Interceptor's job here is to take the
        REQUEST and get the User's token and add
        that token to the REQUEST. Then send it along.
         */

        /* No Longer (now NGRX) */
 /*        return this.myAuthService.userSubject$
            .pipe(
                take(1), // gets 1 (and only 1) User from that BehaviorSubject
                exhaustMap(
                    (userFromTakeOne: User): ObservableInput<any> => {
                        if (!userFromTakeOne) {
                            // No User object (yet)
                            // We probably just clicked on Log In button...
                            // Just keep on going - AuthService will take care of "handleAuthentication" biz...

                            console.log('userFromTakeOne ', userFromTakeOne); // undefined (on this first, "Log In," pass)
                            return next.handle(req);
                        } else {
                            // Okay we got a User = we are logged in

                            console.log('userFromTakeOne ', userFromTakeOne);
                            /!* From AuthService we got User:
                            userFromTakeOne  User
                            {email: "necessary@cat.edu",
                            id: "hMv51L1tHof1paEgJe9ZEjUVhH82",
                            _token: "eyJhbGc…wO_CPxFuE9",
                            _tokenExpirationDate: Sat Jan 04 2020 11:59:06 GMT-0500 (Eastern Standard Time)}
                             *!/


                            // Let's get the token off the User ;o)
                            // And add the ?auth=token parameter
                            // to a CLONE of the original Request
                            const reqWithTokenNow = req.clone(
                                {
                                    params: new HttpParams().set('auth', userFromTakeOne.token)
                                }
                            );
                            return next.handle(reqWithTokenNow);
                        }
                        // console.log('userRightNow.token ', userRightNow.token);
                        // return next.handle(req);
                        // Yeah. This is (appropriately) returning an ObservableInput<any>, apparently. (Who knew?)

                        // return req;
                        // Nope. This is returning an HttpRequest {}. Needs an Observable (of some sort)
                    }
                ), // /exhaustMap()
                tap(
                    /!*
                    Usually an Interceptor does not do this kind of "tap()" into the Response.
                    Instead just sends the (modified) request back/onward to the AuthService etc.
                    But, you can see the Response:
                     *!/
                    (thatHttpResponseWeGot: HttpResponse<any>): ObservableInput<any> => { // WAS userRightNow
                        // console.log('userRightNow ', userRightNow); // WAS undefined
                        console.log('TAP in INTERCEPTOR - EVER SEE THIS ?? thatHttpResponseWeGot ', thatHttpResponseWeGot);
                        /!* NOW I :
                        {type: 0} << initial OPTIONS OK
                         *!/
                        /!* NOW II :
                        LOGGED IN OK: (Also on Fetch Data)
{
  "kind": "identitytoolkit#VerifyPasswordResponse",
  "localId": "hMv51L1tHof1paEgJe9ZEjUVhH82",
  "email": "necessary@cat.edu",
  "displayName": "",
  "idToken": "eyJhbG...gluTpWQ",
  "registered": true,
  "refreshToken": "AEu..hAGuYA",
  "expiresIn": "3600"
}
                         *!/
                        /!* BEFORE:
                        With the exhaustMap() above, now this is logging the correct whole Response :o)      *!/
                        return next.handle(req);

                        /!*  *****    RESPONSE    *********
                         *!/
                        /!*
        {
          "kind": "identitytoolkit#VerifyPasswordResponse",
          "localId": "hMv51L1tHof1paEgJe9ZEjUVhH82",
          "email": "necessary@cat.edu",
          "displayName": "",
          "idToken": "eyJhbG...YMLUXg",
          "registered": true,
          "refreshToken": "AEu4I...wdAEplz2dVfgE",
          "expiresIn": "3600"
        }
                        *!/
                    }
                ), // /tap()

                /!* **** REMOVING catchError() that came from AuthService:
                MAX Code does NOT have it here in Interceptor. I was just testing things out. Cheers.

                                catchError(this.handleErrorInInterceptor), // << this handleError() is copied here from AuthService
                *!/

                catchError(
                    // UPDATE. We can keep this "catchError()" here, but,
                    // we are simply using it just PASS THROUGH entire HttpErrorResponse object.
                    // << this catchError WAS on DataStorageService.storeRecipes()

                    (catchErrorWeGot: HttpErrorResponse): Observable<never> => {
                        /!*
                        rxjs throwError "creates an Observable that never emits any value. Observable<never>
                        Instead, it errors out immediately using the same error caught by catchError"
                        https://blog.angular-university.io/rxjs-error-handling/
                         *!/
                        console.log('catchErrorWeGot in Interceptor HttpErrorResponse: ', catchErrorWeGot);
                        /!* Yep on FOOBAR URL:
                        HttpErrorResponse
                        {headers: HttpHeaders, status: 0, statusText: "Unknown Error",
                        url: "https://FOOBARidentitytoolkit.googleapis.com/v1/ac…sword?
                        key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28",
                        ok: false, …}
headers: HttpHeaders {normalizedNames: Map(0), lazyUpdate: null, headers: Map(0)}
status: 0
statusText: "Unknown Error"
url: "https://FOOBARidentitytoolkit.googleapis.com/v1/accounts:signInWithPassword?
key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28"
ok: false
name: "HttpErrorResponse"
message: "Http failure response for
https://FOOBARidentitytoolkit.googleapis.com/v1/accounts:signInWithPassword?
key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28:
0 Unknown Error"
error: ProgressEvent
isTrusted: true
                         *!/

                        /!* REMOVING THIS LOGIC from CATCHERROR() on INTERCEPTOR

                                                if (catchErrorWeGot.error instanceof ErrorEvent) {
                                                    // A client-side or network error occurred. Handle it accordingly.
                                                    console.error('An error occurred:', catchErrorWeGot.error.message);
                                                } else {
                                                    // The backend returned an unsuccessful response code.
                                                    // The response body may contain clues as to what went wrong,
                                                    console.error(
                                                        `Backend returned status code ${catchErrorWeGot.status}, ` +
                                                        `body (error) was: ${ JSON.stringify(catchErrorWeGot.error) }`);
                                                    /!*
                                                    ...code 0, body was: {"isTrusted":true}
                                                     *!/
                                                }
                        *!/

                        // return an observable (Observable<never>), with a user-facing error message
                        /!* REMOVING THIS FROM CATCHERROR() on INTERCEPTOR:
                                                return throwError('Oops Send Data');
                        *!/
                        return throwError(catchErrorWeGot);
                        // simply passing through entire HttpErrorResponse object.
                        // (Q. Does that work?) (A. Yes.)
                    }
                ) // /catchError()


            ); // /.pipe()
    } // /interceptOLDuserSubject$()
*/

    private static handleErrorInInterceptor(errInInterceptorService: HttpErrorResponse): Observable<never> {
        // << REMOVING. NO LONGER CALLED. OKAY.
        /*
        For Heck Of It
        I have copied the 'handleError()' from AuthService here into the Interceptor.
        It does work etc. But maybe best/better practice is to Not Bother with error handling
        in the Interceptor ( ? ).
         */
        /*
        rxjs throwError "creates an Observable that never emits any value. Observable<never>
        Instead, it errors out immediately using the same error caught by catchError"
        https://blog.angular-university.io/rxjs-error-handling/
         */

        let errorMessageToThrow = 'Something who knows what went wrong';
        console.error('errInINTERCEPTORService ', errInInterceptorService); // yes whole HttpErrorResponse {}

        // Test if we have what we expect: a 'message' down under sub-sub properties:
        if (!errInInterceptorService.error || !errInInterceptorService.error.error) {
            return throwError(JSON.stringify(errInInterceptorService));
            // Some OTHER kind of error, we can't send back just 'message'
            // btw, JSON biz works well (vs just getting [object Object] on U/I)
        }

        // O.K., since we GOT PAST the
        // "if() { return }" above...
        // that means we DO have an error with these
        // sub-sub-sub properties:
        switch (errInInterceptorService.error.error.message) {
            case 'EMAIL_EXISTS': {
                errorMessageToThrow = 'That e-mail address is already taken';
                break;
            }
            case 'EMAIL_NOT_FOUND': {
                errorMessageToThrow = 'That e-mail address is not found';
                break;
            }
            case 'INVALID_PASSWORD': {
                errorMessageToThrow = 'Incorrect password. Sorry!';
                break;
            }
        }

        return throwError(errorMessageToThrow);
    } // /handleErrorInInterceptor()

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // intercept(req: HttpRequest<any>, next: HttpHandler): any {

        /*  *****    REQUEST    *********
         */
        console.log('AUTH-INTERCEPT req.headers ', req.headers);
        console.log('AUTH-INTERCEPT JSON.stringify(req) ', JSON.stringify(req)); // WORKED WR__ but not MAX. Hmmph.
        // Update, hmm, now above DOES work okay, even w. MAX-ish code. Sheesh(-ish). Cwazy tymes.

        /*
        WR__. WORKED. AUTH-INTERCEPT JSON.stringify(req)
        ===========
{
	"url":"https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json",
	"body":
		[
		{"description":"A 99 103 s...","name":"Basic 99 103 22 choppa Class ngrx started up edit still works"},
		{"description":"W-a-a-a-l, 7777 it looks p","name":"Let new 7777 navigate UsEdit23 Coffee FOR DUKE Cake EDITTIME Max08 Edit the 2nd 3rd"},
		],
			"reportProgress":false,
	"withCredentials":false,
	"responseType":"json",
	"method":"PUT",
	"headers":{"normalizedNames":{},"lazyUpdate":null,"headers":{}},
	"params":{"updates":null,"cloneFrom":null,"encoder":{},"map":null},
	"urlWithParams":"https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json"
}
============
         */

        /* My attempt at MAX approach (still hits error - sheesh)
        console.log('AUTH-INTERCEPT req (below): ');
        console.log(req); // << hits same JSON.stringify circular-berkular error-ker-snippety-snap

        Holy Kerpow:
          at HttpRequest.push../node_modules/@angular/common/fesm5/http.js.HttpRequest.serializeBody (http.js:687)
                  // Check whether the body is an object or array, and serialize with JSON if so.
        if (typeof this.body === 'object' || typeof this.body === 'boolean' ||
            Array.isArray(this.body)) {
            return JSON.stringify(this.body);
        }
        // Fall back on toString() for everything else.
        return this.body.toString();
         */
        /*
        Hey! Learn sumtin' new Every Day:
        https://stackoverflow.com/questions/27101240/typeerror-converting-circular-structure-to-json-in-nodejs
        "The request (req) object is circular by nature - Node does that."
         */

        /*
        {
        "url":"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?
        key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28",
        "body":
        {
        "email":"necessary@cat.edu",
        "password":"iamacat",
        "returnSecureToken":true
        },
        "reportProgress":false,
        "withCredentials":false,
        "responseType":"json",
        "method":"POST",
        "headers":{"normalizedNames":{},"lazyUpdate":null,"headers":{}},
        "params":{"updates":null,"cloneFrom":null,"encoder":{},"map":null},
        "urlWithParams":"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28"
        }
         */

        /*
        Interceptor's job here is to take the
        REQUEST and get the User's token and add
        that token to the REQUEST. Then send it along.
         */


/* No Longer AuthService.userSubject$ (now NGRX) */
        // NEW NGRX
        return this.myStore.select(fromRoot.getAuthState)
        // return this.myAuthService.userSubject$ // <<<<<<<<< Commented out now. Cheers.
            .pipe(
                take(1), // gets 1 (and only 1) User from that auth part of Store. WAS: BehaviorSubject
/* No. This tap() business here wrong.
                tap(
                    (whatWeTapped)  => {
                        console.log('whatWeTapped ', whatWeTapped);
                        return next.handle(req);
                    }
                ),
*/
                map(
                    (stateWeGotItSeems) => {
                        console.log('stateWeGotItSeems ', stateWeGotItSeems);
                        return stateWeGotItSeems.myAuthedUser;
                        /* Here in the .map(), just get the User info/object out of
                        the store slice, pass along ('return') to next step: exhaustMap()
                         */
                    }
                ),
                exhaustMap(
                    (isItThatAuthedUser) => {
                        console.log('isItThatAuthedUser ', isItThatAuthedUser);
                        // console.log('isItThatAuthedUser.token GETTER ', isItThatAuthedUser.token);
                        // console.log('isItThatAuthedUser._token private var ', isItThatAuthedUser._token); // << No can do...

                        if (!isItThatAuthedUser) {
                            return next.handle(req);
                        }

                        // Okay, we have a User, so, let's get the token off the User ;o)
                        // And add the ?auth=token parameter
                        // to a CLONE of the original Request
                        const reqWithTokenNow = req.clone(
                            {
                                params: new HttpParams().set('auth', isItThatAuthedUser.token)
                                // above uses the '.token' GETter. bueno.
                            }
                        );
                        return next.handle(reqWithTokenNow);
                    }
                )
            ); // /.pipe()
    } // /intercept()

}
