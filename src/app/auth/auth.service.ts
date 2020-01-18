import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject, throwError} from 'rxjs'; // No longer Subject; not using ObservableInput
import {User} from './user.model';
import { RecipeService } from '../recipes/recipe.service';

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
    // Q. Why? A. To obtain that initial value *immediately*
    // userSubject$ = new Subject<User>(); // << Nope.
    userSubject$ = new BehaviorSubject<User>(undefined); // must initialize. null'll do.  (Hmm, undefined ? yep it's okay too)


/* Just notes on what's in a User:
    email: string,
    id: string,
    _token: string,
    _tokenExpirationDate: Date,
*/

    private myTimeoutId: number; // for autoLogOut()

    constructor(
        private myHttpClient: HttpClient,
        private myRouter: Router,
        private myRecipeService: RecipeService,
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

    autoLogIn() { // Called at start: AppComponent - so, any browser reload any point in site comes through here ... (am purty sure)

        // Check LOCALSTORAGE for myUserData! If so, then we're good to go! (who knew?)

        if (localStorage.getItem('myUserData') === null) {
            console.log('No myUserData in localStorage!');
            return;
        }

        if (localStorage.getItem('myUserData') !== null) {
            const heyWeAreLoggedInUserDataString: string = localStorage.getItem('myUserData');
            console.log('heyWeAreLoggedInUserDataString ', heyWeAreLoggedInUserDataString);
            /*
            email: "necessary@cat.edu"
    id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
    _token: "eyJhbG...CNywVQ"
    _tokenExpirationDate: "2020-01-05T14:39:34.039Z"
             */
            const loggedInUserObjectLiteral: {
                /* N.B. Object literal, obtained via JSON.parse()
                The "date" here is still just a string.
                (We make to a Date further below, when we new User() a real User Object, vs. this sort of interim Object literal. cheers.
                */

                // Let's explicitly show the Type we get,
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
                loggedInUserObjectLiteral.email,
                loggedInUserObjectLiteral.id,
                loggedInUserObjectLiteral._token,
                new Date(loggedInUserObjectLiteral._tokenExpirationDate)
            );
*/

            const thisHereAutoLogInUser = new User(
                loggedInUserObjectLiteral.email,
                loggedInUserObjectLiteral.id,
                loggedInUserObjectLiteral._token,
                new Date(loggedInUserObjectLiteral._tokenExpirationDate)
            );

            console.log('thisHereAutoLogInUser ', thisHereAutoLogInUser);
            /*
            Good. I have test situation here where:
             There IS localStorage user,
             but,
             The token is EXPIRED (12/Jan/20 - today is 13/Jan/20).
            Bueno.
            We are Not Logged In (correct-a-mundo)
             */

            if (thisHereAutoLogInUser.token) {
                /*
                Now that we've got a real User object, we get the .token GETTER. Cheers.
                And, we (below) use the result from that .token GETTER,
                to simply determine whether the token that the localStorage
                 User has is still valid ("live") or not
                If still good (not older than 3,600 seconds = 1 hour),
                then we are good to go.
                If token is too old, user will NOT get AutoLogIn and has to
                do regular Log In.

                Q. I guess question I have is: hmm, if say 56 minutes
                were gone on that hour,
                does this AutoLogin only then last you say 4 minutes more ????
                A. Thass right. We measure how much time left.
                Will be less than 60, but needs to still be positive number
                if User is going to be "Auto-Logged(Back)-In".
                (Were it negative number, that means it's over 60 minutes
                 old and INVALID. Cheers.

                Hmm: We save the exact same User data back in to localStorage,
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

                // AUTOLOGOUT Setup:
                // Set that hour-long time going...
                /*
                Bit more involved here in AutoLogIn (vs. user manual LogIn),
                 to get the correct "expiresIn" number figure:

                "Here's the deal" -

                From localStorage, we got as a String,
                the _tokenExpirationDate: string;
                e.g. "2020-01-06T12:53:34.039Z"

                That value we then used in new Date() to
                get a real Date object for our new User():
                thisHereAutoLogInUser._tokenExpirationDate

                So, that has a Date(time) for token expiration. Great.

                We now need a number of seconds (milliseconds)
                from, well, *now* to then, that date/time of token expiration.

                Arithmetic:
                The "then" of token expiration (presumably later) - now = some positive number
                (The .getTime() gives you back milliseconds, btw.)
                 */
                let expirationDurationFromLocalStorageFigure: number;
                expirationDurationFromLocalStorageFigure = new Date(loggedInUserObjectLiteral._tokenExpirationDate)
                    .getTime() - new Date()
                    .getTime();

                console.log('01 then ', new Date(loggedInUserObjectLiteral._tokenExpirationDate).getTime());

                console.log('02 now ', new Date().getTime());

                console.log('AutoLogIn - expirationDurationFromLocalStorageFigure ', expirationDurationFromLocalStorageFigure);

                console.log('03 diff? ', new Date(loggedInUserObjectLiteral._tokenExpirationDate)
                    .getTime() - new Date()
                    .getTime());

                /*
01 then  1578336832852
02 now  1578333486313 ~= 50.048 years since 01/Jan/1970 (Unix Epoch) - Exact-a-mundo!

.getTime(): NOW (06/Jan/2020)
1578333486313 / 1000 / 60 / 60 / 24 / 365 ~= 50.048 years
                 ^     ^     ^   ^     ^
              millis  secs mins hours  days/year

AutoLogIn - expirationDurationFromLocalStorageFigure  3346540
03 diff?  3346538
autoLogOut expirationDuration  3346540 ~= 55.8 minutes
3346538        / 1000 / 60  ~= 55.8 minutes
                  ^     ^
                millis  secs

                 */

                this.autoLogOut(
                    expirationDurationFromLocalStorageFigure
                    // e.g. 3346540 ~= 55.8 minutes (something less than 60 mins)
                );

            }
        }
    } // /autoLogIn()

    logOut() {
        this.userSubject$.next(null);
        // Maybe do navigate here too; for now, over on HeaderComponent y not
        this.myRouter.navigate(['/auth'])
            .then(goodOrBad => console.log(goodOrBad)); // e.g. true
        localStorage.removeItem('myUserData');
        if (this.myTimeoutId) {
            clearTimeout(this.myTimeoutId);
        }
        this.myTimeoutId = null;
        // Even if there was no timer, just set to null anyway

        /*
        One more thing to do (not so intuitive):
        Clear the LOCAL Recipe[].
        Q. Why?
        A. So that the user experience is consistent.
        - necessary@cat.edu logs in, fetches Recipes from Canonical Firebase, good.
        - Logs out, okay.
        - Does NOT refresh/reload page/app.
        - Logs in again - **the Recipes are already there** - from LOCAL.
        - Possible that those LOCAL are STALE, not up to date, not Canonical ("of record").
        Improvement: Require/force user to Fetch Recipes anew, upon new LogIn.
         */
        this.myRecipeService.setRecipes([]); // << CLEAR/EMPTY the Local Recipe[], upon LogOut.

    } // /logOut()

    autoLogOut(expirationDuration: number) { // milliseconds e.g. 3600 * 1000 = one hour
        console.log('autoLogOut expirationDuration ', expirationDuration); // 3,600,000 one hour
        this.myTimeoutId = setTimeout(
            () => {

                /* Lect. 335 Loading Services Differently etc.
                New wild & crazy idea.
                || Warn user: About to log out. ||

                Okay, but, it may be I am not handling
                something about the Auth Token at that point??
                'message: "Http failure response for https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json?auth=null: 401 Unauthorized"
error:
error: "Could not parse auth token."'
                 */

                const whatTheySaid = confirm('You have been inactive for ' + expirationDuration / 1000 + ' seconds. About to log you out.')
                if (whatTheySaid) {
                    this.logOut();
                } else {
                    alert('okay, another bloody hour, but that is it, pal.');
                    this.autoLogOut(3600 * 1000); // another hour // (10000) ten seconds for testing
                    // actually of course they can re-up for another hour as many times as they like...
                }
            },
            expirationDuration // 10000 << test it for 10 seconds = PASS
        );
    }

    private handleAuthentication(
        // I'd first done without *Typing* these incoming params, but better to do with. Cheers.
        email: string,
        userLocalId: string,
        token: string,
        expiresIn: number, // 3600 << don't forget, elsewhere, as you call this method, to '+' passed-in string to numberify!
    ): void { // << no return. instead uses .next(), on our userSubject$ ...

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

        // Here upon (non-Auto) regular user LogIn (SignUp too), be sure to set that hour-long timer going for "autoLogOut"...
        // It'll be for the default (Firebase) 3,600 seconds (an hour)
        this.autoLogOut(expiresIn * 1000);
        /* seconds vs milliseconds! 60 * 60 = 3,600 seconds in an hour,
                        * 1000 milliseconds = 3,600,000 in an hour
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
