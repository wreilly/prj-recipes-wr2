import {Action} from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';

/*
"use consts, to ...rule out making typos..."
 */
export const ADD_INGREDIENT_ACTION = 'ADD_INGREDIENT_ACTION';
export const ADD_INGREDIENTS_ACTION = 'ADD_INGREDIENTS_ACTION';

export class AddIngredientAction implements Action {

    readonly type = ADD_INGREDIENT_ACTION;
    /* Must be called type.
       readonly means cannot be modified from outside = good
     */

/* WAS: Simple object property
    myPayload: Ingredient;

    NOW: in the constructor()
*/
    constructor(public myPayload: Ingredient) { }

}

export class AddIngredientsAction implements Action {
    readonly type = ADD_INGREDIENTS_ACTION;
    constructor(public myPayload: Ingredient[]) { }
}

export type ShoppingListActionsType =
      AddIngredientAction
    | AddIngredientsAction;
