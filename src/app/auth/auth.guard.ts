import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map, tap, take} from 'rxjs/operators';
import {Injectable} from '@angular/core';

import {AuthService} from './auth.service';
// import {User} from './user.model'; // Not used

import { Store } from '@ngrx/store';
// import { MyOverallRootState } from '../store/app.reducer'; // << nah. see following line
import * as fromRoot from '../store/app.reducer'; // << Q. don't we want this '*' biz? A. Yeah, believe so


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private myAuthService: AuthService,
        private myRouter: Router,
        private myStore: Store<fromRoot.MyOverallRootState>,
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
/* No longer. Now NGRX Store for Auth info
        return this.myAuthService.userSubject$
*/
/* No. You're doing it wrong ... (I hadn't (yet) done import {Store} from @ngrx/store etc. So I was way off.)
        return this.myStore.authPartOfStore.myAuthedUser
*/
        // YES! return this.myStore.select('authPartOfStore') // YES << recall: { myAuthedUser: User; }
        return this.myStore.select(fromRoot.getAuthState) // YES << recall: { myAuthedUser: User; }
            .pipe(
                take(1), // avoid re-running, keeping live subscription. Just one value, pls.
/*                map( // One more map() slipped in, to obtain the property off the state object:
                    (authStateWeGotFromStore) => {
                        return authStateWeGotFromStore.myAuthedUser;
                    }
                ),
                Next line below is equivalent to above, in a "OneLiner". The 'return' is implied. Gwoovy.
                */
                map(authStateWeGotFromStoreOneLiner => authStateWeGotFromStoreOneLiner.myAuthedUser),
                map( // now this 2nd map() just handles the property, myAuthedUser. cheers.
                    (authedUserStateWeGot) => { // Q. hmm, how to TYPE this State here? just curious. Not needed apparently. Ok

                        const isAuth = !!authedUserStateWeGot;

                        if (isAuth) {
                            return true; // We're done!
                        }

                        // Uh-oh - not isAuth - need UrlTree to re-route 'em
                        return this.myRouter.createUrlTree(['/auth']);

                        /*
Double Bangs !! means:
- if true(-ish) e.g. we DO have a User object --> "!!" makes it Boolean true
- if false(-ish), e.g. for authStateWeGot it's undefined or null --> "!!" makes it Boolean false

Max transcript ~03:59
"So we get our user and we want to return true or false, so we can simply return
!!user
which is that trick which converts a true-ish value, like an object,
so anything that is not null or undefined, to true,
so to a real boolean

or that converts false-ish value like null or undefined to a true boolean,
so to false in this case.

So now we have an observable that really will return true or false"
*/
                    }
                ), // /map()
                tap(
                    /*
                    Old-y Fashioned Way (before doing UrlTree above)
                     */
                    (isAuth) => {
                        if (!isAuth) { // << Mind the bang! (no forgetty-poo!)
                            // User is NOT Authenticated = No Go
                            console.log('9999 do we get here ? ');
                            /* No, not now that map() above does return UrlTree. Seems to stop it advancing to this tap(). Okay. MBU.
                             */
                            this.myRouter.navigate(['/auth'])
                                .then(fulfilled => console.log(fulfilled)); // e.g. true
                        }
                    }
                ) // /tap()
            ); // /.pipe()
    }
}
