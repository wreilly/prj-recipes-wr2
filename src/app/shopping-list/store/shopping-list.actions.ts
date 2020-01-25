import {Action} from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';

/*
"use consts, to ...rule out making typos..."
 */
export const ADD_INGREDIENT_ACTION = 'ADD_INGREDIENT_ACTION';
export const ADD_INGREDIENTS_ACTION = 'ADD_INGREDIENTS_ACTION';
export const UPDATE_INGREDIENT_ACTION = 'UPDATE_INGREDIENT_ACTION';

export class AddIngredientAction implements Action {

    readonly type = ADD_INGREDIENT_ACTION;
    /*
       type - Must be called type
       readonly - means cannot be modified from outside = good
     */

/* WAS: Simple object property
    myPayload: Ingredient;

    NOW: in the constructor()
    Recall: Shortcut of 'public' gets you a property of same name
*/
    constructor(public myPayload: Ingredient) { }

}

export class AddIngredientsAction implements Action {
    readonly type = ADD_INGREDIENTS_ACTION;
    constructor(public myPayload: Ingredient[]) { }
}

export class UpdateIngredientAction implements Action {
    readonly type = UPDATE_INGREDIENT_ACTION;
    constructor(
        public index: number,
        public myPayload: Ingredient
    ) {
    }
}

export type ShoppingListActionsType =
      AddIngredientAction
    | AddIngredientsAction
    | UpdateIngredientAction;
