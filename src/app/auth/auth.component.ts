import {Component, OnInit, ComponentFactoryResolver, ViewChild, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import * as fromRoot from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

import { AuthService } from './auth.service'; // no longer: AuthResponseData

import { AlertComponent } from '../shared/alert/alert.component';
import { PutThingHereDirective } from '../shared/put-thing-here/put-thing-here.directive';
import {ClearErrorActionClass, LogInStartEffectActionClass} from './store/auth.actions';
import {StateAuthPart} from './store/auth.reducer';

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
    isEZPassTurnedOff = true; // TODO mebbe - we're turning this off for now (NRGX etc.)

    isLoading = false; // spinner-biz

    /* 2020-03-09
    OLD BUSINESS!
    I'll leave "nowAmReady" at true,
    but introduce a new flag to mean false: "nowAmDoneWith" (!)
    and use that in a key spot or two
    in the morass of Old Business code below.
    Oi!
     */
    nowAmReady = true; // false;
/* Ready to use the Observable here in the Component, as receiving the Service's return (vs. doing the .subscribe() here in the Component).
     */
    nowAmDoneWith = false;

/* No longer using. Now NGRX
    myAuthObservable: Observable<AuthResponseData>; // BOTH log in and sign up
*/
    errorToDisplay: string = null;

    myStoreAuthObservable$: Observable<any>;

    // isLoggedIn = false; // << Presumably, apparently, never used.
    // We determine authenticated state via a User object, not this boolean. See AuthReducer etc.

    @ViewChild(PutThingHereDirective, { static: false }) alertHostPosition: PutThingHereDirective;
    /*
The Type "PutThingHereDirective" doesn't do a lot (it is a "Placeholder," recall).
It simply exposes ('public') a ViewContainerRef. But that is just what we need. Cool.
     */

    dismissCloseMessageSubscription: Subscription;
    storeSelectSubscription: Subscription;

    constructor(
        private myAuthService: AuthService,
        private myRouter: Router,
        private myComponentFactoryResolver: ComponentFactoryResolver,
        // private myPutThingHereDirective: PutThingHereDirective, // << not necessary ?
        private myStore: Store<fromRoot.MyOverallRootState>,
    ) { }

    ngOnInit() {
        this.errorToDisplay = null; // refresh (remove) w re-init component!
        // HMM. MAX CODE does not do this (above). HMM.

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

        // NGRX(Effects) biz here in OnInit() ??? << Nah << Hah! Actually, actually, I was RITE!
        // Max (AT FIRST) does it not here but down in myOnSubmit() - THEN he moves it up to ngOnInit(). cheers.
        /*
        Update. Lect. 372 ~00:51
        Max does NOT assign store.select() onto an Observable$. No. He directly does .subscribe() off the .select(). Bueno.
        But! Now Max does introduce a Subscription (and NgOnDestroy .unsubscribe()). Okay. We'll do that too.
         */
/* No. Did work. Just a WR__ thing
        this.myStoreAuthObservable$ = this.myStore.select(fromRoot.getAuthState);
        this.myStoreAuthObservable$.subscribe( ...
*/
        this.storeSelectSubscription = this.myStore.select(fromRoot.getAuthState)
            .subscribe(
            (authStateWeGot: StateAuthPart) => {
                this.isLoading = authStateWeGot.myIsLoading;
                this.errorToDisplay = authStateWeGot.myAuthError;
                if (this.errorToDisplay) { // (authStateWeGot.myAuthError) { // << yeah worked too
                    this.myAuthShowErrorAlert(`FROM STORE AUTH ERROR BIZ: ${this.errorToDisplay}`);
                    // ${authStateWeGot.myAuthError} // << yeah worked too
                }
            },
            (errWeGotSubscribing) => {
                console.log('errWeGotSubscribing ', errWeGotSubscribing);
            }
        );

    } // /ngOnInit()

    myEZPassLogin() { // TODO mebbe. Turned off for now, maybe for good... t.b.d.
        /*
        Hard-Coded one-click login:
        wednesday@week.com
        asdf99

        This little method a NON-D.R.Y.
        partial repetition of myOnSubmit() below.

        Note: We only get here if this.isLoginMode is true, btw, fwiw.
         */
        this.isLoading = true;

/* While turned off, Comment Out, don't call authService.login() anymore
IF we ever re-jig this, need to make this also use NGRX. cheers.

        this.myAuthObservable = this.myAuthService.logIn(
            {
                'email': 'wednesday@week.com',
                'password': 'asdf99',
            }
        );
*/

/* Comment this out too...
        this.myAuthObservable.subscribe(
            (whatEver) => {
                console.log('whatEver AuthResponseData ', whatEver);
                /!*
                {kind: "identitytoolkit#VerifyPasswordResponse",
                localId: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1",
                email: "wednesday@week.com",
                displayName: "",
                idToken: "eyJhbGciOiJSUzI1NiIsYmU0ZT…TbddaFZngLbpNRhK-T337eMt5ylm9N4KPAWU0FAvjTMZ7UYSQ", …}
                 *!/

                this.myRouter.navigate(['/recipes']);
                // short, sweet. see below for proper full Promise
                // etc. treatment coming off that ".navigate()"

                this.isLoading = false;
            }
        );
*/
    }

    myOnSubmit(formIGot) {
        // Recall: This method does BOTH 1) Sign Up and 2) Log In

        if (!formIGot.valid) {
            // you shouldn't get in here... but just in case
            return; // << tsk, tsk, monsieur Le Hacker!
        }

        this.isLoading = true; // << Prob. is done by NGRX/EFFECTS now yes ?

        console.log('formIGot.value ', formIGot.value);
        // Yeah. {myEmailFormControlName: "necessary2@cat.edu", myPasswordFormControlName: "iamacat3"}

        if (this.isLoginMode) {
/* No Longer using Service. Now NGRX(Effects)
            this.myAuthObservable = this.myAuthService.logIn({
                    'email': formIGot.value.myEmailFormControlName,
                    'password': formIGot.value.myPasswordFormControlName,
                }
*/
            this.myStore.dispatch(new LogInStartEffectActionClass(
                // dispatch does not return an Observable...
                /* TODONE re: Q. How we know when done, or error etc.?
                Seeing as here in the calling Component, we just kind of "fire & forget" it seems...
                A. That logic is over in auth.effects.ts: myAuthLoginStartEffect
                where we .pipe() off the NgRx/Effects ACTIONS$ object:
                OVER IN EFFECTS, we do all this:
                - httpClient POST & Response
                - then dispatch *another* Action (AUTHENTICATE_SUCCESS_ACTION)("SUCCESS")
                - handle catchError() on INNER .pipe()
                - if error, dispatch *another* Action (LOG_IN_FAIL_EFFECT_ACTION)
                - RETURN an Observable w. any error msg. Do NOT throw any Error.
                 */
                {
                    email: formIGot.value.myEmailFormControlName,
                    password: formIGot.value.myPasswordFormControlName,
                }
                )
            );

            // NEW. NGRX(Effects). Note you could omit the Observable variable$ and just directly .subscribe() to the .select(). Cheers.
            // THESE 2 LINES ARE IN NgOnInit() INSTEAD. Bon.
            // this.myStoreAuthObservable$ = this.myStore.select(fromRoot.getAuthState);

            // NEW NGRX(Effects)
/*
            this.myStoreAuthObservable$.subscribe(
                (whatWeGotOkay: StateAuthPart) => { // type? AuthResponseData? no. StateAuthPart
                    console.log(whatWeGotOkay.myAuthError); // ? "error" from login is part of our Auth State
                },
                (errWeGot) => {
                    console.log(errWeGot); // this would be error, in subscribing, or some such
                }
            );
*/

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
            // NGRX/EFFECTS
            this.myStore.dispatch(new AuthActions.SignUpStartEffectActionClass(
                // Recall: .dispatch() does NOT return an Observable... "fire & forget"...
                // See above discussion at login() re: how EFFECTS takes care of logic
                {
                    email: formIGot.value.myEmailFormControlName,
                    password: formIGot.value.myPasswordFormControlName,
                }
            )
            );
/* NO LONGER using AuthService.   Now NGRX/EFFECTS (above)
            this.myAuthObservable = this.myAuthService.signup(
                {
                    email: formIGot.value.myEmailFormControlName,
                    password: formIGot.value.myPasswordFormControlName,
                }
            );
*/
        } else { // We now NEVER get in here. (above else test is TRUE)
            /* 01
            Originally had (still does!) the .subscribe() here, so, can
            *not* assign what's returned to our Observable, no.
            You could assign what's returned to a Subscription (we are not doing
            that here).
             */
/* NO LONGER. Now NGRX etc.
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
                        /!* Woot.
                        authIGot
    kind: "identitytoolkit#SignupNewUserResponse"
    idToken: "eyJhbGciOiJSUzI1NiIsImtp ... T8g5FFwQWtPYg"
    email: "necessary@cat.edu"
    refreshToken: "AEu4IL3Y465BDYz0p1ONYV...bm1ax78PvETNmU"
    expiresIn: "3600"
    localId: "ba6AFJGd5AVdTpiUbnPdRSNoYXt1"
                         *!/
                        this.isLoading = false;
                    },
                    (errIfAny) => {
                        console.log('errIfAny in Component ', errIfAny); // yes, WAS whole HttpErrorResponse {}
                        /!*
                        errIfAny in Component  HttpErrorResponse {headers: HttpHeaders, status: 404, statusText:
                        "Not Found", url: "https://foobarw
                         *!/
                        // this.errorToDisplay = errIfAny.error.error.message;
                        this.errorToDisplay = errIfAny; // NOW this is the error essage string only = good, what you want.
                        this.isLoading = false;
                    }
                );
*/
        }

        /*
        if (this.nowAmReady) {
*/
        if (this.nowAmDoneWith) { // 2020-03-09 We now turn this OFF (false)
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

// ********** COMMENT OUT  ********************************
/*
            this.myAuthObservable.subscribe( // << We don't want to trigger this .subscribe anymore. see 'false' above
                (whatIGot) => {
                    console.log('whatIGot ', whatIGot); // yes
                    /!* N.B. This is just "AuthResponseData" - NOT a User (object)
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
                     *!/
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
                                /!* Yeah!
                                error: "Permission denied"

                                HttpErrorResponse {headers: HttpHeaders, status: 401, statusText: "Unauthorized", url: ...
                                 *!/
                            });
                }, // /.subscribe()'s ".next()"
                (errIGot) => {
                    console.error('errIGot ', errIGot);
                    // this.errorToDisplay = errIGot.error.error.message; // moved to Service
                    // this.errorToDisplay = JSON.stringify(errIGot);
                    this.errorToDisplay = errIGot; // JSON biz over on Service now, no longer here in Component. Cheers.
                    // Now this is the error message string only = good, what you want.
                    /!*
                    Hmm. JSON.stringify() is good when we send whole [object Object]
                    But it does put double-quotes around it when we just get back a string. Looks little funny, but, acceptable.
                    << However, we did put the kabosh on it. No funny double-quotes, thank you.
                     *!/

                    /!* *********** LECT 313+ ****
                    DYNAMIC COMPONENT for Error Modal Dialog
                    Programmatic etc.

                     *!/
                    this.myAuthShowErrorAlert(errIGot);

                    this.isLoading = false;
                } // /.subscribe()'s ".error()"
            ); // /.subscribe() itself
*/

            // ********** /COMMENT OUT  ********************************
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
        /* Lect. 372 ~01:13
        MAX Code calls onHandleError()
             this.error = null;

         Point is, this method here in Component
         now is duplicating State Management
         that we prefer to be all w. NGRX.
         Time to create (yet another) Action: CLEAR_ERROR
         */

        this.myStore.dispatch(new ClearErrorActionClass());

        // Plain Old DOM Element (e.g. <div>)
/* No longer like so. NGRX instead
        this.errorToDisplay = null;
*/
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

        if (this.storeSelectSubscription) {
            // We really do expect to have this subscription, but can't hurt to do the "if" check
            this.storeSelectSubscription.unsubscribe();
        }
    }
}
