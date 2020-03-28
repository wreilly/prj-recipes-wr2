import {Action} from '@ngrx/store';
import {Recipe} from '../recipe.model';

export const ADD_RECIPE_ACTION = '[Recipes] Add Recipe';
export const UPDATE_RECIPE_ACTION = '[Recipes] Update Recipe'; // << Effect ? NO.
export const DELETE_RECIPE_ACTION = '[Recipes] Delete Recipe'; // << Effect ? NO.

export const FETCH_RECIPES_EFFECT_ACTION = '[Recipes] Fetch Recipes';
export const SET_RECIPES_EFFECT_ACTION = '[Recipes] Set Recipes'; // << Effect ? Hmm. Don't think so (?)
// TODO Rename (I think) to remove "_EFFECT_" from SET_RECIPES etc. t.b.d.
export const STORE_RECIPES_EFFECT_ACTON = '[Recipes] Store Recipes';

export class AddRecipeActionClass implements Action {
    readonly type = ADD_RECIPE_ACTION;
    constructor(
        public myPayload: {
            recipeToAdd: Recipe,
        }
    ) { }
}

export class UpdateRecipeActionClass implements Action {
    readonly type = UPDATE_RECIPE_ACTION;
    constructor(
        public myPayload: {
            idToUpdate: number,
            recipeToUpdate: Recipe,
        }
    ) { }
}

export class DeleteRecipeActionClass implements Action {
    readonly type = DELETE_RECIPE_ACTION;
    constructor(
        public myPayload: {
            idToDelete: number,
        }
    ) { }
}

export class FetchRecipesEffectActionClass implements Action {
    readonly type = FETCH_RECIPES_EFFECT_ACTION;
}

export class SetRecipesEffectActionClass implements Action {
    readonly type = SET_RECIPES_EFFECT_ACTION;
    constructor(
        public myPayload: Recipe[],
    ) {  }
}

export class StoreRecipesEffectActionClass implements Action {
    readonly type = STORE_RECIPES_EFFECT_ACTON;
    // no payload, methinks (correct-a-mundo. the Recipes are already in the Store. No "passing in"
}

export type RecipesActionsUnionType = AddRecipeActionClass
    | UpdateRecipeActionClass
    | DeleteRecipeActionClass
    | FetchRecipesEffectActionClass
    | SetRecipesEffectActionClass
    | StoreRecipesEffectActionClass;
