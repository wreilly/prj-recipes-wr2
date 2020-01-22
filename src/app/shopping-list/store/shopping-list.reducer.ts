// import {Action} from '@ngrx/store'; // No longer used
import { Ingredient } from '../../shared/ingredient.model';
/* Works...
import { ADD_INGREDIENT_ACTION, AddIngredientAction } from './shopping-list.actions';
*/
// More better: (you sometimes get LOTS of things out of those Actions files)
import * as MyShoppingListActions from './shopping-list.actions';

const initialState = {
    ingredients: [ // refactored here from ShoppingListService, fwiw
        new Ingredient('ApplesWR__NGRX', 5),
        new Ingredient('TomatoesWR__NGRX', 10),
    ]
};

export function shoppingListReducer(
    state = initialState, // state will get initialState if null

/*
    action: Action, // No longer used. This was just NgRx Action interface
*/
/* When there was only One Action:
    action: MyShoppingListActions.AddIngredientAction, // Now, our specific Action instance. (has ".myPayload")
*/

// Now we have additional, so use 'type' to bring all in:
    action: MyShoppingListActions.ShoppingListActionsType, // Action instances. (all use ".myPayload")
) {
    switch (action.type) {
/* WAS: 'string'
        case 'ADD_INGREDIENT_ACTION':
NOW: const
*/
        case MyShoppingListActions.ADD_INGREDIENT_ACTION:
            // Do NOT mutate the existing state!! Get a COPY, work on that
            return  {  // reducer returns a new state!
                ...state, // spread operator gives you a COPY
                ingredients: [
                    ...state.ingredients, // likewise copy of our ingredients array, up to present...
                    action.myPayload // << ostensibly the newly added Ingredient
                ]
            };

        case MyShoppingListActions.ADD_INGREDIENTS_ACTION:
            return {
                ...state,
                ingredients: [
                    ...state.ingredients,
                    action.myPayload
                ]
            };
        default:
            return state;
    }
}
