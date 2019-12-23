/* *************************
   **  NOT  USED  **
   * I tried (partial success) this "single recipe" resolver.
   * It uses the URL Param 'id'
   * But what our app really needs is the "plural" (ALL) recipes resolver. Cheers.
 */


import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from './recipe.model';

import {DataStorageService} from '../shared/data-storage.service';
import { RecipeService } from './recipe.service';

@Injectable({
    providedIn: 'root',
})
export class RecipeResolverService implements Resolve<Recipe> { // WR__ Mine just returns one Recipe, not array MBU

    constructor(
        private myDataStorageService: DataStorageService,
        private myRecipeService: RecipeService,
        private myRouter: Router,
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Recipe {
        // tslint:disable-next-line:max-line-length
        // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> { // Mine just returns one Recipe, not array MBU
        /*
        https://www.concretepage.com/questions/596
         */
        const thisIdToResolve: string = route.paramMap.get('id');
        console.log('thisIdToResolve ', thisIdToResolve);
        console.log('+thisIdToResolve ', +thisIdToResolve);

        const recipeMaybe: Recipe = this.myRecipeService.getRecipe(+thisIdToResolve); // << + make string a number
/*
            .pipe(
                map(
                  (thatRecipe) => {
*/

        if (recipeMaybe) {
            // ok
            console.log('Resolver found thatRecipe ', recipeMaybe);
            return recipeMaybe;
        } else {
            // not ok
            console.log('Resolver did NOT find thatRecipe ', recipeMaybe);
            this.myRouter.navigate(['recipes'])
                .then(r => console.log('r is what ?', r)); // e.g. true
            // ? '/recipes' ? {relativeTo: this.route})
        }
    } // /resolve()
}
