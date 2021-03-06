import { Component, OnInit , OnDestroy} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ingredient } from '../shared/ingredient.model';

/* NGRX We REMOVE SL Service
import { ShoppingListService } from './shopping-list.service';
*/

import { LoggingService } from '../logging.service';

/*
EXPERIMENT: Can I import the SL REDUCER here to get at the new INTERFACE?
Y not sez I
(I see, peeking ahead at Instructor Code, we'll have a far more advanced way
 of getting this imported here, etc., later. Cheers.)
 1. I first did the first Interface, 'StateShoppingListPart'
 2. Then that got superseded by our next Interface for 'AppState', which incorporates the 'StateShoppingListPart' Interface. Cheers.
 */

/* Now superseded by "*" line just below, hey?
import { StateShoppingListPart } from './store/shopping-list.reducer';
*/
// Correct, MAX Code way: (we'll be using this soon) TODO fromShoppingListReducer
// (Note: We (I?) are (am?) using this MAX way over in ShoppingEditComponent. Cheers.)
/* No longer. Now AppReducer instead
import * as fromShoppingListReducer from './store/shopping-list.reducer';
*/

import * as fromRoot from '../store/app.reducer';

import * as MyShoppingListActionsHereInShoppingList from './store/shopping-list.actions';
// Better would simply be: MyShoppingListActions

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

