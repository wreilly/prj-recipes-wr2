import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';
import * as MyShoppingListActionsHereInRecipeService from '../shopping-list/store/shopping-list.actions';
/* No longer
import * as fromShoppingListReducer from '../shopping-list/store/shopping-list.reducer';
*/
import * as fromRoot from '../store/app.reducer';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';

/* NGRX We REMOVE SL Service
import { ShoppingListService } from '../shopping-list/shopping-list.service';
*/

/*  Max code has just @Injectable()
@Injectable({
  providedIn: 'root'
})
*/
@Injectable()
export class RecipeService {
  recipesOnServiceChangedSubject = new Subject<Recipe[]>();

  private recipes: Recipe[] = [];

  constructor(
/* NGRX now:
      private slService: ShoppingListService,
*/

      // 'myShoppingListViaReducer' is name of part of Store, established in
      //  the configuration of StoreModule, over in AppModule.
      //  It is therefore the name that you must use here:
/*
      private myStore: Store<{'myShoppingListViaReducer': { ingredients: Ingredient[]}}>
*/
  // private myStore: Store<fromShoppingListReducer.AppState> // << No longer
// private myStore: Store<fromShoppingListReducer.StateShoppingListPart> // << Yes but now from AppReducer Root Store
  private myStore: Store<fromRoot.MyOverallRootState>
      ) { }

  getRecipes(): Recipe[] {
    return this.recipes.slice();
  }

  setRecipes(arrayOfRecipes) {
    this.recipes = arrayOfRecipes;
    this.recipesOnServiceChangedSubject.next(this.recipes.slice());
  }

  getRecipe(index: number): Recipe {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredientsPassedIn: Ingredient[]) {
    /*
NGRX now replaces this use of the SL SERVICE
and the local Subject (over there) for ingredients
 */
/* No Longer Used:
    this.slService.addIngredients(ingredients);
*/
    this.myStore.dispatch(new MyShoppingListActionsHereInRecipeService.AddIngredientsActionClass(ingredientsPassedIn));

  }

  addRecipe(recipePassedIn: Recipe) {
    this.recipes.push(recipePassedIn);
    this.recipesOnServiceChangedSubject.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesOnServiceChangedSubject.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesOnServiceChangedSubject.next(this.recipes.slice());
  }
}
