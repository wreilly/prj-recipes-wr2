import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Recipe } from '../recipe.model';
// import { RecipeService } from '../recipe.service'; // << no longer

import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/app.reducer';
import {getRecipeState} from '../../store/app.reducer';
// No NgRx *Actions* needed here (I think?)
import { tap, map } from 'rxjs/operators';
import {StateRecipePart} from '../store/recipe.reducer';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
//  providers: [RecipeService], // << No not here, in AppModule instead
})
export class RecipeListComponent implements OnInit, OnDestroy {
  myTempRecipesArray: [];
  recipes: Recipe[];
  myStuff: any[];
  mySubscriptionToRecipes: Subscription;

  constructor(
      // private recipeService: RecipeService, // << no longer
      private router: Router,
      private route: ActivatedRoute,
      private myStore: Store<fromRoot.MyOverallRootState>,
  ) {
  }

  ngOnInit() {
    // this.subscription = this.recipeService.recipesChanged // INSTRUCTOR
/* Nope. Not used. See NgRx below.
    this.subscription = this.recipeService.recipesOnServiceChangedSubject.subscribe(
        (recipes: Recipe[]) => {
          console.log('WR__ in INSTRUCTOR CODE DO WE GET HERE 01 HMM recipes (we got)', recipes); // YES!
          this.recipes = recipes;
          console.log('WR__ in INSTRUCTOR CODE DO WE GET HERE 02 HMM this.recipes ', this.recipes); // YES!
        }
      );
*/
    // this.myTempRecipesArray = this.recipeService.getRecipes();
/* Q. Do Not Need so why use? MBU
   A. Well, on VERY FIRST load no, you're right, recipes[] winds up Empty.
   And yeah, you gotta click "Fetch Data"
   BUT, on subsequent revisits to this component (e.g. click on Shopping List, then
   click back to Recipes), you DO have recipes[] in there. Cheers.
*/

/* No Longer Used (NgRx now)
    this.recipes = this.recipeService.getRecipes();
    console.log('this.recipes ', this.recipes);
*/

    /*
    NgRx now:
    N.B. My initial intuition was WRONG - I essentially swapped in
    this Store.select().pipe(), and ignored/dropped the existing
    .subscribe(), and the Subscription it was creating.
    Tsk, tsk. WRONG.

    Instead (MAX Code) you *incorporate* the new NgRx Store.select().pipe()
    *onto* the .subscribe(). You KEEP the .subscribe() and the Subscription.
    Cheers.
     */
    this.mySubscriptionToRecipes = this.myStore.select(getRecipeState)
        .pipe(
            tap(
                (whatWeGot) =>  { // type: StateRecipePart
                  console.log('whatWeGot ', whatWeGot);
                  // this.recipes = whatWeGot.recipes; // << No, not here, not like so. See map() and then .subscribe()
                }
            ),
            map(
                (whatWeGotStateRecipePart: StateRecipePart) => {
                    return whatWeGotStateRecipePart.recipes;
                }
            )
        )
        // /.pipe() returns ? Observable<Recipe[]>
        .subscribe(
            (recipesArrayFromStoreWeGot) => { // Recipe[]
                this.recipes = recipesArrayFromStoreWeGot; // << Here (as before) is where you assign to local variable. Cheers.
            }
        );
  } // /ngOnInit()

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route})
        .then(promiseResponse => 'sort of an empty string .then() .navigate() promiseResponse' + promiseResponse);
  }

  ngOnDestroy() {
    this.mySubscriptionToRecipes.unsubscribe();
  }
}
