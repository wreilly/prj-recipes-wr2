import { Ingredient } from '../../shared/ingredient.model';
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
    action: MyShoppingListActions.ShoppingListActionsType, // Action instances. (all use ".myPayload" (and ".type" too of course))
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
            console.log('action.myPayload recipe ADD_INGREDIENTS_ACTION ', action.myPayload);
            // https://davidwalsh.name/spread-operator
            console.log('...action.myPayload recipe ADD_INGREDIENTS_ACTION ', ...action.myPayload);
            return {
                ...state,
                ingredients: [
                    ...state.ingredients,

/* No. This puts an array into this array. Not What You Want.
                    action.myPayload // Nope.
*/
                    ...action.myPayload // << Yes. This puts {} objects into this array. Just What You Want.
                ]
            };

        case MyShoppingListActions.UPDATE_INGREDIENT_ACTION:
            console.log('UPDATE action.myPayload ', action.myPayload); // Yep
            console.log('UPDATE action.index ', action.index); // Yep e.g. 1
            state.ingredients.splice(action.index, 1, action.myPayload);
            console.log('UPDATE state ', state);
            /* Seemstabeokay:
            ingredients: Array(2)
0: Ingredient {name: "ApplggggggesWR__SVC", amount: 5}
1: Ingredient {name: "TomatoesWR__NGRX", amount: 10}
             */
            return {
                ...state,
                ingredients: [
                    state.ingredients
                ]
            };

        default:
            return state;
    }
}
