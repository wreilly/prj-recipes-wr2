import {Action} from '@ngrx/store';
import {Recipe} from '../recipe.model';

export const ADD_RECIPE_ACTION = '[Recipes] Add Recipe';

export const SET_RECIPES_ACTION = '[Recipes] Set Recipes';

export class AddRecipeActionClass implements Action {
    readonly type = ADD_RECIPE_ACTION;
    constructor(
        myPayload: {
            recipeToAdd: Recipe
        }
    ) { }
}

export class SetRecipesActionClass implements Action {
    readonly type = SET_RECIPES_ACTION;
    constructor(
        public myPayload: Recipe[],
    ) {  }
}

export type RecipesActionsUnionType = AddRecipeActionClass
    | SetRecipesActionClass;
