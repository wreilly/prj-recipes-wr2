import { Ingredient } from '../shared/ingredient.model';
import {Subject} from 'rxjs';


export class ShoppingListService {
  myIngredientsChangedSubject = new Subject<Ingredient[]>(); // LIST subscribes to this OBSERVABLE$
  myIngredientToEditIndex = new Subject<number>(); // EDIT subscribes to this OBSERVABLE$

/* **NGRX**
  Moving to shopping-list.reducer.ts
*/
  private ingredients: Ingredient[] = [
    new Ingredient('ApplesWR__', 5),
    new Ingredient('TomatoesWR__', 10),
  ];


  getIngredient(myIndexPassedIn: number) {

    const ingredientToReturn: Ingredient = this.ingredients[myIndexPassedIn];
    return ingredientToReturn;
  }

  getIngredients() {
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
    console.log('001 ADD ', ingredient);
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  updateIngredient(indexPassedIn: number, ingredientEdits: Ingredient) {
    console.log('ING 02', ingredientEdits);
    // {ingredient-nameName: "ketchup", amountName: 4}

    this.ingredients[indexPassedIn] = ingredientEdits;
    console.log('ING 03 ', this.ingredients[indexPassedIn]);
    // {ingredient-nameName: "ketchup", amountName: 4} // << N.B. No type preface of 'Ingredient' See below.

    const newIngredientToUpdateDoneRight = new Ingredient(ingredientEdits['ingredient-nameName'], ingredientEdits['amountName']);
    console.log('ING 04 ', newIngredientToUpdateDoneRight);

   this.ingredients[indexPassedIn] = newIngredientToUpdateDoneRight;
    console.log('ING 05 ', this.ingredients[indexPassedIn]);
    /* Array of Ingredients, properly:
    Ingredient {name: "ApplesWR__oldmaybe", amount: 33} // << N.B. Now, "Done Right," does have/get type preface of 'Ingredient'. va bene.
     */

    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  } // /updateIngredient()

  addIngredients(ingredients: Ingredient[]) {
    this.ingredients.push(...ingredients);
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  deleteIngredient(indexPassedIn: number) {
    this.ingredients.splice(indexPassedIn, 1);
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  deleteAllIngredients() {
    // re: as called from (new: NgRx/Store) ShoppingListComponent.myClearShoppingList() Va bene. (Does NOT yet do any deleting on Store)
    console.log('whatIngredientsAreInService 01SL object', this.ingredients);
    this.ingredients = [];
    console.log('whatIngredientsAreInService 02SL object', this.ingredients); // yep []
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
    console.log('whatIngredientsAreInService 03SL object', this.ingredients); // yep still []
  }

}
