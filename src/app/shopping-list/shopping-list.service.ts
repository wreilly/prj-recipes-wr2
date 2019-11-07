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

  private ingredients: Ingredient[] = [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10),
  ];

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

  addIngredients(ingredients: Ingredient[]) {
    this.ingredients.push(...ingredients);
/* RXJS SUBJECT NOW
    this.ingredientsChanged.emit(this.ingredients.slice());
*/
    this.myIngredientsChangedSubject.next(this.ingredients.slice());
  }
}
