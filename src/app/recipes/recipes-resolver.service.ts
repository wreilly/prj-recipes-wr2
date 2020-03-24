import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
import { Observable, of } from 'rxjs'; // <<< Nah. << seems to need?
import {take, map, tap, switchMap} from 'rxjs/operators';
import {DataStorageService} from '../shared/data-storage.service';
import {RecipeService} from './recipe.service';

import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects'; // LECT. 380 ~10:04
import * as fromRoot from '../store/app.reducer';
import * as RecipesActions from './store/recipe.actions';
import { RecipeEffects } from './store/recipe.effects'; // << Hmm. not used (by MAX) (or ME) hmm
import {StateRecipePart} from './store/recipe.reducer';

@Injectable({
    providedIn: 'root',
})
export class RecipesResolverService implements Resolve<Recipe[]> { // MAX CODE/APPROACH

    constructor(
        private myDataStorageService: DataStorageService,
        private myRecipeService: RecipeService,
        private myStore: Store<fromRoot.MyOverallRootState>,
        private myRecipesEffectsActions$: Actions, // using NgRx/Effects in another, non-Effects class. bueno
    ) { }

/* */
    // private something$: Observable<A>; // testing around. not used.
    // tslint:disable-next-line:max-line-length
    myResolveTestDispatchOnlyTemp(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
        console.log('Recipes Resolver, people! route: ActivatedRouteSnapshot y not ', route);
        console.log('Recipes Resolver, people! state: RouterStateSnapshot y not ', state);

/*  ****  No, no, you cannot put this "set up listener" up here *above* the .dispatch(). No. *****
        // return this.myRecipesEffectsActions$
        // this.something$: Observable<fromRoot.getRecipeState> =  this.myRecipesEffectsActions$
        // this.something$: Observable<'StateRecipePart'> =  this.myRecipesEffectsActions$
        // this.something$: Observable<any> =  this.myRecipesEffectsActions$
        this.myRecipesEffectsActions$
            .pipe(
                ofType(RecipesActions.SET_RECIPES_EFFECT_ACTION),
                take(1),
            );  // /.pipe()
   ********************************************************************
*/

                            // "Fetch" recipes from Firebase
 // Note: Same line the AppHeaderComponent uses on "Fetch Data" button click
                            this.myStore.dispatch(new RecipesActions.FetchRecipesEffectActionClass());

/*  ****  No, no, you cannot COMMENT OUT the Effect/Action  Pipe to handle (and return!!!)
         the Recipe[] we need to satisfy this resolve() function No.  ********* */
                            return this.myRecipesEffectsActions$.pipe(
                                ofType(RecipesActions.SET_RECIPES_EFFECT_ACTION),
                                take(1),
                            );  // /.pipe()
/*   ********************************************************************
*/
    } // /myResolveTestDispatchOnlyTemp() {} // 03 with NO this.actions$.pipe(ofType(SET_RECIPES))

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
/*
    myPart10ResolveWorks(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
*/
        console.log('Recipes Resolver, people! route: ActivatedRouteSnapshot y not ', route);
        console.log('Recipes Resolver, people! state: RouterStateSnapshot y not ', state);

        // "Fetch" recipes from Firebase
        // Note: Same line the AppHeaderComponent uses on "Fetch Data" button click
        this.myStore.dispatch(new RecipesActions.FetchRecipesEffectActionClass());

