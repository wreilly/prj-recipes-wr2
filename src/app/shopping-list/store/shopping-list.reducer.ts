import { Ingredient } from '../../shared/ingredient.model';
import * as MyShoppingListActions from './shopping-list.actions';

/* INTERFACE? YES, INTERFACE.
   Hmm, MAX Code has an 'interface' here for State.

   Q. What happens if I omit? Hmm. ...

   A. ___ ? Answer is: W-a-a-a-l, you *could* I s'ppose "omit" it.
   BUT! This use of an 'interface' is a SUPER-CONVENIENCE
   and generally good idea/practice.
   SO: INCLUDE IT. Zank you.

   How? Why?
   Because you need to, in various spots,
   indicate the TYPE of your (slice of) the STORE.
   e.g. ShoppingListComponent:
   private myStore: Store<{ myShoppingListViaReducer: { ingredients: Ingredient[] } }>
   Above is OK. but gets unwieldy when you've got:

   private myStore: Store<{ myShoppingListViaReducer:
   { ingredients: Ingredient[],
     myBeingEditedIngredient: Ingredient,
     myBeingEditedIngredientIndex: number } }>

  Better will be use of interface: << N.B. This next line is a GUESS, at this point
   private myStore: Store<{ myShoppingListViaReducer: State }> // << or similar; t.b.d.
*/

export interface StateShoppingListPart { // << Naming convention is just 'State'
    ingredients: Ingredient [];
    myBeingEditedIngredient: Ingredient; // << Came from ShoppingEditComponent
    myBeingEditedIngredientIndex: number; // << Came from ShoppingEditComponent
}

// LECT. 356 ~06:04
// LECT. 360 - Okay, now we finally admit: this "App" level state does NOT belong here in ShoppingListReducer. No suh.
/*
export interface AppState {
/!* ORIG
    myShoppingListReducer: StateShoppingListPart;
*!/
// This was MISSED by IDE Refactoring! (?) Hmm. Well, fixed it manually.
    myShoppingListViaReducer: StateShoppingListPart;
}
*/

const initialStateShoppingListPart: StateShoppingListPart = {
    ingredients: [ // NGRX: refactored here from ShoppingListService, fwiw
        new Ingredient('ApplesWR__NGRX HardCoded Reducer', 5),
        new Ingredient('TomatoesWR__NGRX HardCoded Reducer', 10),
    ],
    myBeingEditedIngredient: null, // initial value: null
    myBeingEditedIngredientIndex: -1, // initial value: -1 is "not a valid index" (What You Want).
    // (Don't select 0 as initial value; 0 of course would be a valid index. Jus' sayin'.)
};

/* EXPERIMENT
Q.
Are 'state' and 'action' reserved, required, words?
Can I use something like 'ngrxState' and/or 'ngrxAction' or 'myShoppingListAction' or 'ngrxSLAction' instead?

A.
Early on... Seems maybe yeah ?

Hmm, bit of NgRx source code (!)
***************************************
And YES I DO SEE 'state' and 'action' therein (below) ... Hmm
--------
node_modules/@ngrx/store/src/models.d.ts:1
--------
export interface Action {
    type: string;
}
...
/!**
 * A function that takes an `Action` and a `State`, and returns a `State`.
 * See `createReducer`.
// https://ngrx.io/api/store/createReducer#description
 *!/
export interface ActionReducer<T, V extends Action = Action> {
    (state: T | undefined, action: V): T; // <<<<<<<<<<<<<<<<<<<<<<<<< hmmmmmm... 'state', 'action'
}
--------
...but, hmm, apparently that does not make them required, reserved words. ok. (MBU)
***************************************
*/

