import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService {
  // recipesChanged = new Subject<Recipe[]>(); // INSTRUCTOR
  recipesOnServiceChangedSubject = new Subject<Recipe[]>(); // WR__

  private recipes: Recipe[] = [

    /* Good Recipes to "new up" for CLASS: */
  new Recipe(
  'Class Tasty Schnitzel',
  'A super-tasty Schnitzel - just awesome!',
  'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG',
  [
    new Ingredient('Meat', 1),
    new Ingredient('French Fries', 20)
  ]
  ),
    new Recipe('Class Big Fat Burger',
        'What else you need to say?',
        'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg',
  [
    new Ingredient('Buns', 2),
    new Ingredient('Meat', 1)
  ]
    ),

      // Good Recipes constructed as 'twere for INTERFACE:
/*
    {
      name: 'Interface Tasty Schnitzel',
      description: 'A super-tasty Schnitzel - just awesome!',
      imagePath: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG',
    },
    {
      name: 'Interface Big Fat Burger',
      description: 'What else you need to say?',
      imagePath: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg'},
*/
  ];



  constructor(private slService: ShoppingListService) {
    console.log('We constructed the RecipeService o boy');
    console.log('and the this.recipesOnServiceChangedSubject appears to be: ', this.recipesOnServiceChangedSubject);
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

/*
  addRecipeINSTRUCTOR(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }
*/

  addRecipe(recipePassedIn: Recipe) { // WR__
    this.recipes.push(recipePassedIn);
    console.log('REC 01 recipes in service after add: ', this.recipes); // Yes. oi!
    const whoKnew = this.recipes.slice();
    // console.log('this.recipes.slice() is just what you thought it was: whoKnew ', whoKnew); // yes ...  [{…}, {…}, {…}]
    // this.allThoseRecipesOnServiceSomethingChangedSubject.next(this.recipes.slice());
    this.recipesOnServiceChangedSubject.next(this.recipes.slice());
    // this.recipesOnServiceChangedSubject.next(whoKnew);
    console.log('do we at least see this, post-subject next?'); // yeah. so. sheesh.
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
