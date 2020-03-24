import {Recipe} from '../recipe.model';

import * as fromRecipeActions from './recipe.actions';
// import {ADD_RECIPE_ACTION, SET_RECIPES_ACTION} from './recipe.actions'; // << Use "*" above instead


export interface StateRecipePart {
    recipes: Recipe[]; // << cf. in RecipeService, this is the only "state"
}

const initialStateRecipePart = {
    recipes: [],
};

export function recipeReducer (
    ngrxState: StateRecipePart = initialStateRecipePart,
    ngrxAction: fromRecipeActions.RecipesActionsUnionType,
): StateRecipePart {

    switch (ngrxAction.type) {
        case fromRecipeActions.ADD_RECIPE_ACTION:
            break; // TODO
        case fromRecipeActions.SET_RECIPES_EFFECT_ACTION:
            console.log('??? REDUCER SET_RECIPES 22 - ngrxAction.myPayload ', ngrxAction.myPayload);  // << yes. array.
            // MAX Code - uses spread operator, inside literal [ array ] brackets
            return {
                ...ngrxState,
                recipes: [ ...ngrxAction.myPayload ],
            };
/* WR__ Code below - I *think* should work ( ? ) t.b.d.
No use of: [ ], no use of: '...', -- Just put the Recipe[] directly onto the recipes: property. I think works.
btw, SEE ALSO lengthy discussion/comment in ShoppingListReducer.START_EDIT_ACTION
            return {
                ...ngrxState,
                recipes: ngrxAction.myPayload, // << I think works
            };
*/

        default:
            return ngrxState; // as-is

    }

}
