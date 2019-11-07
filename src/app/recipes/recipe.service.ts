import { Injectable } from '@angular/core'; // WAS: EventEmitter
import { Subject } from 'rxjs';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService {
/* RXJS SUBJECT NOW
  recipeSelected = new EventEmitter<Recipe>();
*/
  myRecipeSelectedSubject = new Subject<Recipe>();

  private recipes: Recipe[] = [
    new Recipe(
      'Tasty Schnitzel',
      'A super-tasty Schnitzel - just awesome!',
      'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG',
      [
        new Ingredient('Meat', 1),
        new Ingredient('French Fries', 20)
      ]),
    new Recipe('Big Fat Burger',
      'What else you need to say?',
      'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg',
      [
        new Ingredient('Buns', 2),
        new Ingredient('Meat', 1)
      ])
  ];

  constructor(private slService: ShoppingListService) {
    console.log('01 this.myRecipeSelectedSubject  ', this.myRecipeSelectedSubject);
    /* Yeah...
    01 this.myRecipeSelectedSubject   Subject {_isScalar: ...
     */
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(index: number) {
    this.myRecipeSelectedSubject.next(this.recipes[index]); // ?
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }
}