export function shoppingListReducer (
    ngrxState = initialStateShoppingListPart, // ngrxState will get initialState if null
    // state = initialState, // state will get initialState if null

/*
    action: Action, // No longer used. This was just NgRx Action interface
*/
/* When there was only One Action:
    action: MyShoppingListActions.AddIngredientAction, // Now, our specific Action instance. (has ".myPayload")
*/

// Now we have additional Actions, so use this custom "union" 'type' to bring all in:
    ngrxAction: MyShoppingListActions.ShoppingListActionsUnionType,
    // Action instances. (all use ".myPayload" (and ".type" too of course))
): StateShoppingListPart {
    switch (ngrxAction.type) {
/* WAS: 'string'
        case 'ADD_INGREDIENT_ACTION':
NOW: const
*/
        case MyShoppingListActions.ADD_INGREDIENT_ACTION:
            // Do NOT mutate the existing state!! Get a COPY, work on that
            return  {  // reducer returns a new state!
                ...ngrxState, // spread operator gives you a COPY
                ingredients: [
                    ...ngrxState.ingredients, // likewise copy of our ingredients array, up to present...
                    ngrxAction.myPayload // << ostensibly the newly added Ingredient
                ]
            };

        case MyShoppingListActions.ADD_INGREDIENTS_ACTION:
            console.log('ngrxAction.myPayload recipe ADD_INGREDIENTS_ACTION ', ngrxAction.myPayload);
            // https://davidwalsh.name/spread-operator
            console.log('...ngrxAction.myPayload recipe ADD_INGREDIENTS_ACTION ', ...ngrxAction.myPayload);
            return {
                ...ngrxState,
                ingredients: [
                    ...ngrxState.ingredients,

/* No. This puts an array into this array. Not What You Want.
                    ngrxAction.myPayload // Nope.
*/
                    ...ngrxAction.myPayload
                    // << Yes. This puts (inner) array element {} objects into this (outer) array. Just What You Want.
                ]
            };

        case MyShoppingListActions.UPDATE_INGREDIENT_ACTION:

/* No Longer. We do not get the Index # from the Component any longer. START_EDIT_ACTION has already put that Index # on the Store.
            console.log('UPDATE ngrxAction.myPayload.indexPassedIn ', ngrxAction.myPayload.indexPassedIn); // Yep e.g. 1
*/
/* No longer this signature, of nested object w 'ingredientEdits' property:
            console.log('UPDATE ngrxAction.myPayload.ingredientEdits ', ngrxAction.myPayload.ingredientEdits);
*/
            console.log('UPDATE ngrxAction.myPayload ', ngrxAction.myPayload); // Now myPayload is simply of type Ingredient. Done.

/* WR__ - Nah. Not .splice()  Let's change it up.
            // .SPLICE() "in-place" modify array. Maybe not best idea!
            ngrxState.ingredients.splice(ngrxAction.myPayload.indexPassedIn, 1, ngrxAction.myPayload.ingredientEdits);
            console.log('UPDATE ngrxState ', ngrxState);
            /!* Seemstabeokay:
            ingredients: Array(2)
0: Ingredient {name: "Apples EDITED WR__SVC", amount: 5}
1: Ingredient {name: "TomatoesWR__NGRX", amount: 10}
             *!/
*/

/* We get the Index # differently now. Not passed in. Known on the State, thx to START_EDIT_ACTION.
            const myIngredientToBeUpdated: Ingredient = ngrxState.ingredients[ngrxAction.myPayload.indexPassedIn];
*/
            const myIngredientToBeUpdated: Ingredient = ngrxState.ingredients[ngrxState.myBeingEditedIngredientIndex];
            // Above is: Which ingredient (pre-editing values) was selected by user...

            const myIngredientOnceItIsUpdated = {
                ...myIngredientToBeUpdated,
                /* MAX comment re: above line -
                "Arguably optional to put the original ingredient herein,
                since with next line we do overwrite that original ingredient with new edits.

                But - still good practice and does have uses. e.g. if ingredient
                has an ID you don't want to lose/overwrite, etc. Best to incorporate above line.
                 */
/* No longer this signature, of nested object w 'ingredientEdits' property:
                ...ngrxAction.myPayload.ingredientEdits
*/
                ...ngrxAction.myPayload // Now myPayload is simply of type Ingredient. Done.
            };

            const myIngredientsArrayToBeUpdatedACopy = [...ngrxState.ingredients];

            /*
            Now that we have (safe) COPY of array (above), we can modify it (below).

            N.B. This modification seen here is of AN ELEMENT on the array.
            It is NOT (apparently) permissible to just do assign statement
            to ENTIRE array, even though yes it is a copy.
            e.g. myIngredientsArrayToBeUpdatedACopy = []; // << Trying to assign some other array on to it..
            Q. Why is that?
            A. Because we have used 'const' above, in declaring that array copy. (Hmm?)
            So, MBU - a const array, be it copy or not I guess of some other array,
            CAN be modified on an element, but CANNOT be modified by wholesale assignment.
            (Q. Wonder if I'm right.) << A. I tink you are.
             */
/* We get the Index # differently now. Not passed in. Known on the State, thx to START_EDIT_ACTION.
            myIngredientsArrayToBeUpdatedACopy[ngrxAction.myPayload.indexPassedIn] = myIngredientOnceItIsUpdated;
*/
            myIngredientsArrayToBeUpdatedACopy[ngrxState.myBeingEditedIngredientIndex] = myIngredientOnceItIsUpdated;


            return {
                ...ngrxState,
/* Here, because I'd introduced literal array by use of '[ ]',
I in turn needed to use '...' spread operator when inserting into that
empty array, an actual array.
See comment just below.

                ingredients: [
                    // ngrxState.ingredients
                    ...myIngredientsArrayToBeUpdatedACopy
                ]
*/
/*
Here, omitting that literal '[ ]' business, I can also omit the '...' business.
Cheers.
 */
                ingredients: myIngredientsArrayToBeUpdatedACopy,
                myBeingEditedIngredient: null, // Intuitive? hmm.
                // Reset here upon coming back from UPDATE (same for DELETE) Lect. 358 ~02:49
                // See fuller Comment below at DELETE re: these 2 lines (1 above, 1 below)
                myBeingEditedIngredientIndex: -1 // ditto above remark
            };

        case MyShoppingListActions.DELETE_INGREDIENT_ACTION:

            /* HERE TOO, for DELETE - do NOT modify existing array. Eschew .splice(), plz.

            Q. (Hmm, but seems our (MAX) use of .filter() *CAN* be run on existing array? Hmm.
            A. Dumkopff!  (oi) Yes, .filter() *DOES* return you a NEW Array. okay.
             */

/* Unnecessary.
            const myOneIngredientToBeDeleted = {...ngrxState.ingredients[ngrxAction.myPayload]};
*/
            /*
            This (above) kinda useless. You can look at (or log if you like)
            what ingredient you're deleting, but, we don't make any use of this variable.
             */

/* Unnecessary.
            const myIngredientsArrayOneToBeDeletedACopy = [...ngrxState.ingredients];
*/
            /*
            This (above) not needed: "creating a copy". No.
            In fact I hit error when I did the following:
            - created this copy,
            - and tried (below) to run .filter() on that copy...
            - ...with the intention to assign back the now filtered array (copy).
            No. As the copy I made is a 'const' array, you can't just assign wholesale back to it:
            ERROR: "src/app/shopping-list/store/shopping-list.reducer.ts(178,13): error TS2588:
            Cannot assign to 'myIngredientsArrayOneToBeDeletedACopy' because it is a constant."

            Instead we'll be sort of running that .filter() 'in situ' (MAX Code approach).
            That is, he doesn't bother to create a new variable - no need to. // << Dumkopff! .filter MAKES new array. Cheers.
            Hmm. We'll see. << Yah works of course. Cheers.
             */

/* Unnecessary. (and error-generating, too)
            myIngredientsArrayOneToBeDeletedACopy = [ // << No. Cannot ASSIGN ('=') to const
                ...myIngredientsArrayOneToBeDeletedACopy,
                myIngredientsArrayOneToBeDeletedACopy.filter(
                    (nextIngredient, nextIngredientIndexFromFiltering) => {
                        return nextIngredientIndexFromFiltering !== 1; // << HARD-CODED
                    }
                )
            ]
*/
            return {
                ...ngrxState,
                ingredients: ngrxState.ingredients.filter(
                    (nextIngredient, nextIngredientIndex) => {
                        return nextIngredientIndex !== ngrxState.myBeingEditedIngredientIndex; // << PART of STATE = good
                        /*
                        ngrxAction.myPayload; << Initially, got index off action, payload.
                        That approach sort of required the action logic to send it in, upon click,
                        to this particular reducer case/function/method (DELETE and same for UPDATE)

                        Refactoring, as 'twere:
                        Now, we've made that index PART of STATE: state.editedIngredientIndex (MAX code)
                        Now we invoke a central START_EDIT to get that index for BOTH Delete and Update.
                         */
                    }
                ),
                myBeingEditedIngredient: null, // Intuitive? hmm.
                /* Reset here upon coming back from DELETE (same for UPDATE) Lect. 358 ~02:49
                Hmm, MAX says we at this point are also STOP_EDIT, but instead
                of, I don't know, here in middle of this UPDATE Action, calling (?)
                the STOP_EDIT Action, we instead simply sort of do the
                "non-D.R.Y." mode of pasting in 2 lines of logic here,
                that STOP_EDIT does. o well. no biggie.
                (line above re: Ingredient; line below re: IngredientIndex)
                 */
                myBeingEditedIngredientIndex: -1 // ditto above remark

                /* Noop. NOT good idea. NO SPLICE (boo hiss)
                   [
                     ngrxState.ingredients.splice(ngrxAction.myPayload, 1)
                   ]
*/
            };

        case MyShoppingListActions.START_EDIT_ACTION:
/*
SEE PASTED-IN OUTPUT FROM THIS CONSOLE LOGGING FURTHER BELOW
 */
            console.log('{ ...ngrxState.ingredients } ', { ...ngrxState.ingredients });
            console.log('{ ...ngrxState.ingredients[ngrxAction.myPayload] } ', { ...ngrxState.ingredients[ngrxAction.myPayload] });
            /*
            {name: "ApplesWR__NGRX HardCoded Reducer", amount: 5}
name: "ApplesWR__NGRX HardCoded Reducer"
amount: 5
             */

            console.log(' ngrxState.ingredients ',  ngrxState.ingredients );
            console.log(' ngrxState.ingredients[ngrxAction.myPayload] ',  ngrxState.ingredients[ngrxAction.myPayload] );
            /*
            Ingredient {name: "ApplesWR__NGRX HardCoded Reducer", amount: 5}
name: "ApplesWR__NGRX HardCoded Reducer"
amount: 5
             */



/* WR__ INITIAL. Seems to work A-O.K., but, I may be missing something ...

N.B.: I have/had no 'myBeingEditedIngredient' explicitly included (by me) in the 'return {}'
Hmm.
Why? I instead deal with picking out which ingredient, from the Store array
 of ingredients, in logic over in the Store-subscribing() ShoppingEditComponent ngOnInit()
(MAX code does NOT do that.)

            return {
                ...ngrxState,
                myBeingEditedIngredientIndex: ngrxAction.myPayload
            };
*/
/* MAX Code:
Max *does* deal with the picking out of which ingredient, from the Store's array
of ingredients, right here, in the Reducer 'return {}'
(Not, like I am, over in the ShoppingEditComponent.)
 */
            return {
                ...ngrxState,
                myBeingEditedIngredientIndex: ngrxAction.myPayload,
/* N.B. VERY IMPORTANT: ALWAYS A *COPY*, not Reference. Or, "Spread Operator is your friend."

That is...
this next line below (Commented Out) uses the Store's actual array for ingredients. << PROBLEMATIC

Arrays (and Objects) being REFERENCE types, if you modify a reference
to this particular Ingredient object, in our Store's ingredients array,
(e.g. modify over in ShoppingEditComponent),
then you modify the source, too, back in the Store, DIRECTLY. << PROBLEMATIC

You ALWAYS WANT A *COPY* OF A STORE ARRAY, or STORE ARRAY ELEMENT, or other Store data.

>> NO >>        myBeingEditedIngredient: ngrxState.ingredients[ngrxAction.myPayload], // << NO <<

*/

/* MAX Explains: Lect. 357 ~04:40
"The spread operator ... gives you a COPY of the Store's array of ingredients (good),
and the result of that (I (WR__) guess ?) needs to go in curly braces ( ? )."
>> "I need to create a new object which can then be edited without problems by using curly braces."

Q. Curly Braces {} ?
- I guess I don't know how come curly braces are required, but I guess that using spread operator
on an array [] of objects {}, (that is [ {}, {} ]), you get a different result, pulling out an element,
such that you do need to (re)-put {} around the resulting element,
to assign to the property 'myBeingEditedIngredient:'. Okay.
- (As compared to the (Commented Out) line above, which is not using spread operator,
and does not need curly braces for the resulting element it gets out, to assign to
the property 'myBeingEditedIngredient:')

A. Curly Braces {} !
https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14466570#questions/8570924
Jost:
"With the spread operator (...) you can spread out the properties of an object
into a comma-separated list of key/value pairs, and then add new key/value pairs
(or overwrite an existent object property).
The whole is wrapped in curly braces to reconvert the resulting list into a (new) object."

WR__
Hmm, wonder what the syntax for that exactly looks like, a "comma-separated list of key/value pairs"
around which I need to then supply curly braces. Hmm.
e.g. let myObj = {far: 'cry', 'last': 'week', thisTime: 'around'}
>>    'far': 'cry', 'last': 'week', 'thisTime': 'around'    << ?? Seems to be ??
>>    far: 'cry', 'last': 'week', thisTime: 'around'        << ?? Seems to be ?? [**]
>>   ('far': 'cry', 'last': 'week', 'thisTime': 'around')   << ?? Nah.
>>   {'far': 'cry', 'last': 'week', 'thisTime': 'around'}   << ?? Nah.
>>   ['far': 'cry', 'last': 'week', 'thisTime': 'around']   << ?? Nah.
>>   "'far': 'cry', 'last': 'week', 'thisTime': 'around'"   << String seems most likely.
>>   "far: 'cry', 'last': 'week', thisTime: 'around'"       << (ditto)[**]
     [**] And: Perhaps doesn't put single quotes around the keys that didn't have them; dunno
 */
/*
Some Console Logging! (invoked above, before the 'return')

{ ...ngrxState.ingredients }  {0: Ingredient, 1: Ingredient, 2: Ingredient, 3: Ingredient}

{ ...ngrxState.ingredients[ngrxAction.myPayload] }  {name: "ketchup", amount: 1}

ngrxState.ingredients  (4) [Ingredient, Ingredient, Ingredient, Ingredient]

ngrxState.ingredients[ngrxAction.myPayload]  Ingredient {name: "ketchup", amount: 1}

wholeDamnSLStore  {ingredients: Array(4), myBeingEditedIngredient: {…}, myBeingEditedIngredientIndex: 2}
 */

                myBeingEditedIngredient: { ...ngrxState.ingredients[ngrxAction.myPayload] }
            }; // /START_EDIT_ACTION

        case MyShoppingListActions.STOP_EDIT_ACTION:
            return {
                ...ngrxState,
                myBeingEditedIngredientIndex: -1,
                myBeingEditedIngredient: null
            };

        default:
            return ngrxState; // << Yes. (Do not use a "copy" ... here on default. good.)
    }
}
