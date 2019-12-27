import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
// import { Observable } from 'rxjs'; // <<< Nah.
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

/*
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
*/
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
/* Yeah but has a bug.
If you are edited, save (local), don't yet "Send Data" to backend, and revisit any one recipe and hit Reload,
owing to this total fetch, you re-get/fetch what is on backend and you don't have your local edit.
        return this.myDataStorageService.fetchRecipes(); // << gotta bug
*/
        const recipesWeMayHaveLocal = this.myRecipeService.getRecipes();
        if (recipesWeMayHaveLocal.length === 0) {
            // t'ain't none! Let's go fetch
            return this.myDataStorageService.fetchRecipes();
        } else {
            // we have some so let's just work with those local = latest info & Etc. :o)
            console.log('recipesWeMayHaveLocal ', recipesWeMayHaveLocal); // yeah
            return recipesWeMayHaveLocal; // << has latest local edits God bless
        }

    }

}