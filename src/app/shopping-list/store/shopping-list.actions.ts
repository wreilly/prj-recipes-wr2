import {Action} from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';

/*
"use consts, to ...rule out making typos..."
(it gets the IDE and TSLint to help you ...)
 */
export const ADD_INGREDIENT_ACTION = 'ADD_INGREDIENT_ACTION';
export const ADD_INGREDIENTS_ACTION = 'ADD_INGREDIENTS_ACTION';
export const UPDATE_INGREDIENT_ACTION = 'UPDATE_INGREDIENT_ACTION';
export const DELETE_INGREDIENT_ACTION = 'DELETE_INGREDIENT_ACTION';
export const START_EDIT_ACTION = 'START_EDIT_ACTION'; // LOAD this item into Edit Form
export const STOP_EDIT_ACTION = 'STOP_EDIT_ACTION';

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
    constructor(public myPayload: Ingredient) { } // N.B. All these Actions use same name 'myPayload' = good

}

export class AddIngredientsAction implements Action {
    readonly type = ADD_INGREDIENTS_ACTION;
    constructor(public myPayload: Ingredient[]) { }
}

export class UpdateIngredientAction implements Action {
    readonly type = UPDATE_INGREDIENT_ACTION;
/* WR__: << not such good idea, 2 individual params
    constructor(
        public index: number,
        public myPayload: Ingredient
    ) {
    }
*/
// MAX Instructor Code: (keeps consistent constructor signature of "myPayload")
    constructor(
/*  02  This signature can be further reduced:
        public myPayload: {
/!*  01  No Longer Needed Here - The START_EDIT sets the index number into the State
                indexPassedIn: number,
*!/
                ingredientEdits: Ingredient
            }
*/
    public myPayload: Ingredient // 02 Now, the entire 'myPayload' is simply of type Ingredient
    ) { }
}

export class DeleteIngredientAction implements Action {
    readonly type = DELETE_INGREDIENT_ACTION;
/* WR__: Yes, keep signature to "myPayload", good. But, doesn't need
          excess structure of object {}, for just one param; see below
    constructor(
        public myPayload:
            {
                indexPassedIn: number
            }
    ) {
    }
*/
/* Nope! Not needed! See Q. & A. just below...
    constructor(public myPayload: number) { }
   // No Longer Needed Here - The START_EDIT sets the index number into the State
*/
    /*
    Q. Hmm, does DELETE take a payload?
    Ought not need it, right?
    The index # is already known: "myBeingEditedIngredientIndex" on the Store, n'est-ce pas?
    Hmm...

    A. (MAX Code) = Right you are, Wm.! NO Payload on MAX Code. Cheers. (No constructor() either.)
     */
} // /DeleteIngredientAction {}

export class StartEditActionClass implements Action {
    /* CLASS NEEDS NEW() !!!
    N.B. I (temporarily?) renamed appending 'Class'
    Why?
    To help me remember (I continually forget!) to do a
    new() on these Action Classes when invoking them on
    a .dispatch() over in the Component code!!! (e.g. ShoppingListComponent)

    That is, I continually do: (NO NEW())
        this.myStore.dispatch(MyShoppingListActionsHereInShoppingList.StartEditActionClass(myIndexPassedIn));

    Need to be doing: (WITH NEW())
        this.myStore.dispatch(new MyShoppingListActionsHereInShoppingList.StartEditActionClass(myIndexPassedIn));
     */
    readonly type = START_EDIT_ACTION;
    constructor(public myPayload: number) { }
}

export class StopEditActionClass implements Action {
    readonly type = STOP_EDIT_ACTION;
/* No. No payload, no index number needed, no constructor.
    constructor(public myPayload: number) { }
*/
}

export type ShoppingListActionsUnionType =
      AddIngredientAction
    | AddIngredientsAction
    | UpdateIngredientAction
    | DeleteIngredientAction
    | StartEditActionClass
    | StopEditActionClass; // Union of types, using pipe
/*
Obvious to others, but I didn't know: 'type' here is a reserved word, for sure.
You cannot say: "export mySpecialListOfTypes ShoppingListActionsUnionType = ..." // << NO.
 */
