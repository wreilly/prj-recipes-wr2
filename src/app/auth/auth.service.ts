import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject, throwError} from 'rxjs'; // No longer Subject; not using ObservableInput
import {User} from './user.model';

export interface AuthResponseData {
    kind: string; // YER WRONG >> << No longer used by Firebase (or us). Was 'identitytoolkit#VerifyPasswordResponse', fwiw.
    // Hmm, I'm WRONG about above. We DO see this *come back* (we did not *send it*): e.g. kind: "identitytoolkit#VerifyPasswordResponse",
    idToken: string; // big long token...
    email: string;
    refreshToken: string; // another big long token...
    expiresIn: string; // a number we handle/receive as a string, simply
    localId: string; // Firebase "User UID" e.g. 'WFVtoZD1FogRdnkQ3qP6fhNzdxl2'
    registered?: boolean; // Log In, not Sign Up
}
// registered: boolean // << comes back on Log In, not Sign Up.

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    // NEEDS TO BE BEHAVIOR SUBJECT!! :o)
    // userSubject$ = new Subject<User>();
    userSubject$ = new BehaviorSubject<User>(undefined); // must initialize. null'll do.  (Hmm, undefined ? yep it's okay too)


/* Just notes on what's in a User:
    email: string,
    id: string,
    _token: string,
    _tokenExpirationDate: Date,
*/


    constructor(
        private myHttpClient: HttpClient,
        private myRouter: Router,
    ) { }

    signup(nameRankSerialNumber): Observable<AuthResponseData> { // >> Nah. : ObservableInput<AuthResponseData> {
        // console.log('nameRankSerialNumber 01 ', nameRankSerialNumber);
        /*
Nah:       {email: "necessary@cat.edu", password: "iamacat", returnSecureToken: true}
Yeah:      {email: "necessary@cat.edu", password: "iamacat"} // << :o)
         */

        // nameRankSerialNumber = nameRankSerialNumber.returnSecureToken = true; // << Nah!!!
        nameRankSerialNumber.returnSecureToken = true; // << More better
        console.log('nameRankSerialNumber 02 ', nameRankSerialNumber);
        // Yep {email: "necessary3@cat.edu", password: "iamacat3", returnSecureToken: true}
        return this.myHttpClient.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28',
            nameRankSerialNumber
        )
            .pipe(
                catchError(this.handleError), // MAX code had error catching first. okay i guess y not
                tap(
                    (wholeThingWeGot) => {
                        console.log('77 Sign Up - TAP wholeThingWeGot ', wholeThingWeGot);
                        this.handleAuthentication(
                            wholeThingWeGot.email,
                            wholeThingWeGot.localId,
                            wholeThingWeGot.idToken,
                            +wholeThingWeGot.expiresIn, // << we '+' it
                        );
                    },
                ),
            );
            // .pipe(); // << Q. ? just plain old empty pipe, needed ?? A. No.
    } // /signUp()

    logIn(nameRankSerialNumber): Observable<AuthResponseData> {
        console.log('01 NRSN ', nameRankSerialNumber);
        nameRankSerialNumber.returnSecureToken = true;
        // https://firebase.google.com/docs/reference/rest/auth#section-sign-in-email-password

        console.log('02 NRSN ', nameRankSerialNumber);

        // tslint:disable-next-line:max-line-length
        return this.myHttpClient.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA5y4R3M5qBiNQ8YotiEr6rW3F0uSarA28',
            nameRankSerialNumber
            )
            .pipe(
                catchError(this.handleError),  // MAX code had error catching first. okay i guess y not
                tap(
                    (wholeThingWeGot) => {
                            console.log('66 Log In - TAP wholeThingWeGot ', wholeThingWeGot);
                            /* LOOKS GOOD TO ME:
kind: "identitytoolkit#VerifyPasswordResponse"
localId: "hMv51L1tHof1paEgJe9ZEjUVhH82"
email: "necessary@cat.edu"
displayName: ""
idToken: "eyJhbGci...tpab9wn-A"
registered: true
refreshToken: "AEu4IL2...j4JpVD7fxGbKAd38eSd_g8E_M"
expiresIn: "3600"
                             */
                            this.handleAuthentication(
                                wholeThingWeGot.email,
                                wholeThingWeGot.localId,
                                wholeThingWeGot.idToken,
                                +wholeThingWeGot.expiresIn, // << we '+' it
                            );
                    },
                    (errThing) => {
                        // Error
                        console.error('66 Log In - TAP errThing ', errThing);
                    },
                    () => {
                        // Complete
                        console.log('66 Log In - TAP complete here');
                    }
                ), // /tap()
            ); // /.pipe()
    } // /login()

    autoLogIn() {
        // Check LOCALSTORAGE for myUserData! If so, then we're good to go! (who knew?)
        if (localStorage.getItem('myUserData') !== null) {
            const heyWeAreLoggedInUserDataString: string = localStorage.getItem('myUserData');
            console.log('heyWeAreLoggedInUserDataString ', heyWeAreLoggedInUserDataString);
            /*
            email: "necessary@cat.edu"
    id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
    _token: "eyJhbG...CNywVQ"
    _tokenExpirationDate: "2020-01-05T14:39:34.039Z"
             */
            const loggedInUserObjectNow: { // Let's explicitly show the Type we get,
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
                loggedInUserObjectNow.email,
                loggedInUserObjectNow.id,
                loggedInUserObjectNow._token,
                new Date(loggedInUserObjectNow._tokenExpirationDate)
            );
*/

            const thisHereAutoLogInUser = new User(
                loggedInUserObjectNow.email,
                loggedInUserObjectNow.id,
                loggedInUserObjectNow._token,
                new Date(loggedInUserObjectNow._tokenExpirationDate)
            );

            if (thisHereAutoLogInUser.token) {
                /*
                The .token GETTER tells us whether the localStorage User
                still has valid ("live") token or not
                If still good (within 3,600 seconds = 1 hour),
                then we are good to go.
                If token is too old, user will NOT get AutoLogIn and has to
                do regular Log In.

                I guess question I have is: hmm, if say 56 minutes were gone on that hour,
                does this AutoLogin only then last you say 4 minutes more ????
                We save the exact same User data back in to localStorage,
                including that TokenExpiration if I am not mistaken. Hmmmmmmm.
                 */
                this.userSubject$.next(thisHereAutoLogInUser);
                localStorage.setItem('myUserData', JSON.stringify(thisHereAutoLogInUser));
                /*
                LOCALSTORAGE
    --------------
    myUserData

    email: "necessary@cat.edu"
    id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
    _token: "eyJhbG...CNywVQ"
    _tokenExpirationDate: "2020-01-05T14:39:34.039Z"
    --------------
                 */
            }


        }
    }

    logout() {
        this.userSubject$.next(null);
        // Maybe do navigate here too; for now, over on HeaderComponent y not
        this.myRouter.navigate(['/auth'])
            .then(goodOrBad => console.log(goodOrBad));
        localStorage.removeItem('myUserData');
    } // /logout()

    private handleAuthentication(
        // I'd first done without typing, but better to do with. Cheers.
        email: string,
        userLocalId: string,
        token: string,
        expiresIn: number, // 3600 << don't forget to '+' passed-in string to numberify!
    ): void { // << no return. instead uses .next() ...

        /*
        We just signed up OR logged in.
        Time to:
         0) determine Date object / milliseconds till expire,
         1) new() up a User, and
         2) ".next()" propagate to any subscribers,
         info about that User, via our userSubject$ !
         */

        /*
        What the henry hay is going on here?
                    console.log('WR__ just newed-up() User thisHereUser: ', thisHereUser);
         */
        console.log('WR__ 01 just got to handleAuthentication email ', email); // yeah! necessary@cat.edu
        console.log('WR__ 03 just got to handleAuthentication token ', token); // yeah! big long token

            const expirationDateForThis: Date = new Date(
                new Date().getTime() + (expiresIn * 1000) //  (+expiresIn * 1000) // << no longer need to '+' numberify here
            );
        /*
        Above RHS inner calculation gets milliseconds.
        Wrap whole RHS w new Date() to get a Date object,
        Assign that to LHS. Bueno.
         */

            const thisHereUser = new User(
                email,
                userLocalId,
                token,
                expirationDateForThis,
            );

            console.log('WR__ just newed-up() User thisHereUser: ', thisHereUser); // hmm. empty baby. not good.

            this.userSubject$.next(thisHereUser);
            localStorage.setItem('myUserData', JSON.stringify(thisHereUser));
            /*
            LOCALSTORAGE
--------------
myUserData

email: "necessary@cat.edu"
id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
_token: "eyJhbG...CNywVQ"
_tokenExpirationDate: "2020-01-05T14:39:34.039Z"
--------------
             */

        } // /handleAuthentication()

    private handleError(errInService: HttpErrorResponse): Observable<never> {
        /*
        N.B. For Heck Of It
        I have also copied this 'handleError()' over to the Interceptor. Cheers.
         */
        /*
        rxjs throwError "creates an Observable that never emits any value. Observable<never>
        Instead, it errors out immediately using the same error caught by catchError"
        https://blog.angular-university.io/rxjs-error-handling/
         */

        let errorMessageToThrow = 'Something who knows what went wrong';
            console.error('errInService ', errInService); // yes whole HttpErrorResponse {}

            // Test if we have what we expect: a 'message' down under sub-sub properties:
            if (!errInService.error || !errInService.error.error) {
                return throwError(JSON.stringify(errInService));
                // Some OTHER kind of error, we can't send back just 'message'
                // btw, JSON biz works well (vs just getting [object Object] on U/I)
            }

            // O.K., we do have an error with these sub-sub-sub properties:
            switch (errInService.error.error.message) {
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
    } // /handleError()

}
