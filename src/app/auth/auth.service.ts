import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {ObservableInput, throwError} from 'rxjs';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(
        private myHttpClient: HttpClient,
    ) { }

    signup(nameRankSerialNumber) { // >> Nah. : ObservableInput<AuthResponseData> {
        console.log('nameRankSerialNumber 01 ', nameRankSerialNumber);
        /*
Nah:       {email: "necessary@cat.edu", password: "iamacat2", returnSecureToken: true}
Yeah:      {email: "necessary@cat.edu", password: "iamacat2"} // << :o)
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
                catchError(
                    (errInService) => {
                        console.error('errInService ', errInService); // yes whole HttpErrorResponse {}

                        // Test if we have what we expect: a 'message' down under sub-sub properties:
                        if (!errInService.error || !errInService.error.error) {
                        // if (true) {
                            return throwError(JSON.stringify(errInService));
                            // Some OTHER kind of error, we can't send back just 'message'
                            // JSON biz works well (vs just getting [object Object] on U/I)
                        }

                        // O.K., we do have an error with these sub-sub-sub properties:
                        switch (errInService.error.error.message) {
                            case 'EMAIL_EXISTS': {
                                return throwError('That email is already taken');
                            }
                            case 'SOMETHING_ELSE': {
                                return throwError('Whoa nellie');
                            }
                        }
                    }
                )
            );
            // .pipe(); // << Q. ? just plain old empty pipe, needed ?? A. No.
    }

    authUser(nameRankSerialNumber) {
        return this.myHttpClient.post(
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/auth.json',
            nameRankSerialNumber,
        )
            .pipe(
                tap(
                    (whatTappedIn) => {
                        console.log('whatTappedIn ', whatTappedIn); // yep {name: "-Lx1Ar8pZC-_Sq08W-P2"}
                    }
                ),
                catchError(
                    (errWeCaught): ObservableInput<any> => {
                        console.error('errWeCaught inside catchError ', errWeCaught);
                        /*
                        errWeCaught inside catchError  HttpErrorResponse {headers: HttpHeaders, status: 404,
                        statusText: "Not Found", url: FOOBAR...
                         */
                        return throwError(errWeCaught);
                    }
                )
            );
    }

}
