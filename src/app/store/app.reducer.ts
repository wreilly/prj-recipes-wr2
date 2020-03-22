import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromShoppingListReducer from '../shopping-list/store/shopping-list.reducer';
import * as fromAuthReducer from '../auth/store/auth.reducer';
/* This would be redundant, w line above.
Though I do now need to comment-out the "OLD"
stuff below

import {StateAuthPart} from '../auth/store/auth.reducer';
*/

import * as fromRecipeReducer from '../recipes/store/recipe.reducer';

/* ****  NGRX WITH  ROUTER  ************************************
https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14466622#questions/7489756
    ----------
Jost TA:
    "...add the router state as an additional slice (the rest is handled automatically by the router store package):
----------
/store/app.reducer.ts
-----------
*/
import * as fromRouter from '@ngrx/router-store';

/* My root interface is below, as "MyOverallRootState". Cheers.
export interface AppState {
    ...
    router: fromRouter.RouterReducerState;
}
*/

/* My root "appReducer" is below, as "myRootReducersMap". Cheers.
export const appReducer: ActionReducerMap<AppState> = {
    ...
        router: fromRouter.routerReducer
};
    ******  /NGRX w ROUTER  ***********************************
*/


export interface MyOverallRootState {
    shoppingListPartOfStore: fromShoppingListReducer.StateShoppingListPart;
    authPartOfStore: fromAuthReducer.StateAuthPart;
    recipePartOfStore: fromRecipeReducer.StateRecipePart,
    routerPartOfStore: fromRouter.RouterReducerState; // from Jost TA
}

export const myRootReducersMap: ActionReducerMap<MyOverallRootState> = {
    /*
    These property names below (LHS) (left-hand-side) must match the property names
    defined in the interface, just above, for type MyOverallRootState.
    Cheers.
     */
    shoppingListPartOfStore: fromShoppingListReducer.shoppingListReducer,
    authPartOfStore: fromAuthReducer.authReducer,
    recipePartOfStore: fromRecipeReducer.recipeReducer,
    routerPartOfStore: fromRouter.routerReducer, // from Jost TA
};

export const getShoppingListState = createFeatureSelector<fromShoppingListReducer.StateShoppingListPart>('shoppingListPartOfStore');

export const getAuthState = createFeatureSelector<fromAuthReducer.StateAuthPart>('authPartOfStore');

/* OLD no longer used
export const getIsAuthenticatedInStoreOLD = createSelector(
    getAuthState,
    (statePassedIn: StateAuthPart): boolean => {
        return !!statePassedIn.myAuthedUser;
    }
);
*/

export const getRecipeState = createFeatureSelector<fromRecipeReducer.StateRecipePart>('recipePartOfStore');

export const getIsAuthenticatedInStore = createSelector(
    getAuthState,
    fromAuthReducer.getIsAuthenticatedFromStateAuthPart
);
// Above. https://ngrx.io/guide/store/selectors#using-a-selector-for-one-piece-of-state


/* NO SUH. This (below) is NOT what the AppReducer, the Root Reducer, does.
Unlike other, non-Root, reducers, it does not take a State and an Action
as parameters into a function that it exports. No.
Instead, it importantly exports that const myRootReducersMap, above.
Cheers.

export function AppReducer (
    ngrxRootState,
    ngrxRootAction
) { }
*/
