import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';

import { Ingredient } from '../../shared/ingredient.model';

/* NGRX We REMOVE SL Service
import { ShoppingListService } from '../shopping-list.service';
*/

import { NgForm } from '@angular/forms';
import {Subscription} from 'rxjs';
import { Store } from '@ngrx/store';
// NGRX: Yes, you *can* give unwieldy "local" name, here in Component, to the Actions (if you go in for that kind of thing)
import * as MyShoppingListActionsHereInShoppingEdit from '../store/shopping-list.actions';
/* Prob. better:
import * as MyShoppingListActions from '../store/shopping-list.actions';
*/

// To get at State-describing Interface(s), for Type info. e.g. AppState (Interface)
import * as fromShoppingListReducer from '../store/shopping-list.reducer';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

/* No Longer - now NGRX - refactored to ShoppingListReducer
  myIngredientSelectedToEdit: Ingredient; // << This is now (pretty much same idea) the 'localCopyOfMyBeingEditedIngredient'  OK
  myIngredientSelectedToEditIndex: number;
*/
/* Relevant lines from ShoppingListReducer:
  myBeingEditedIngredient: Ingredient;
  // << Hmm, turns out good to still have a local variable here for this; see below: 'localCopyOfMyBeingEditedIngredient'

  myBeingEditedIngredientIndex: number;
  // << This is now set by START_EDIT_ACTION (and reset to -1 by STOP_EDIT_ACTION)
*/
  localCopyOfMyBeingEditedIngredient: Ingredient; // used in ngOnInit()


  myIngredientSelectedToEditIndexSubscription: Subscription;
  myStoreSubscription: Subscription; // << NGRX

  @ViewChild('myFormRef', { static: false}) myForm: NgForm;

  @ViewChild('ingredientNameInput', { static: false }) ingredientNameInputRef: ElementRef;
  @ViewChild('amountInput', { static: false }) amountInputRef: ElementRef;

  editMode = false;

  constructor(
/* NGRX now
      private slService: ShoppingListService,
*/

      // NGRX: No you can't rename, here in the Component, the area of the Store, that was established in AppModule.
      // No: myShoppingListReducerFunctionHereInShoppingEdit
/* WAS WORKING....
      private myStore: Store<{'myShoppingListReducer': {ingredients: Ingredient[]}}>,
*/
      private myStore: Store<fromShoppingListReducer.AppState>,
      ) { }

  ngOnInit() {

/* No Longer SL_SERVICE - instead NGRX
    this.myIngredientSelectedToEditIndexSubscription = this.slService.myIngredientToEditIndex.subscribe((ingredientIndexWeGot: number) => {
      this.myIngredientSelectedToEditIndex = ingredientIndexWeGot;

      /!* No Longer Used. Now NGRX. << But, we don't put the NGRX here *inside*
         the .subscribe() (just above), to SL_SERVICE (!). No.  See below instead
      this.myIngredientSelectedToEdit = this.slService.getIngredient(this.myIngredientSelectedToEditIndex);
      *!/

      this.editMode = true;
      this.letUsEdit(this.myIngredientSelectedToEdit);
    });
*/

    /* NOW: NGRX. Which does its own .subscribe(), on the Observable it returns. Okay.
    Here in ShoppingEdit we want a single index number (something new we'll put on State).
    What Ingredient the user clicked, to update or delete.
    That will be an ACTION referencing the simple Event: e.g. START_EDIT (btw, will beg
    corresponding Action for STOP_EDIT. Hmm.)

    Over in ShoppingList we did .select() on Store for all state data for that part of Store (SL). Ok.
    Over there, we had an Observable variable to "subscribe" to the Store .select().

    Here we also do fetch out with .select() same thing: all state data for that SL part of Store.
    Even though we just want single index number. Ok.
    And here, we instead to explicit .subscribe()
    and assign that to a Subscription. Ok.
     */
    // TODO W-I-P
    this.myStoreSubscription = this.myStore
        /* Yeah Worked:
        .select(state => state.myShoppingListReducer) // also just .select('myShoppingListReducer')
*/
        .select('myShoppingListReducer')
        .subscribe( // TODO 2020-01-28-0820
            (wholeDamnSLStore) => {
              console.log('wholeDamnSLStore ', wholeDamnSLStore);
              /* Yes:
              ingredients: Array(2)
0: Ingredient {name: "ApplesWR__NGRX HardCoded Reducer", amount: 5}
1: Ingredient {name: "TomatoesWR__NGRX HardCoded Reducer", amount: 10}
myBeingEditedIngredient: null
myBeingEditedIngredientIndex: -1
               */

              if (wholeDamnSLStore.myBeingEditedIngredientIndex > -1) { // !== -1) { // << My use of "!==" not so good; ">" better. Cheers.
                // O.K., we have some Ingredient selected, to edit/delete/cancel
                this.editMode = true;

/* No Longer using this variable, 'myIngredientSelectedToEdit', which was managed
    here on the Component, and obtained by calling the Service. No.
   Now it is got from the NGRX Store instead (below: 'myBeingEditedIngredient').
                this.letUsEdit(this.myIngredientSelectedToEdit); // << No Longer.
*/

/*
  PROBLEM 1 - doing reference not copy.
  PROBLEM 2 - doing Store data manipulations here in Component; should be done over in Store
 */
/* PROBLEMATIC !!! PROBLEM 1
See Discussion Comments in ShoppingListReducer START_EDIT_ACTION
Essentially:

>>>  ALWAYS A *COPY*, not Reference. Or, "Spread Operator is your friend."  <<<

That is...
this next line below (Commented Out) uses the Store's actual array for ingredients. << PROBLEMATIC

                wholeDamnSLStore.myBeingEditedIngredient = wholeDamnSLStore.ingredients[wholeDamnSLStore.myBeingEditedIngredientIndex];//No
*/
/* BETTER!
* Make a *COPY*  using ... spread operator
(And, don't forget to put result between Curly Braces {} )   :o)
 */


/*
PROBLEM 2
Yes, next lines did work to fix PROBLEM 1.
But they introduce PROBLEM 2, so, I am Commenting them Out all the same:
 */
/* Fix to PROBLEM 2: Comment Out these lines, to No Longer do this here in Component!
                wholeDamnSLStore.myBeingEditedIngredient = {
                  ...wholeDamnSLStore.ingredients[wholeDamnSLStore.myBeingEditedIngredientIndex]
                };
*/
                /*
                Above line is also problematic, for different reason.
                Not re: copy vs. reference. No, that issue is now all set.
                Above issue instead is:
                - "PROBLEM 2" => we are doing Store data manipulations here in the Component logic, instead
                of back over in the Store (MAX code does it in the Store)
                - here, we are using the Store array (okay, a copy), and the Store index (copy),
                to actually set (assign) the *STORE* ingredient being edited (NOT a copy).
                Hmm. Less than ideal.
                 */

                /*
                Now with Fix to PROBLEM 2 in place above, this line should go okay I think.
                 */
/* PRIOR to Fix PROBLEM 2, I was choosing to get a copy here. hmmm....
                const localCopyOfMyBeingEditedIngredient = { ...wholeDamnSLStore.myBeingEditedIngredient };
*/
/* NOW with Fix PROBLEM 2, apparently (?) per MAX code you do NOT need a copy.
Just access directly this "wholeDamnSLStore" you've got right here.
It is the subscription to the Observable off the Store.select() - so I guess
(almost) needless to say we are talking about a copy or at least not
any direct reference to the actual Store arrays and objects.
So we're SAFE to just access, as-is.
Cool.
 */
                this.localCopyOfMyBeingEditedIngredient = wholeDamnSLStore.myBeingEditedIngredient;
                /*
                Above line tries to ameliorate that a bit, as it makes a COPY (good) from that
                just set/assigned Store object, of the ingredient being edited.
                Okay, guess this does work, but, still, manipulating Store data here in
                Component is not best design.
                 */

/* No, not this way, not directly passing the Store object, tsk, tsk.
                this.letUsEdit(wholeDamnSLStore.myBeingEditedIngredient);
*/
// Yes, pass that local Copy we just made, instead.
                this.letUsEdit(this.localCopyOfMyBeingEditedIngredient);

              } else {
                // We have no selected Ingredient; simply leave the form empty.
              }

            }
        );

/* No, not down here, not outside/below the .select() Observable's .subscribe() (up above).
    this.editMode = true;
    this.letUsEdit(this.myIngredientSelectedToEdit);
*/

  } // /ngOnInit()

  letUsEdit(ingredientToNowEdit: Ingredient) {
    this.myForm.setValue({
      'ingredient-nameName': ingredientToNowEdit.name,
      'amountName': ingredientToNowEdit.amount
    });
  }

  myOnSubmit(formPassedIn: NgForm) {
    const formValue = formPassedIn.form.value;
    this.myForm = formPassedIn;
    const ingredientWeGotPassedIn = new Ingredient(formValue['ingredient-nameName'], formValue.amountName);

    if (!this.editMode) {
      // ADD NEW
      /* Now doing NGRX, no longer Service
            this.slService.addIngredient(ingredientWeGotPassedIn);
      */
      this.myStore.dispatch(new MyShoppingListActionsHereInShoppingEdit.AddIngredientAction(ingredientWeGotPassedIn));
    } else {
      // EDIT/UPDATE EXISTING
/* Now doing NGRX, no longer Service
      this.slService.updateIngredient(this.myIngredientSelectedToEditIndex, ingredientWeGotPassedIn);
 */
      this.myStore.dispatch(new MyShoppingListActionsHereInShoppingEdit
              .UpdateIngredientAction(
/* No. This was initial (WR__) method signature (2 params). Now improved to be a payload object {}
                  this.myIngredientSelectedToEditIndex,
                  ingredientWeGotPassedIn
*/
/*  02  This signature can be further reduced
                  {
/!*   01  No Longer Needed Here - The START_EDIT sets the index number into the State
                    indexPassedIn: this.myIngredientSelectedToEditIndex,
*!/
                    ingredientEdits: ingredientWeGotPassedIn
                  }
*/
                  ingredientWeGotPassedIn // Now myPayload is simply of type Ingredient. Done.
));
    }
    this.myClearForm();
  }

  onDeleteItem() {
/* No Longer Needed Here - The START_EDIT sets the index number into the State
    const indexToDelete: number = this.myIngredientSelectedToEditIndex;
*/
/* No Longer; now NGRX
    this.slService.deleteIngredient(indexToDelete);
*/
    this.myStore.dispatch( new MyShoppingListActionsHereInShoppingEdit.DeleteIngredientAction() ); // >> No >> (indexToDelete));
    // No Longer Needed Here - The START_EDIT sets the index number into the State

    this.myClearForm();
  }

  myClearForm() {
    this.myForm.resetForm();
    this.editMode = false;
    this.myStore.dispatch( new MyShoppingListActionsHereInShoppingEdit.StopEditActionClass() );
  }

  ngOnDestroy(): void {
/* No Longer Using.
    this.myIngredientSelectedToEditIndexSubscription.unsubscribe();
*/
    this.myStoreSubscription.unsubscribe();
    this.myStore.dispatch(new MyShoppingListActionsHereInShoppingEdit.StopEditActionClass()); // ensure that at least here in Component,
      // we are back to initial State upon Destroy this Component
  }

}
