import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
// import { DataStorageService } from '../shared/data-storage.service';  // << NO! Created "circular dependency"! o la.


/*  Max code has just @Injectable()
@Injectable({
  providedIn: 'root'
})
*/
@Injectable()
export class RecipeService {
  // recipesChanged = new Subject<Recipe[]>(); // INSTRUCTOR
  recipesOnServiceChangedSubject = new Subject<Recipe[]>(); // WR__

  private recipes: Recipe[] = [];

  private recipesORIGPREPOULATEDARRAY: Recipe[] = [ // << NO LONGER USED. Now HTTP GET...

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



  constructor(
      private slService: ShoppingListService,
      // private myDataStorageService: DataStorageService, // << NO! Created "circular dependency"! o la.
      ) {
    // console.log('and the this.recipesOnServiceChangedSubject appears to be: ', this.recipesOnServiceChangedSubject);
    /* yeah...
    Subject {_isScalar: false, observers: Array(0), ...
     */
  }

  getRecipes() {
    /* UPDATE - Not Really a "GET"!
    Not a "go out and get 'em, fetch"
    No, now it is more like "hand 'em over, immediately, just what you got"

    Buddy, this here method no longer goes out and fetches recipes via HTTP etc.
    It doesn't even really call the DataService to get the recipes. No.
    It merely *boom* supplies the recipes[] we've got on this Service.
    That's it!

    Q. Now just how you *get* those recipes[] to be/get here, on this RecipeService,
    well, read on ... ;o)

    A. 1) add() pushes one Recipe onto the recipes[] array.
    Whereas 2) set() is the method, invoked by the DataService's fetch(),
    that sort of PUTS the bunch of recipes onto the recipes[] here
    in the RecipeService. Strange-ish, hey? I'd say.
    That fetch() is (right now) only user-driven - a click on the
    "Fetch Data" button in the header (dropdown). Who knew?
    (That is, no, this app (right now) does NOT do a "fetch"
    of all recipes, upon initial load of the RecipesComponent nor the
    RecipesListComponent. Instead we wait for user to click Fetch Data.
    Bit odd.)
     */
/*  REFACTORED over to DataStorageService
    this.myDataStorageService.fetchRecipes()
        .subscribe(
            (recipesWeGot) => {
              console.log('recipesWeGot ', recipesWeGot);
              this.recipes = recipesWeGot;
              console.log('this.recipes ', this.recipes);
              return this.recipes.slice();
            }
        );
*/
    return this.recipes.slice(); // << That's it! *boom!*
  }

  setRecipes(arrayOfRecipes) {
    this.recipes = arrayOfRecipes; // whamma-jamma
    /*
    N.B. With above line we are only HALF done.
    Those recipes[] are just the ones here in the Service.

    We need to, also, below, also do .next() on the SUBJECT here
    in the Service, so that ANYONE SUBSCRIBING to
    the recipes[] over on the
    Component gets updated. Kids.
     */
    this.recipesOnServiceChangedSubject.next(this.recipes.slice());
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
