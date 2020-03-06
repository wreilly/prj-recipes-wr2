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
N.B. This app (Recipes) uses a *** User object ***
to signify authenticated state
(is there a User object? if so, auth state is true)
/Users/william.reilly/dev/Angular/Udemy-Angular5-MaxS/2019/WR__/prj-recipes-wr2/src/app/auth/store/auth.reducer.ts

Contrast the Fitness Tracker app which uses *** boolean ***
re: authenticated state (is logged in: Y/N T/F)
/Users/william.reilly/dev/Angular/Udemy-AngularMaterial-MaxS/2019/WR__2/fitness-tracker-wr3/src/app/auth/auth.reducer.ts
 */
    myAuthedUser: User;
}

const initialStateAuthPart: StateAuthPart = {
    myAuthedUser: null,
};

export function authReducer(
    ngrxState: StateAuthPart = initialStateAuthPart,
    ngrxAction: fromAuthActions.AuthActionsUnionType
): StateAuthPart {
    console.log('ngrxState in AUTH ', ngrxState);
    switch (ngrxAction.type) {

        case fromAuthActions.LOG_IN_ACTION:

/* No. Hold onto your horses. (The "copy" gets done on that "..." spread operator below)
            // 1. MAKE A COPY! << Nah
            const myStateToBeUpdatedACopyObjectViaAssign: StateAuthPart = ngrxState; // { myAuthedUser: null };
            Object.assign(myStateToBeUpdatedACopyObjectViaAssign, ngrxState); // << State passed in, in Action!
            << NO that is not right. ngrxState is the Store State. Not any "passed-in" state.
*/
            console.log('TYPEOF ?? LOG_IN_ACTION ngrxAction.myPayload: ', ngrxAction.myPayload);
// TODO            typeof (ngrxAction.myPayload) === User;
            console.log('LOG_IN_ACTION ngrxAction.myPayload: ', ngrxAction.myPayload);
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

            return {
                ...ngrxState, // << presumably the whole App State (a "..." copy now = good)
                myAuthedUser: ngrxAction.myPayload, // << we modify that state via the ACTION's PAYLOAD. Cheers.
                /* A "MAX" note: if your property name and your variable name do match
                (like most software developers do this), then you can use a shorthand:
                return {
                   ...state, // << more typical naming convention too
                   user // << shorthand, for  user: user     very nice
                }

                 */
            };
/* Um, I Don't Think So:

            return {
                ...ngrxState,
                // isLoggedIn: true, // << Nope, not boolean
                myAuthedUser: myStateToBeUpdatedACopyObjectViaAssign.myAuthedUser // myPayload.value, // TODO << temporarily just use null
            };
*/

        case fromAuthActions.LOG_OUT_ACTION:
            return {
                ...ngrxState,
                myAuthedUser: null, // SET to null. Done.
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
