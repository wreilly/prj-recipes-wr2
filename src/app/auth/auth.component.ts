import {Component, OnInit, ComponentFactoryResolver, ViewChild, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponseData } from './auth.service';

import { AlertComponent } from '../shared/alert/alert.component';
import { PutThingHereDirective } from '../shared/put-thing-here/put-thing-here.directive';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: [],
})
export class AuthComponent implements OnInit, OnDestroy {

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

    myAuthObservable: Observable<AuthResponseData>; // BOTH log in and sign up
    errorToDisplay: string = null;

    isLoggedIn = false;

    @ViewChild(PutThingHereDirective, { static: false }) alertHostPosition: PutThingHereDirective;
    /*
The Type "PutThingHereDirective" doesn't do a lot (it is a "Placeholder," recall).
It simply exposes ('public') a ViewContainerRef. But that is just what we need. Cool.
     */

    dismissCloseMessageSubscription: Subscription;

    constructor(
        private myAuthService: AuthService,
        private myRouter: Router,
        private myComponentFactoryResolver: ComponentFactoryResolver,
        // private myPutThingHereDirective: PutThingHereDirective, // << not necessary ?
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
        } else if (this.nowAmReady) { // Not LoginMode, so we are Sign Up!
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
            this.myAuthService.signup( // << NO LONGER USING
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
                        this.errorToDisplay = errIfAny; // NOW this is the error essage string only = good, what you want.
                        this.isLoading = false;
                    }
                );
        }

        if (this.nowAmReady) {
            // 02, part 2
            // After either Signup OR Login, we here .subscribe()
            /* .subscribe() EXECUTES!

            https://angular.io/guide/observables#subscribing

            Hmm. I'd had impression that .subscribe()
            sort of "set up" things, such that only
            LATER would some invocation of ".next()"
            actually TRIGGER something happening.

            But, hmm, here I see how actually immediately
            upon that subscribing, we (apparently) also
            immediately get back what either
            AuthService.login() or AuthService.signup()
            are sending (<AuthResponseData>).
            That is, this Observable's .next() is
            immediately tickled/invoked - I do not
            have to go explicitly invoke
            myAuthObservable.next(). Hmm.

            FOR COMPARISON:
            HeaderComponent.ngOnInit()
            Yes, here too the .subscribe() immediately runs its .next():
            // "Tersest, bestest:"
    this.myAuthUserSub = this.myAuthService.userSubject$
    .subscribe(userWeGot => this.isAuthenticated = !!userWeGot);

             */
            this.myAuthObservable.subscribe(
                (whatIGot) => {
                    console.log('whatIGot ', whatIGot); // yes
                    /* N.B. This is just "AuthResponseData" - NOT a User (object)
But it is plenty for us to know we are good to simply (below) navigate to /recipes etc.

whatIGot: AuthResponseData
--------------------------
kind: "identitytoolkit#SignupNewUserResponse"
idToken: "eyJhbGc..Jd558z37Q-qjNqLXhU" << yes on User
email: "norby@pinko8.com" << yes on User
refreshToken: "AEu4..."
expiresIn: "3600" << sort of yes on User ~ sort of - but on User it is a Date object
localId: "LdfKHjIaVldC1WkNWhMOz2xe8e83"  << yes on User
--------------------------
                     */
                    this.isLoading = false;
                    // TIME TO NAVIGUESS! ;o)
                    this.myRouter.navigate(['/recipes'])
                        // PROMISE off of .navigate()
                        // https://javascript.info/promise-basics#consumers-then-catch-finally
                        .then(
                            (whatWeGotTF) => {
                            if (whatWeGotTF) {
                                console.log('T ! guess we naviguessed A-O.K.');
                            } else {
                                console.log('F ? guess we navigoofed somehow');
                            }
                        },
                            (errWeGot) => {
                                console.log('errWeGot navigating ', errWeGot);
                                /* Yeah!
                                error: "Permission denied"

                                HttpErrorResponse {headers: HttpHeaders, status: 401, statusText: "Unauthorized", url: ...
                                 */
                            });
                }, // /.subscribe()'s ".next()"
                (errIGot) => {
                    console.error('errIGot ', errIGot);
                    // this.errorToDisplay = errIGot.error.error.message; // moved to Service
                    // this.errorToDisplay = JSON.stringify(errIGot);
                    this.errorToDisplay = errIGot; // JSON biz over on Service now, no longer here in Component. Cheers.
                    // Now this is the error message string only = good, what you want.
                    /*
                    Hmm. JSON.stringify() is good when we send whole [object Object]
                    But it does put double-quotes around it when we just get back a string. Looks little funny, but, acceptable.
                    << However, we did put the kabosh on it. No funny double-quotes, thank you.
                     */

                    /* *********** LECT 313+ ****
                    DYNAMIC COMPONENT for Error Modal Dialog
                    Programmatic etc.

                     */
                    this.myAuthShowErrorAlert(errIGot);

                    this.isLoading = false;
                } // /.subscribe()'s ".error()"
            ); // /.subscribe() itself
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
        // Plain Old DOM Element (e.g. <div>)
        this.errorToDisplay = null;
    }

    myAuthDismissError() {
        // DYNAMIC COMPONENT with *ngIf
        // (simply calls the above method already in place)
        // we have this bit of oddity because we have 2 or 3 ways to do same thing in this "classroom learning code"
        this.dismissErrorToDisplay();
    }

    private myAuthShowErrorAlert(errorMessagePassedIn) {
        // DYNAMIC COMPONENT with PROGRAMMATIC Component creation
        // LECTURE 313
        /*
        Q. When (the H___) does this method get called?
        A. Only when we hit an ERROR upon .subscribing() to the result of
        doing LogIn or SignUp calls to Firebase. Cheers.
         */
        const myAlertCmpFactory = this.myComponentFactoryResolver.resolveComponentFactory(
            AlertComponent
        );
// NOPE        myAlertCmpFactory.create();

        // Just assign the ViewContainerRef we have, to a local variable here:
        const myViewContainerRefHereInHost = this.alertHostPosition.myPutThingHereDirectiveViewContainerRef;
        // https://angular.io/api/core/ViewContainerRef#methods

        /*
        As MAX notes, this ViewContainerRef is not mere "coordinates" of where that container is.
        It is an Object with methods etc.
         */
        myViewContainerRefHereInHost.clear(); // before (re)-using, clear what's there

        const myAlertComponentRef = myViewContainerRefHereInHost.createComponent(myAlertCmpFactory);
        // This ".createComponent()" takes not a type, but a Factory (to make that type)
        // And it returns not a Component, but a "Ref"
        // And that "Ref" in turn has a property to obtain ".instance".
        // And that .instance gets you to methods and properties on your Component! Cheers.

        myAlertComponentRef.instance.alertMessageErrorToDisplay = errorMessagePassedIn;

        // We'll listen for Close/Dismiss button click on the AlertComponent HTML itself:
        // N.B. the Angular EventEmitter is basically a SUBJECT Observable, so, we can .subscribe() to it. Cheers.
        this.dismissCloseMessageSubscription = myAlertComponentRef.instance.myDismissMessageEventEmitter.subscribe(() => {
            this.dismissCloseMessageSubscription.unsubscribe();
            myViewContainerRefHereInHost.clear();
        });
    }

    ngOnDestroy(): void {
        if (this.dismissCloseMessageSubscription) { // Test whether we have one! Muy importante.
            this.dismissCloseMessageSubscription.unsubscribe();
        }
    }
}
