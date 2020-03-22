import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
// import { tap } from 'rxjs/operators'; // No longer
/* ? Not used
import { HttpClient } from '@angular/common/http';
*/

import { Store } from '@ngrx/store';
import * as fromRoot from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipe.actions';

import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { LoggingService } from '../logging.service';
import {take, tap} from 'rxjs/operators';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {

  /*
  Hmm. re: below - MAX Instructor code does NOT make this NGRX.
  Just mere Boolean. Hmm!
   */
    isAuthenticated = false; // << Before just Boolean // << What Max uses simply

    // isAuthenticatedInStore$: Observable<boolean>; // << Now with NGRX
  // << I'm having challenges getting this to work. hmm. TODO 2020-03-04-0606

  myAuthUserSub: Subscription;
  // myHttp = new HttpClient(); // << Nope
  userEmailToDisplay: string;

  constructor(
      private myDataStorageService: DataStorageService,
/* ? Not used << WAS used for little one-off test call "SendBitOText()" << done w that
      private myHttpClient: HttpClient,
*/
      private myAuthService: AuthService,
      private myLoggingService: LoggingService,
      private myStore: Store<fromRoot.MyOverallRootState>,
  ) { }

  ngOnInit(): void {

    /* NEW: NGRX - Now replaces AuthService Subject for isAuthenticated
    01 (NOW WRONG I see) << NOT USING
    Below I first tried plain Boolean (attempt 02 is on an Observable<boolean>)
    But the notes below do show the "double-bangs" !! to get to a plain Boolean, fwiw.

    Both lines below work (bon).
    Recall: double-bangs !!
    - turn a non-Boolean truth-y (an Object, say) into Boolean true,
    - and non-Boolean false-y (null, etc.) into Boolean false.

    Here, what we get back, "fromRoot.."
    StateAuthPart = { myAuthedUser: { some User object, if we are logged in } };
     */
    // this.isAuthenticated = !!this.myStore.select(fromRoot.getAuthState);  // Yes (I think) << yeah worked to get you a Boolean anyway
    // this.isAuthenticated = !!this.myStore.select('authPartOfStore'); // Yes (I think) << yeah worked to get you a Boolean anyway

      /*
      NGRX 02 - Observable<boolean>
       */

/* No. This simple "assignment" gets the right value once, but doesn't update.

    this.isAuthenticated = !!this.myStore.select(fromRoot.getIsAuthenticatedInStore);

    // Above returns an Observable<boolean>. The double-bangs makes that a boolean. Good.
*/

/* Hmm, not a Subscription ... ?
    this.myAuthUserSub = this.myStore.select(fromRoot.getIsAuthenticatedInStore)
*/
    this.myAuthUserSub = this.myStore.select(fromRoot.getIsAuthenticatedInStore)
        .pipe(
            tap(
                (whatWeGotTapping) => {
                  console.log('whatWeGotTapping boolean be: ', whatWeGotTapping); // e.g. true
                  this.isAuthenticated = whatWeGotTapping;
                }
            )
        )
        .subscribe(
            (whatWeGotSubscribing) => {
              console.log('whatWeGotSubscribing boolean be: ', whatWeGotSubscribing);
              this.isAuthenticated = whatWeGotSubscribing;
            }
        );

/* Not doing NGRX for isAuthenticated itself...
    this.isAuthenticatedInStore$ = this.myStore.select(fromRoot.getIsAuthenticatedInStore);
*/
/* TODO TEMPORARILY CHOP ALL THIS OFF
        .pipe(
            take(1),
            tap(
                (authStatePartWeGot) => {
                  /!*
              LOGGING SVC - Hmm, not being seen. Hmm.
               *!/
                  this.myLoggingService
                      .printLog(`NGRX - HeaderComponent says ${JSON
                          .stringify(authStatePartWeGot.myAuthedUser)} regarding isAuthenticated.`);
                  /!* yep:
                  {"email":"necessary@cat.edu","id":"hMv51L1tHof1paEgJe9ZEjUVhH82","_token":" ...
                  *!/

                  this.userEmailToDisplay = authStatePartWeGot.myAuthedUser.email;
                }
            )
        );
*/

/* yeah works but below is terser/better
    this.myAuthService.userSubject$.subscribe(
        (userWeGot) => {
          if (userWeGot) {
            this.isAuthenticated = true;
          }
        }
    );
*/
/* yeah works but below is even terser/better
    this.myAuthService.userSubject$.subscribe(
        userWeGot => {
          // this.isAuthenticated = userWeGot ? true : false; // yes works.
          this.isAuthenticated = !!userWeGot; // Yeah. Opposite of the opposite. It's what you want.
        }
    );
*/
// Tersest, bestest:
/* WORKED. But now NGRX (above)
    *********************************************

    this.myAuthUserSub = this.myAuthService.userSubject$.subscribe(userWeGot => {
      // console.log(userWeGot); // hmm, hitting undefined (when not logged in, but do have localStorage user. hmm)
      this.isAuthenticated = !!userWeGot;
      if (userWeGot) {
        console.log('userWeGot ', userWeGot);

        /!*
        LOGGING SVC
         *!/
        this.myLoggingService.printLog(`HeaderComponent says ${JSON.stringify(userWeGot)} regarding isAuthenticated.`);
        /!* yep:
        {"email":"necessary@cat.edu","id":"hMv51L1tHof1paEgJe9ZEjUVhH82","_token":" ...
        *!/

        this.userEmailToDisplay = userWeGot.email;
      }
    });
    *********************************************
*/
    /*
    See also: WR__ comment re: .subscribe() doing immediate Execution of its .next(),
    like we see it do here above, also an example seen
    over in AuthService.myOnSubmit() re:
    this.myAuthObservable.subscribe(
                (whatIGot) => {
                    console.log('whatIGot ', whatIGot);

     https://angular.io/guide/observables#subscribing
     */
  }

/* Done w this little test function

  sendBitOText(bitOText) {
  // TODONE 20191221-0802 refactor the HTTP biz here to DataStorageService (basically, this is superseded by sendData(). Cheers.
    console.log('Header sendData', bitOText);
    const bitOJSON = { stuff: bitOText };
    this.myHttpClient.post('https://wr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json',
        bitOJSON)
        .subscribe(whatWeGot => {
          console.log(whatWeGot);
        // yep: {name: "-LwV2qXv_l5ZkrnGjKfj"}
        });
  }
  */

  sendData() {
    this.myDataStorageService.storeRecipes(); // fire & forget
    // Update: storeRecipes() on Service has no 'return' in MAX Code. Hmm.
    /* N.B. storeRecipes() "returns" a Subscription, but the called method does
    its own .subscribe() over in that Service,
    so from this vantage (calling Component), nothing "comes back". MBU.
    */
  }

  fetchData() {

      this.myStore.dispatch(new RecipesActions.FetchRecipesEffectActionClass());

/* No Longer Used! Now NgRx (above)
    this.myDataStorageService.fetchRecipes().subscribe(); // round and round
*/

    /* Now this .subscribe() is needed here again, on the calling Component.
    Hmm. See also how the RecipesResolverService invokes .fetchRecipes().
    That one does NOT use .subscribe(), but, it DOES have a 'return' on it. Hmm.
    */
/*
    this.myDataStorageService.fetchRecipes(); // WAS
*/
    // See Comment just below. .subscribe() is in Service instead
/* Hmm, maybe for consistency ( ? ) I'll move the .subscribe() to the Service,
not this calling Component (that doesn't do anything with what's returned anyway).
So: Also "fire & forget" from here. Cheers.

No Longer:
    this.myDataStorageService.fetchRecipes().subscribe(); // << kinda benign noop .subscribe() cheers
*/
    // 03 Now with Resolver biz we changed data service so yeah now we gotta trigger from here w .subscribe()
    // WAS:  fire & forget
        // 02 NOW 1) Service does do .subscribe(). Also, the Service method returns void, so, we don't do .pipe() here either. Cheers.
        // 01 WAS N.B. The Service method does not do '.subscribe()'. Va bene.
        /*
        .pipe(
            tap(
                whatWeGot => {
                  console.log('whatWeGot ', whatWeGot);
                }
            )
        ); // /.pipe()
        */
        // .subscribe();
      // 02 NOW dropping .subscribe() here.
    /* 01 So far at least I do need to "trigger" from here
      in the Component with this otherwise kind of
      useless (here) '.subscribe()'
      Go over to Service to see how/where/why the action
      happens (heading to RecipeListComponent with help
      from RecipeService).
      Cheers.
     */
  } // /fetchData()

  myLogout() {
    // simply take care of local boolean right here:
    this.isAuthenticated = false;
/* No longer to Service (NGRX Effects instead)

    this.myAuthService.logOut(); // Service attends to other things...
*/
      this.myStore.dispatch(new AuthActions.LogOutActionClass());
  }

  ngOnDestroy(): void {
    this.myAuthUserSub.unsubscribe();
  }

}
