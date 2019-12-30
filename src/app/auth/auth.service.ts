import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable, ObservableInput, throwError} from 'rxjs';

export interface AuthResponseData {
    kind: string; // << No longer used by Firebase (or us). Was 'identitytoolkit#VerifyPasswordResponse', fwiw.
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}
// registered: boolean // << comes back on Log In, not Sign Up.

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(
        private myHttpClient: HttpClient,
    ) { }

    signup(nameRankSerialNumber): Observable<AuthResponseData> { // >> Nah. : ObservableInput<AuthResponseData> {
        console.log('nameRankSerialNumber 01 ', nameRankSerialNumber);
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
                catchError(this.handleError)
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
                tap(
                    (wholeThingWeGot) => {
                        // Next
                        console.log('77 TAP wholeThingWeGot ', wholeThingWeGot);
                        return wholeThingWeGot;
                    },
                    (errThing) => {
                        // Error
                        console.error('77 TAP errThing ', errThing);
                    },
                    () => {
                        // Complete
                        console.log('77 TAP complete here');
                    }
                ), // /tap()
                catchError(this.handleError)
            ); // /.pipe()
    } // /login()

    handleError(errInService: HttpErrorResponse) {
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