/* No Longer:
  ingredients: Ingredient[];

  With NgRx we get back an *Observable*...

  Hmm, N.B. This *used to be* the entire State (for SL), namely ingredients array.
  *Now* it is but a part/slice of that State (for SL).
  Q. Does this type in next line need to change?
  A. ? guessing not ?
*/
  ingredientsForShoppingList: Observable<{ ingredients: Ingredient[]}>; // << stet?

  myTemporaryDestroyableSubscriptionForIngredients: Subscription;

  constructor(
/* NGRX now:
      private slService: ShoppingListService,
*/

      private myLoggingService: LoggingService,
/* No you can't rename, here in the Component, the area of the Store,
   that was established over in AppModule.
      private myStore: Store<{ myShoppingListReducerFunctionHereInShoppingList: { ingredients: Ingredient[] } }>, // << No
*/

/* Initial Store type:
      private myStore: Store<{ myShoppingListViaReducer: { ingredients: Ingredient[] } }>,
*/
      /* Initial Store type:
      myStore is an object property
      It is of type Store - which in turn is a JavaScript object.
      One property on that object is the reducer function name (which I gave it, in AppModule).
      And that property ('myShoppingListViaReducer') in turn has as its type,
      a nested JavaScript object with property of 'ingredients', and
      that has as its type an array of Ingredient types.
       */

/* Hmm. No: not *just* the type. See next line for right way...
      private myStore: Store<StateShoppingListPart>,
*/
/* This WORKED OK: put in the "property name" of 'myShoppingListViaReducer'
      private myStore: Store<{ myShoppingListViaReducer: StateShoppingListPart }>, // << Now, this "SL Part" Interface as type
*/

/* No. Now, with overall AppState interface, we do NOT want the "property name" of 'myShoppingListViaReducer' here
      private myStore: Store<{ myShoppingListViaReducer: AppState }>,
*/
// private myStore: Store<AppState>, // << Now, this overall AppState Interface as type << No longer
// private myStore: Store<fromShoppingListReducer.StateShoppingListPart>, // << Now AppReducer instead
         private myStore: Store<fromRoot.MyOverallRootState>,
      ) { }

  ngOnInit() {

/* Working OK!
Recall: "LHS vs RHS" - LHS with 'my' is the "mapped name" (I gave it), over in AppModule.
RHS is the exported name of the reducer function. I called it simply 'shoppingListReducer' (no 'my')
So:
'myShoppingListViaReducer' is the property name on the Store type definition
Whereas 'shoppingListReducer' is the name of exported reducer FUNCTION
So, yes, the .select() here invokes the property name on the part of the Store:
*/
/* No longer. Now AppReducer, to get at the ShoppingListState .... (following line)
    this.ingredientsForShoppingList = this.myStore.select('myShoppingListViaReducer');
*/
    this.ingredientsForShoppingList = this.myStore.select(fromRoot.getShoppingListState);

/* No, shouldn't need to do this.
The .select() is on what you named that part of the Store.
It is not on the name you gave to the reducer function, per se.
    this.ingredientsForShoppingList = this.myStore.select('shoppingListReducer'); // << No.
*/

/* BOTH LINES (below) replaced by NgRx (above):
// OLDER CODE:
    // GET
    this.ingredients = this.slService.getIngredients();

    // SUBSCRIBE
    this.myIngredientsChangedSubscription = this.slService.myIngredientsChangedSubject
      .subscribe(
        (ingredients: Ingredient[]) => {
          this.ingredients = ingredients;
        }
      );
*/

    this.myLoggingService.printLog('ShoppingListComponent says Hi');

  } // /ngOnInit()

  populateFormWithIngredient(myIndexPassedIn: number) { // << "onEditItem()"
    /*
    A.K.A. what I (kinda crazy) named
      "populateFormWithIngredients()"
    is what MAZ code calls
      "onEditItem()"

    fwiw, START_EDIT - is used for BOTH Delete and for Update
     */
/* No Longer Used (now NGRX)
    this.slService.myIngredientToEditIndex.next(myIndexPassedIn);
*/
    /* CLASS NEEDS NEW() !!!
    N.B. I (temporarily?) renamed appending 'Class' to StartEditAction {}
    over in ShoppingListActions.
    Why?
    To help me remember (I continually forget!) to do a
    new() on these Action Classes when invoking them on
    a .dispatch() here in the Component code!!!

    That is, I continually do: (NO NEW())
        this.myStore.dispatch(MyShoppingListActionsHereInShoppingList.StartEditActionClass(myIndexPassedIn));

    Need to be doing: (WITH NEW())
        this.myStore.dispatch(new MyShoppingListActionsHereInShoppingList.StartEditActionClass(myIndexPassedIn));
     */
    this.myStore.dispatch(new MyShoppingListActionsHereInShoppingList.StartEditActionClass(myIndexPassedIn));
  } // /populateFormWithIngredient() a.k.a. // << "onEditItem()"

  myClearShoppingList(): void {

    this.myTemporaryDestroyableSubscriptionForIngredients = this.ingredientsForShoppingList // << Yes, from NGRX Store .select()...
        .subscribe(
        (objectWeGotWithIngredients) => {
          console.log('objectWeGotWithIngredients (from NgRx Store) ', objectWeGotWithIngredients);
          /* Yes:
          ingredients: (2) [Ingredient, Ingredient]
           */
          if (objectWeGotWithIngredients.ingredients.length > 0) {
            console.log('DO WE GET HERE objectWeGotWithIngredients ', objectWeGotWithIngredients); // Yes

            // TODO W-I-P no more ingredients are being seen on Service; headed to NGRX
/* NGRX We have REMOVED SL Service.
W-I-P - We still have NOT yet done NGRX for "Clear all ingredients" off Shopping List TODO 2020-01-30-1420
            let whatIngredientsAreInService: Ingredient[] = this.slService.getIngredients();
            console.log('whatIngredientsAreInService 01 object ', whatIngredientsAreInService);
            this.slService.deleteAllIngredients(); // that's it!
            whatIngredientsAreInService = this.slService.getIngredients(); // go back and get again
            console.log('whatIngredientsAreInService 02 object', whatIngredientsAreInService); // yes []
*/
          }
        }
    );
  }

  ngOnDestroy() {
    // an IF TEST is needed here!!!
    if (this.myTemporaryDestroyableSubscriptionForIngredients) {
      this.myTemporaryDestroyableSubscriptionForIngredients.unsubscribe();
    } else {
      console.log('ngOnDestroy ShoppingListComponent');
      console.log('Apparently either 1) no subscription, or 2) Angular did the .unsubscribe() FOR ME');
    }
  }
}
