import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: [],
})
export class AuthComponent implements OnInit {

    myFormGroup: FormGroup;
    myEmailFormControl: FormControl;
    myPasswordFormControl: FormControl;

    isLoginMode = true;
    /*
    isLoginMode is true means: the user wants to Log In
    isLoginMode is false means: the user wants to Sign Up / Register

    N.B. In *both* cases, the user is Not Yet Logged In.

    One form can do both functions. The user clicks button to choose.
     */

    isLoading = false; // spinner-biz

    nowAmReady = true; // false;
/* Ready to use the Observable here in the Component, as receiving the Service's return (vs. doing the .subscribe() here in the Component).
     */

    myAuthObservable: Observable<AuthResponseData>;
    errorToDisplay: string = null;

    isLoggedIn = false;

    constructor(
        private myAuthService: AuthService,
    ) {

    }

    ngOnInit() {
        this.errorToDisplay = null; // refresh (remove) w re-init component!

        this.myEmailFormControl = new FormControl('', {
            validators: [
                Validators.required,
                Validators.pattern( /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
            ],
        });
        // https://regular-expressions.mobi/email.html?wlr=1
        //  ^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$  << don't forget to make CASE-INSENSITIVE  /i
        // https://angular.io/api/forms/Validators#pattern

        this.myPasswordFormControl = new FormControl('', {
            validators: [
                Validators.required,
                Validators.minLength(6) // 6 is Firebase minimum, actually
            ],
        });
        this.myFormGroup = new FormGroup({
            'myEmailFormControlName': this.myEmailFormControl,
            'myPasswordFormControlName': this.myPasswordFormControl,
        });
    }

    myOnSubmit(formIGot) {
        // Recall: This method does BOTH 1) Sign Up and 2) Log In

        if (!formIGot.valid) {
            // you shouldn't get in here... but just in case
            return; // << tsk, tsk, monsieur Le Hacker!
        }
        this.isLoading = true;

        console.log('formIGot.value ', formIGot.value);
        // Yeah. {myEmailFormControlName: "necessary2@cat.edu", myPasswordFormControlName: "iamacat3"}

        if (this.isLoginMode) {
            this.myAuthObservable = this.myAuthService.logIn({
                    'email': formIGot.value.myEmailFormControlName,
                    'password': formIGot.value.myPasswordFormControlName,
                }
            );

/* NOPE. Just subscribe ONCE (further below) (to cover both Log In, and Sign Up)

            this.myAuthObservable.subscribe(
                (whatWeGot) => {
                    console.log('88 whatWeGot ', whatWeGot);
                },
                (errWeGot) => {
                    console.error('88 errWeGot ', errWeGot);
                }
            );
*/
        } else if (this.nowAmReady) {
            /* 02 Part 1.
            We removed the .subscribe() here. That way what's returned
            from the Service can be received here as an Observable,
            doesn't have to be ( ? ) a Subscription. Hmm.
            And, yeah, we will (below) do a .subscribe() off of that Observable. Cheers.
             */
            this.myAuthObservable = this.myAuthService.signup(
                {
                    email: formIGot.value.myEmailFormControlName,
                    password: formIGot.value.myPasswordFormControlName,
                }
            );
        } else {
            /* 01
            Originally had (still does!) the .subscribe() here, so, can
            *not* assign what's returned to our Observable, no.
            You could assign what's returned to a Subscription (we are not doing
            that here).
             */
            this.myAuthService.signup(
                {
                    email: formIGot.value.myEmailFormControlName,
                    password: formIGot.value.myPasswordFormControlName,
                    // returnSecureToken: true // << Firebase requirement
                    // Nah, keep above out of Component. Just let Service deal with it
                })
                .subscribe(
                    (authIGot) => {
                        console.log('authIGot ', authIGot); // yep {name: "-Lx1Ar8pZC-_Sq08W-P2"}
                        /* Woot.
                        authIGot
    kind: "identitytoolkit#SignupNewUserResponse"
    idToken: "eyJhbGciOiJSUzI1NiIsImtp ... T8g5FFwQWtPYg"
    email: "necessary@cat.edu"
    refreshToken: "AEu4IL3Y465BDYz0p1ONYV...bm1ax78PvETNmU"
    expiresIn: "3600"
    localId: "ba6AFJGd5AVdTpiUbnPdRSNoYXt1"
                         */
                        this.isLoading = false;
                    },
                    (errIfAny) => {
                        console.log('errIfAny in Component ', errIfAny); // yes, WAS whole HttpErrorResponse {}
                        /*
                        errIfAny in Component  HttpErrorResponse {headers: HttpHeaders, status: 404, statusText:
                        "Not Found", url: "https://foobarw
                         */
                        // this.errorToDisplay = errIfAny.error.error.message;
                        this.errorToDisplay = errIfAny; // NOW this is the error message string only = good, what you want.
                        this.isLoading = false;
                    }
                );
        }

        if (this.nowAmReady) {
            // 02, part 2
            this.myAuthObservable.subscribe(
                (whatIGot) => {
                    console.log('whatIGot ', whatIGot); // yes
                    /*
kind: "identitytoolkit#SignupNewUserResponse"
idToken: "eyJhbGc..Jd558z37Q-qjNqLXhU"
email: "norby@pinko8.com"
refreshToken: "AEu4..."
expiresIn: "3600"
localId: "LdfKHjIaVldC1WkNWhMOz2xe8e83"
                     */
                    this.isLoading = false;
                },
                (errIGot) => {
                    console.error('errIGot ', errIGot);
                    // this.errorToDisplay = errIGot.error.error.message; // moved to Service
                    // this.errorToDisplay = JSON.stringify(errIGot);
                    this.errorToDisplay = errIGot; // JSON biz over on Service now
                    // Now this is the error message string only = good, what you want.
                    /*
                    Hmm. JSON.stringify() is good when we send whole [object Object]
                    But it does put double-quotes around it when we just get back a string. Looks little funny, but, acceptable.
                     */
                    this.isLoading = false;
                }
            );
        }

        // After either Signup OR Login,
        // and, after either success OR error (with either one),
        // we .reset()
        formIGot.reset();
        // this.isLoading = false; // temporary
        // return; // temporary

    } // /myOnSubmit() = BOTH Sign Up AND Log In

    mySwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    dismissErrorToDisplay() {
        this.errorToDisplay = null;
    }

}
