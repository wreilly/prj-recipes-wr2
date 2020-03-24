import {Action} from '@ngrx/store';
import {Recipe} from '../recipe.model';

export const ADD_RECIPE_ACTION = '[Recipes] Add Recipe';
export const UPDATE_RECIPE_EFFECT_ACTION = '[Recipes] Update Recipe'; // << ? Effect ?
export const FETCH_RECIPES_EFFECT_ACTION = '[Recipes] Fetch Recipes';
export const SET_RECIPES_EFFECT_ACTION = '[Recipes] Set Recipes';
// TODO Rename (I think) to remove "_EFFECT_" from SET_RECIPES etc. t.b.d.

export class AddRecipeActionClass implements Action {
    readonly type = ADD_RECIPE_ACTION;
    constructor(
        myPayload: {
            recipeToAdd: Recipe,
        }
    ) { }
}

export class FetchRecipesEffectActionClass implements Action {
    readonly type = FETCH_RECIPES_EFFECT_ACTION;
}

export class UpdateRecipeEffectActionClass implements Action {
    readonly type = UPDATE_RECIPE_EFFECT_ACTION;

    constructor(
        myPayload: {
            idToUpdate: number,
            recipeToUpdate: Recipe,
        }
    ) { }
}

export class SetRecipesEffectActionClass implements Action {
    readonly type = SET_RECIPES_EFFECT_ACTION;
    constructor(
        public myPayload: Recipe[],
    ) {  }
}

export type RecipesActionsUnionType = AddRecipeActionClass
    | FetchRecipesEffectActionClass
    | UpdateRecipeEffectActionClass
    | SetRecipesEffectActionClass;
