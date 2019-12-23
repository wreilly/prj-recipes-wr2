import { Ingredient } from '../shared/ingredient.model';

// N.B. *NO* "ID" is dealt with here. Hmm.

/* CLASS is Instructor Code way. okay */
export class Recipe {
  public name: string;
  public description: string;
  public imagePath: string;
  ingredients: Ingredient[]; // ? experiment. for Interface not Class

/* INTERFACE. Hmm.
export interface Recipe {
*/
/*
  name: string;
  description: string;
  imagePath: string;
  ingredients?: Ingredient[]; // ? experiment
*/
  // For INTERFACE, yes, optional ? is supposed to work
  // For CLASS - need to have different Temporary Constructor that ignores it...

  /* No - "optional" ingredients does not with "real" constructor. Hmm.

   ERROR in src/app/recipes/recipe-detail/recipe-detail.component.ts(39,65):
    error TS2339: Property 'ingredients' does not exist on type 'Recipe'.

   Hah. Need to check logic on calling function (e.g. RecipeService
   */

/* TEMPORARY INGREDIENT-LESS CONSTRUCTOR  << CLASS Only
  constructor(name: string, desc: string, imagePath: string) { // }, ingredients: Ingredient[]) {
    this.name = name;
    this.description = desc;
    this.imagePath = imagePath;
    // this.ingredients = ingredients;
  }
*/
/* REAL CONSTRUCTOR  << CLASS Only */
  constructor(name: string, desc: string, imagePath: string, ingredients: Ingredient[]) {
    this.name = name;
    this.description = desc;
    this.imagePath = imagePath;
    this.ingredients = ingredients;
  }

}
