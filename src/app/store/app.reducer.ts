import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromShoppingListReducer from '../shopping-list/store/shopping-list.reducer';
import * as fromAuthReducer from '../auth/store/auth.reducer';
/* This would be redundant, w line above.
Though I do now need to comment-out the "OLD"
stuff below

import {StateAuthPart} from '../auth/store/auth.reducer';
*/

export interface MyOverallRootState {
    shoppingListPartOfStore: fromShoppingListReducer.StateShoppingListPart;
    authPartOfStore: fromAuthReducer.StateAuthPart;
}

export const myRootReducersMap: ActionReducerMap<MyOverallRootState> = {
    /*
    These property names below (LHS) (left-hand-side) must match the property names
    defined in the interface, just above, for type MyOverallRootState.
    Cheers.
     */
    shoppingListPartOfStore: fromShoppingListReducer.shoppingListReducer,
    authPartOfStore: fromAuthReducer.authReducer,
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
