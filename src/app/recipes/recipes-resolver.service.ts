import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
import { Observable, of } from 'rxjs'; // <<< Nah. << seems to need?
import {take, map, switchMap} from 'rxjs/operators';
import {DataStorageService} from '../shared/data-storage.service';
import {RecipeService} from './recipe.service';

import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects'; // LECT. 380 ~10:04
import * as fromRoot from '../store/app.reducer';
import * as RecipesActions from './store/recipe.actions';
import { RecipeEffects } from './store/recipe.effects';
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
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
         */

        return this.myStore.select(fromRoot.getRecipeState)
            .pipe(
                take(1),
                map(
                    (stateRecipePartWeGot: StateRecipePart) => {
                        return stateRecipePartWeGot.recipes;
                    }
                ),
                switchMap(
                    (recipesWeGot: Recipe[]) => {
                        if (recipesWeGot.length === 0) {
                            // Go fetch recipes from Firebase; we don't have any here in Store, on app

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
                                map(
                                    (whatWeGotHey) => {
                                        console.log('whatWeGotHey99 ', whatWeGotHey);
                                        return whatWeGotHey;
                                    }
                                )
                            ); // /.pipe()
                        } else {
                            // we've already got recipes here in Store, on app
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

    } // /resolve() {}

}
