import { Ingredient } from '../shared/ingredient.model';
/* RXJS SUBJECT NOW
import { EventEmitter } from '@angular/core';
*/
import { Subject } from 'rxjs';

export class ShoppingListService {
/* RXJS SUBJECT NOW
  ingredientsChanged = new EventEmitter<Ingredient[]>();
*/
  myIngredientsChangedSubject = new Subject<Ingredient[]>();

  myIngredientToEdit = new Subject<Ingredient>();
  myIngredientToEditIndex = new Subject<number>();

  private ingredients: Ingredient[] = [
    new Ingredient('ApplesWR__', 5),
    new Ingredient('TomatoesWR__', 10),
  ];

  getIngredient(myIndexPassedIn: number) {

    const ingredientToReturn: Ingredient = this.ingredients[myIndexPassedIn];
    this.myIngredientToEdit.next(ingredientToReturn);
    return ingredientToReturn;
  }

  getIngredients() {
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
/* RXJS SUBJECT NOW
    this.ingredientsChanged.emit(this.ingredients.slice());
*/
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  updateIngredient(indexPassedIn: number, ingredientEdits: Ingredient) {
    console.log('ING 02', ingredientEdits);
    // {ingredient-nameName: "ketchup", amountName: 4}
    /* Hmm. Odd (to me). ???
    Why isn't TypeScript complaining, when I pass
    my own object (See above) as the 2nd parameter
    that is typed to 'Ingredient'?
    That is:
          IS NOW: not really Ingredient
      { ingredient-nameName: "ApplesWR__ are goodf", amountName: 6}
      NEEDS TO BECOME: Ingredient, n'est-ce pas?
      Ingredient { name: "ApplesWR__ are goodf", amount: 6}
     */

    // Just whamma-jamma onto that index. Huh. No "map" etc. Hmm.
    this.ingredients[indexPassedIn] = ingredientEdits;
    console.log('ING 03 ', this.ingredients[indexPassedIn]);
    // {ingredient-nameName: "ketchup", amountName: 4}

    const newIngredientToUpdateDoneRight = new Ingredient(ingredientEdits['ingredient-nameName'], ingredientEdits['amountName']);
    /* For: ingredientEdits.amountName << nope?
    "Property 'amountName' does not exist on type 'Ingredient'"  (IDE/TypeScript warning ( ? ))
    */
    console.log('ING 04 ', newIngredientToUpdateDoneRight);
    /* DIFFERS!
    Ingredient {name: "TomatoesWR__older", amount: 10}
     */

   this.ingredients[indexPassedIn] = newIngredientToUpdateDoneRight;
    console.log('ING 05 ', this.ingredients[indexPassedIn]);
    /* Array of Ingredients, properly:
    Ingredient {name: "ApplesWR__oldmaybe", amount: 33}
     */

    this.myIngredientsChangedSubject.next(this.ingredients.slice()); // send a copy (new, different, etc.)
  } // /updateIngredient()

  addIngredients(ingredients: Ingredient[]) {
    this.ingredients.push(...ingredients);
/* RXJS SUBJECT NOW
    this.ingredientsChanged.emit(this.ingredients.slice());
*/
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }

  deleteIngredient(indexPassedIn: number) {
    this.ingredients.splice(indexPassedIn, 1);
    this.myIngredientsChangedSubject.next(this.ingredients.slice()); // makes new copy...
  }
}