        // Set up a listener, for the "Set Recipes" action
        /* Note: Interestingly (!), this next line here in Resolver,
        is same line as in Effects file. It sets up a listener. Interesting.
        So, that is, this next line is NOT immediately invoked or run,
        RIGHT AFTER (it is NOT) the line above re: dispatch(Fetch). Nope.

        But, when if finally DOES get invoked, this Resolver DOES do
        the "Set Recipes" Action, which does put the payload on the Store. Bueno.

        Q. When is it, that it "finally gets invoked", you ask?
        A. Well, the line above, to dispatch(Fetch) CONTAINS WITHIN IT the
        eventual CALL to do the dispatch(SetRecipes) !
        The Fetch awaits the completion/return of the "effect" of going out
        over HTTP to get data; when that data has returned, that code (inside
        the Fetch Effect) in turn invokes the dispatch(Set Recipes).

        And, our Resolver here has set up a listener that hears it and
        processes it and returns the Recipe[], to go onto the Store
        "ta-da"
        oi
        cheers
         */
        return this.myRecipesEffectsActions$.pipe(
            ofType(RecipesActions.SET_RECIPES_EFFECT_ACTION),
            // when recipes are set,
            take(1),
            tap( // << WR__ addition, for bit of logging inspection
                /* Hmm, I thought to try typing in light of what I see in the console.log() below.
                I was WRONG apparently.
                                                    (whatWeGot: RecipesActions.SetRecipesEffectActionClass) => { // : Recipe[] ??

                    ERROR in src/app/recipes/recipes-resolver.service.ts(35,29):
                        error TS2322: Type 'Observable<SetRecipesEffectActionClass>'
                   is not assignable to type 'Recipe[] | Observable<Recipe[]> | Promise<Recipe[]>'.
                */
                (whatWeGot: Recipe[]): Observable<Recipe[]> => { // : Recipe[] ??
                    /* Curious. 'whatWeGot' doesn't LOOK like just Recipe[]
                    // Looks like Object, w myPayload, and type.
                  // But, I guess NgRx/Effects etc.
                 ignores that wrapping ?
                  Focuses on the payload contents = Recipe[] << that it?
                            */
                    console.log('whatWeGot people!', whatWeGot);
                    /* Yep:
                    {myPayload: Array(6), type: "[Recipes] Set Recipes"}
                     */
                    // return whatWeGot; // << Worked, but, Appears not necessary. hmm. This was Recipe[] btw
                    return of(whatWeGot); // Heck, we'll try sending back an Observable<Recipe[]> y not.
                    // Update now NOT commenting out. cheers.

                    // Yeah. that worked too.
                    // AND, Commenting it out worked, too. Sheesh.
                    /*
                    Update - hmm, when I add a "return type" above then
                    of course I do need to return something
                    (whatWeGot: Recipe[]): Observable<Recipe[]>
                    Fun stuff.
                     */
                }
            )
        );
        // /.pipe()
    } // /myPart10ResolveWorks() {} // 02

/*    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
// Not Yet Ready - it's okay. This "resolve()" is for ngrx-12-final
 */

