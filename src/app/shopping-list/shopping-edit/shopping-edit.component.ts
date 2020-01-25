import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';

import { Ingredient } from '../../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import { NgForm } from '@angular/forms';
import {Subscription} from 'rxjs';
import { Store } from '@ngrx/store';
// NGRX: Yes, you can give unwieldy "local" name, here in Component, to the Actions (if you go in for that kind of thing)
import * as MyShoppingListActionsHereInShoppingEdit from '../store/shopping-list.actions';
/* Prob. better:
import * as MyShoppingListActions from '../store/shopping-list.actions';
*/

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  myIngredientSelectedToEditIndex: number;
  myIngredientSelectedToEdit: Ingredient;

  myIngredientSelectedToEditIndexSubscription: Subscription;

  @ViewChild('myFormRef', { static: false}) myForm: NgForm;

  @ViewChild('ingredientNameInput', { static: false }) ingredientNameInputRef: ElementRef;
  @ViewChild('amountInput', { static: false }) amountInputRef: ElementRef;

  editMode = false;

  constructor(
      private slService: ShoppingListService,
      // NGRX: No you can't rename, here in the Component, the area of the Store, that was established in AppModule.
      // No: myShoppingListReducerFunctionHereInShoppingEdit
      private myStore: Store<{'myShoppingListReducer': {ingredients: Ingredient[]}}>,
      ) { }

  ngOnInit() {

    this.myIngredientSelectedToEditIndexSubscription = this.slService.myIngredientToEditIndex.subscribe((ingredientIndexWeGot: number) => {
      this.myIngredientSelectedToEditIndex = ingredientIndexWeGot;
      this.myIngredientSelectedToEdit = this.slService.getIngredient(this.myIngredientSelectedToEditIndex);
      this.editMode = true;
      this.letUsEdit(this.myIngredientSelectedToEdit);
    });

  }

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
                  this.myIngredientSelectedToEditIndex,
                  ingredientWeGotPassedIn
              ));
    }
    this.myClearForm();
  }

  onDeleteItem() {
    const indexToDelete: number = this.myIngredientSelectedToEditIndex;
    this.slService.deleteIngredient(indexToDelete);
    this.myClearForm();
  }

  myClearForm() {
    this.myForm.resetForm();
    this.editMode = false;
  }

  ngOnDestroy(): void {
    this.myIngredientSelectedToEditIndexSubscription.unsubscribe();
  }

}
