import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
import { Observable } from 'rxjs'; // <<< Nah. << seems to need?
import {DataStorageService} from '../shared/data-storage.service';
import {RecipeService} from './recipe.service';

@Injectable({
    providedIn: 'root',
})
export class RecipesResolverService implements Resolve<Recipe[]> { // MAX CODE/APPROACH

    constructor(
        private myDataStorageService: DataStorageService,
        private myRecipeService: RecipeService,
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

/* Yeah next line below okay-ish, but has a bug.
If you have edited, save (local), don't yet "Send Data" to backend, and revisit any one recipe and hit Reload,
owing to this total fetch, you re-get/fetch what is on backend and you don't have your local edit.
        return this.myDataStorageService.fetchRecipes(); // << gotta bug
*/
        const recipesWeMayHaveLocal: Recipe[] = this.myRecipeService.getRecipes();
        // Above line returns simple Recipe[], not Observable<Recipe[]>. O.K.

        if (recipesWeMayHaveLocal.length === 0) {
            // t'ain't none here! Let's go fetch
            // Therefore it's okay to carte blanche go get Recipes from Firebase...
            return this.myDataStorageService.fetchRecipes(); // << We do not need .subscribe() here (in an Angular "Resolver"). Read on...
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
        } else {
            // we DO have some Recipes already, so,
            // do NOT go to Firebase, instead
            // let's just work with those local = latest info & Etc. :o)
            console.log('recipesWeMayHaveLocal ', recipesWeMayHaveLocal); // yeah
            // << has latest local edits God bless. We'll just use 'em!
            return recipesWeMayHaveLocal;
            // Above line returns simple Recipe[]

        }

    }

}