/* */
    myFullResolveTemp(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] { // 01

        /*
        Very nice - Resolver can return:
        - Observable<Recipe[]> as we do with FETCH RECIPES from DataStorageService.
        - Plain Recipe[] as we do with our GET RECIPES on RecipeService
        Cheers.
        https://angular.io/api/router/Resolve#description
         */

        // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        /*
NgRx:
 */
        // hmm, wtf. clicking on any recipe item in the list gets NO response.
        console.log('Recipes Resolver, people! route: ActivatedRouteSnapshot y not ', route);
        /*
        ActivatedRouteSnapshot {url: Array(1), params: {…}, queryParams: {…}, fragment: undefined, data: {…}, …}
         */
        console.log('Recipes Resolver, people! state: RouterStateSnapshot y not ', state);
        /*
         {_root: TreeNode, url: "/recipes/2"}  // seems to contain the whole ActivatedRouteSnapshot ...
        ALSO:  /recipes/2/edit   ALSO: /recipes/new
         */

        return this.myStore.select(fromRoot.getRecipeState)
            .pipe(
                take(1),
                map(
                    (stateRecipePartWeGot: StateRecipePart) => {
                        console.log('01 people! stateRecipePartWeGot.recipes ', stateRecipePartWeGot.recipes);
                        return stateRecipePartWeGot.recipes;
                    }
                ),
                switchMap(
                    (recipesWeGot: Recipe[]) => {
                        if (recipesWeGot.length === 0) {
                            // Go fetch recipes from Firebase; we don't have any here in Store, on app
                            console.log('02 people! recipesWeGot.length === 0 seemstabe ', recipesWeGot);

                            // "Fetch" recipes from Firebase
                            /*  Nope! Do NOT "return" from right here on the .dispatch():
                                                        return this.myStore.dispatch(new RecipesActions.FetchRecipesEffectActionClass());
                            */
                            this.myStore.dispatch(new RecipesActions.FetchRecipesEffectActionClass());

                            // We are using NgRx/Effects here, too! // LECT. 380 ~10:04

                            // "Set" those recipes onto the local app's Store
                            /*
                            Or more exactly (I think), we here create a "listener"
                            for the Action of recipes being set.
                            When that happens, we get the below to process.
                            That is, when the app has occasion to "set recipes" is
                            when we want to do our "recipes resolver" stuff.
                            Hmm. MBU.
                            So, yes the Resolver here does dispatch this, BUT, it also
                            waits then for any recipes to be set.
                             */
                            return this.myRecipesEffectsActions$.pipe(
                                ofType(RecipesActions.SET_RECIPES_EFFECT_ACTION),
                                // when recipes are set,
                                take(1),
                                // MAX does NOT have this additional "map()" I have below ... hmm
                                /* ??? ???
                                map(
                                  (whatWeGotHey) => {
                                   console.log('whatWeGotHey 99 people! Q. DO WE EVER SEE THIS? ', whatWeGotHey); // yes, but
                                  // seen on PAGE REFRESH of e.g. /recipes/1
                                   return whatWeGotHey;
                                       }
                                 )
                                */
                            ); // /.pipe()
                        } else {
                            // we've already got recipes here in Store, on app
                            console.log('recipesWeGot already 99 people! "ELSE" Q. DO WE EVER SEE THIS? ', recipesWeGot); // yes
                            // seen on 1) Fetch, 2) navigating to e.g. /recipes/1  /recipes/2  /recipes/2/edit /recipes/new  etc.

                            return of(recipesWeGot); // With "of()", return Observable<Recipe[]>...
                            // ...rather than just Recipe[] - okay
                        }
                    }
                )
            );

        /* Yeah next line below okay-ish, but has a bug.
        If you have edited, save (local), don't yet "Send Data" to backend, and revisit any one recipe and hit Reload,
        owing to this total fetch, you re-get/fetch what is on backend and you don't have your local edit.
                return this.myDataStorageService.fetchRecipes(); // << gotta bug
        */

        /* No Longer Used (now NgRx) Lect. 380 ~00:17
                const recipesWeMayHaveLocal: Recipe[] = this.myRecipeService.getRecipes();

                // Above line returns simple Recipe[], not Observable<Recipe[]>. O.K.

                if (recipesWeMayHaveLocal.length === 0) {
        */
        // t'ain't none here! Let's go fetch
        // Therefore it's okay to carte blanche go get Recipes from Firebase...

        // *** New NgRx ***   see further below...

        /* Q. Hmm. What exactly is this Recipes Resolver doing for us?
        Scenario:
        - User logs in, fetches data (Recipes)
        - Navigates to one Recipe /:id   recipes/0
        - Hits browser Reload/Refresh page
        - App reloads overall, and recipes[] is again to empty []
        - So, the Resolver will wind up here, inside if (recipesWeMayHaveLocal.length === 0)
        - And, so the App will go back out to Firebase, get data
        - I am missing something here ...

        Maybe I need to come back when EDIT is working again
        /:id/edit  recipes/0/edit
        (not working now, i'm right in middle of refactoring modules
        DropDownDirective not available, so Edit not available)
         */

        /* No Longer Used (now NgRx) (further below...)
                    return this.myDataStorageService.fetchRecipes();
                    // << We do not need .subscribe() here (in an Angular "Resolver"). Read on...
        */

        // Above line returns OBSERVABLE<Recipe[]> << I think ??
        /*
        Yes I believe it is (returning an Observable<Recipe[]>)
        See this Q&A:
        https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14466448#questions/7788354
        "In the if branch the request Observable is returned.
        The [Angular] resolver subscribes to it automatically under the hood.
        Thus the recipes are fetched, and inside fetchRecipes' tap() method the recipes array is set to the fetched one."

        Another Q&A:
        https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14466448#questions/7325924
        "Angular itself subscribes automatically. We don't subscribe in code."
        "That's just how the resolver works if we return an Observable (similar to guards, interceptors etc.)."

        SEE ALSO DataStorageService.fetchRecipes() for more comments.
         */

        /*
        N.B. At least right now ( ? ) the .subscribe() is found on
        calling Component Header. Cheers.
         */

        /*
        TODO
                } else {
                    // we DO have some Recipes already, so,
                    // do NOT go to Firebase, instead
                    // let's just work with those local = latest info & Etc. :o)
                    console.log('recipesWeMayHaveLocal ', recipesWeMayHaveLocal); // yeah
                    // << has latest local edits God bless. We'll just use 'em!
                    return recipesWeMayHaveLocal;
                    // Above line returns simple Recipe[]

                }
        */

    } // /myFullResolveTemp() {} // 01 This version has the Part12 "full" treatment (cf. Part10 "partial")


}
