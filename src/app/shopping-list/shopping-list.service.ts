import { Ingredient } from '../shared/ingredient.model';
import {Subject} from 'rxjs';

export class ShoppingListService {

  myIngredientsChangedSubject = new Subject<Ingredient[]>();
  /*
     SHOPPING-**LIST** subscribes to this OBSERVABLE$
   */

  myIngredientToEditIndex = new Subject<number>();
  /*
     SHOPPING-**EDIT** subscribes to this OBSERVABLE$
     SHOPPING-**LIST** fires '.next()' to this OBSERVABLE$ (user click on Which Ingredient)
  */

/* **NGRX**
  Moved (a copy) of ingredients[] to shopping-list.reducer.ts

  But not yet ready to remove from here in Service...
*/
  private ingredients: Ingredient[] = [
    new Ingredient('ApplesWR__SL_SVC', 5),
    new Ingredient('TomatoesWR__SL_SVC', 10),
  ];

  getIngredient(myIndexPassedIn: number) {
    let ingredientToReturn: Ingredient;
    ingredientToReturn = this.ingredients[myIndexPassedIn];
    return ingredientToReturn;
  }

  getIngredients() {
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient) {
    /* NGRX:
    We now no longer, from over in RecipeEditComponent,
     call this SLService to add one Ingredient. No.
    We do NGRX instead, over there in RecipeEditComponent.
    (To add one Ingredient is triggered by the user clicking "Add New"
     on the RecipeEditComponent.)
     */
    this.ingredients.push(ingredient);
    console.log('001 ADD ', ingredient);
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  updateIngredient(indexPassedIn: number, ingredientEdits: Ingredient) {
    this.ingredients[indexPassedIn] = ingredientEdits;
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  addIngredients(ingredients: Ingredient[]) {
    /*
    With NGRX now, this is No Longer Called by the RecipesService
    (The function to "Send (Recipe) Ingredients to Shopping List")
     */
    this.ingredients.push(...ingredients);
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  deleteIngredient(indexPassedIn: number) {
    this.ingredients.splice(indexPassedIn, 1);
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  deleteAllIngredients() {
    // re: as called from (new: NgRx/Store) ShoppingListComponent.myClearShoppingList() Va bene. (Does NOT yet do any deleting on Store)
    console.log('whatIngredientsAreInService 01SL object', this.ingredients); // hmm already [] empty hmm
    this.ingredients = [];
    console.log('whatIngredientsAreInService 02SL object', this.ingredients); // yep []
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
    console.log('whatIngredientsAreInService 03SL object', this.ingredients); // yep still []
  }

}
