import { User } from '../user.model';
/* Recall/Convenience:
        public email: string,
        public id: string, // Firebase item ID (on the user)
        private _token: string,
        private _tokenExpirationDate: Date,

Also: a GETter():   token()
*/

import * as fromAuthActions from './auth.actions';

export interface StateAuthPart {
    /*
N.B. Authenticated? t/f y/n
- This app (Recipes) uses a *** User object ***
to signify authenticated state
 Q. Is there a User object ("truthy")?
 A. If yes, auth state is true.
/Users/william.reilly/dev/Angular/Udemy-Angular5-MaxS/2019/WR__/prj-recipes-wr2/src/app/auth/store/auth.reducer.ts

- Contrast the Fitness Tracker app which uses *** boolean ***
re: authenticated state (is logged in: Y/N T/F)
/Users/william.reilly/dev/Angular/Udemy-AngularMaterial-MaxS/2019/WR__2/fitness-tracker-wr3/src/app/auth/auth.reducer.ts
 */
    myAuthedUser: User;
    myAuthError: string; // new bit of state, now w. ngrxEffects re: Login Fail Lect. 368
    myIsLoading: boolean; // another bit of (U/I) state; perhaps temporarily here in AuthReducer
}

const initialStateAuthPart: StateAuthPart = {
    myAuthedUser: null,
    myAuthError: null, // no error, to begin
    myIsLoading: false,
};

export function authReducer(
    ngrxState: StateAuthPart = initialStateAuthPart,
    ngrxAction: fromAuthActions.AuthActionsUnionType
): StateAuthPart {

    console.log('ngrxState in AUTH ', ngrxState);

    switch (ngrxAction.type) {
        case fromAuthActions.LOG_IN_START_EFFECT_ACTION:
        case fromAuthActions.SIGN_UP_START_EFFECT_ACTION:
            // above 2 lines example of switch/case "fall-through" - both use same logic:

            // '[Auth] Login Start Effect Action':
            // Kinda pass-through simply, to "Start"...
            return {
                ...ngrxState,
                myAuthError: null, // reset if need be
                myIsLoading: true, // !!
            };
            // break;

        case fromAuthActions.LOG_IN_FAIL_EFFECT_ACTION:  // '[Auth] Login Fail Effect Action':
            // Nullify any User since we did fail...
            return {
                ...ngrxState,
                myAuthedUser: null,
                myAuthError: ngrxAction.myPayload, // error string IS payload
                myIsLoading: false,
            };
            // break;

        case fromAuthActions.AUTHENTICATE_SUCCESS_ACTION: // "Success" could be named
/* No. Not "copying" out of the gate here. Hold onto your horses. (The "copy" gets done on that "..." spread operator below)
            // 1. MAKE A COPY! << Nah
            const myStateToBeUpdatedACopyObjectViaAssign: StateAuthPart = ngrxState; // { myAuthedUser: null };
            Object.assign(myStateToBeUpdatedACopyObjectViaAssign, ngrxState); // << State passed in, in Action!
            << NO that is not right. ngrxState is the Store State. Not any "passed-in" state.
*/
            // tslint:disable-next-line:max-line-length
            // console.log('TYPEOF ?? AUTHENTICATE_SUCCESS_ACTION ngrxAction.myPayload: ', typeof ngrxAction.myPayload); // object << hmm, not that useful. doesn't tell me "User"  o well.
            console.log('AUTHENTICATE_SUCCESS_ACTION ngrxAction.myPayload: ', ngrxAction.myPayload);
            /* Looks good:
            User {email: "wednesday@week.com",
            id: "hLzaGHeZUzPG8Stsp1YyGYFGU4z1",
            _token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBlYTNmN2EwMjQ4YmU0ZT…Z0x82U-bYZizdUlMeYA2EtMqMjWVDhC-Xkyx2gy5bmpofKKcA",
            _tokenExpirationDate: Wed Feb 26 2020 17:57:43 GMT-0500 (Eastern Standard Time)}
             */
            /*
            N.B. Instructor code does a new User() with all the 4 properties
            const userToUpdateWith = new User({ email: ngrxAction.myPayload.email,  ...});
            return { ...ngrxState, myAuthedUser: userToUpdateWith };
             */

            /*
            OK I too will now new up a User() object here in the Reducer,
            to return as the 'myAuthedUser'
             */

            const newedUpUserToReturn: User = new User(
                ngrxAction.myPayload.email,
                ngrxAction.myPayload.id,
                ngrxAction.myPayload._token,
                ngrxAction.myPayload._tokenExpirationDate
            );

            return {
                ...ngrxState, // << presumably the whole App State (a "..." copy now = good)
/* NO LONGER USED:
                myAuthedUser: ngrxAction.myPayload, // << we modify that state via the ACTION's PAYLOAD. Cheers.
*/
                myAuthedUser: newedUpUserToReturn,
                /* A "MAX" note: if your property name and your variable name do match
                (like most software developers do this), then you can use a shorthand:
                return {
                   ...state, // << more typical naming convention too
                   user // << shorthand, for  user: user     very nice
                }

                 */
                myAuthError: null, // << reset
                myIsLoading: false,
            };
        /*
LECT. 381
>> redirectUponLogin: boolean <<
Just to note it:
Apparently (MAX Code) we do *NOT* add this new property, above,
that is now on the Action "AUTHENTICATE_SUCCESS_ACTION",
to anything here on the AuthReducer "case" for that action.

Note that we *DO* use it in the AuthEffects file.
*/


/* Um, I Don't Think So:

            return {
                ...ngrxState,
                // isLoggedIn: true, // << Nope, not boolean
                myAuthedUser: myStateToBeUpdatedACopyObjectViaAssign.myAuthedUser // myPayload.value,
                // TODOnope << temporarily just use null
            };
*/

        case fromAuthActions.LOG_OUT_ACTION:
            return {
                ...ngrxState,
                myAuthedUser: null, // SET to null. Done.
                myAuthError: null, // reset
            };

        case fromAuthActions.CLEAR_ERROR_ACTION:
            return {
                ...ngrxState,
                myAuthError: null, // clear it
            };

        default:
            // do nada
/*
            return {
                ...ngrxState // << No!  not a "copy" here on the default. Lect. 363 ~02:05
            };
*/
            return ngrxState; // << YES.

    } // /switch()

} // /authReducer()

export const getIsAuthenticatedFromStateAuthPart = (statePassedIn: StateAuthPart): boolean => {
    return !!statePassedIn.myAuthedUser; // '!!' convert Object to boolean. What You Want.
};
