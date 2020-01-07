// (part of) Ye Olde Barrel...
import {HttpInterceptor, HttpResponse, HttpParams} from '@angular/common/http';

import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import {Observable, ObservableInput, throwError} from 'rxjs';
import {tap, take, exhaustMap, catchError} from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import {User} from '../auth/user.model';
import {Injectable} from '@angular/core';


// Huh, so far at least, this is working WITHOUT putting the @Injectable() decorator here on top. Surprising. ?
/*
Q. "I did not get any error, even without attaching @Injectable metadata. Why?"

https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14466440#questions/9003692

A. " there has been an undocumented change under the hood in Angular 8."
 */
// So, we'll put it in even if not absolutely needed:
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(
        private myAuthService: AuthService,
    ) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // intercept(req: HttpRequest<any>, next: HttpHandler): any {

        /*  *****    REQUEST    *********
         */
        console.log('AUTH-INTERCEPT req.headers ', req.headers);
        console.log('AUTH-INTERCEPT JSON.stringify(req) ', JSON.stringify(req));
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

        return this.myAuthService.userSubject$
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
                            /* From AuthService we got User:
                            userFromTakeOne  User
                            {email: "necessary@cat.edu",
                            id: "hMv51L1tHof1paEgJe9ZEjUVhH82",
                            _token: "eyJhbGc…wO_CPxFuE9",
                            _tokenExpirationDate: Sat Jan 04 2020 11:59:06 GMT-0500 (Eastern Standard Time)}
                             */


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
                    /*
                    Usually an Interceptor does not do this kind of "tap()" into the Response.
                    Instead just sends the (modified) request back/onward to the AuthService etc.
                    But, you can see the Response:
                     */
                    (thatHttpResponseWeGot: HttpResponse<any>): ObservableInput<any> => { // WAS userRightNow
                        // console.log('userRightNow ', userRightNow); // WAS undefined
                        console.log('TAP in INTERCEPTOR - EVER SEE THIS ?? thatHttpResponseWeGot ', thatHttpResponseWeGot);
                        /* NOW I :
                        {type: 0} << initial OPTIONS OK
                         */
                        /* NOW II :
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
                         */
                    /* BEFORE:
                    With the exhaustMap() above, now this is logging the correct whole Response :o)      */
                    return next.handle(req);

                    /*  *****    RESPONSE    *********
                     */
                    /*
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
                    */
                }
                ), // /tap()

                catchError(this.handleErrorInInterceptor), // << this handleError() is copied here from AuthService

                catchError( // << this catchError WAS on DataStorageService.storeRecipes()

                    (catchErrorWeGot: HttpErrorResponse): Observable<never> => {
            /*
            rxjs throwError "creates an Observable that never emits any value. Observable<never>
            Instead, it errors out immediately using the same error caught by catchError"
            https://blog.angular-university.io/rxjs-error-handling/
             */
                        console.log('catchErrorWeGot ', catchErrorWeGot);
                        /* Yep on FOOBAR URL:
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
                         */

                        if (catchErrorWeGot.error instanceof ErrorEvent) {
                            // A client-side or network error occurred. Handle it accordingly.
                            console.error('An error occurred:', catchErrorWeGot.error.message);
                        } else {
                            // The backend returned an unsuccessful response code.
                            // The response body may contain clues as to what went wrong,
                            console.error(
                                `Backend returned status code ${catchErrorWeGot.status}, ` +
                                `body (error) was: ${ JSON.stringify(catchErrorWeGot.error) }`);
                            /*
                            ...code 0, body was: {"isTrusted":true}
                             */
                        }
                        // return an observable (Observable<never>), with a user-facing error message
                        return throwError('Oops Send Data');
                    }
                ) // /catchError()


            ); // /.pipe()
    } // /intercept()

    private handleErrorInInterceptor(errInInterceptorService: HttpErrorResponse): Observable<never> {
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

}
