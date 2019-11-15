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
import {Subscription} from 'rxjs'; // not Form anymore ( ? )

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  myTestKitchenIngredient = new Ingredient('ketchup', 5);
  myTestKitchenIngredientsFromService: Ingredient[]; // no init hey?

  myIngredientSelectedToEditIndex: number;
  myIngredientSelectedToEdit: Ingredient;

  myIngredientSelectedToEditSubscription: Subscription;
  myIngredientSelectedToEditIndexSubscription: Subscription;


/* NO, the FORM should not be declared here as a directly stated class member. No.
   Instead, in an @ViewChild you define/declare it.
  myForm: NgForm; // << no
*/
/* Veddy Interesting. This works to "get" the TD form,
  BUT, we are NOT USING this. We instead
  PASS the form ref in on submit(). Cheers
  */
  @ViewChild('myFormRef', { static: false}) myForm: NgForm;

  @ViewChild('ingredientNameInput', { static: false }) ingredientNameInputRef: ElementRef;
  @ViewChild('amountInput', { static: false }) amountInputRef: ElementRef;

  editMode = false;

  constructor(private slService: ShoppingListService) { }

  ngOnInit() {
    // Step 1. Sign up for updates to array of Ingredients?
    this.slService.myIngredientsChangedSubject.subscribe((whatWeGot) => {
      console.log('whatWeGot Ingredient[] n\'est-ce pas? ', whatWeGot);
    });
    // Step 2. Load up default couple records?  y not
    this.myTestKitchenIngredientsFromService = this.slService.getIngredients();

    // 3. Another task: subscribe to the INDEX for the Ingredient to Edit
    this.myIngredientSelectedToEditIndexSubscription =  this.slService.myIngredientToEditIndex.subscribe((ingredientIndexWeGot: number) => {
      console.log('myIngredientToEditIndex change! ingredientIndexWeGot ', ingredientIndexWeGot);
      this.myIngredientSelectedToEditIndex = ingredientIndexWeGot;
      this.myIngredientSelectedToEdit = this.slService.getIngredient(this.myIngredientSelectedToEditIndex);
      this.editMode = true;
      this.letUsEdit(this.myIngredientSelectedToEdit);
      // What ho I say, peace in this prison. It works!
    });

  } // /ngOnInit()

  letUsEdit(ingredientToNowEdit: Ingredient) {
    this.myForm.setValue({
      'ingredient-nameName': ingredientToNowEdit.name,
      // Huh. nope.  Error: Must supply a value for form control with name: 'ingredient-nameName'.
      amountName: ingredientToNowEdit.amount
    });
  }

  get myDiagnostic() {
    // https://angular.io/guide/forms#template-driven-forms
    // NO NO return (this.myForm.valueOf() | JSON);
    // console.log('00 ', this.myForm);
    // console.log('01 ', this.myForm.value);
    // console.log('02 ', this.myForm.name);
    return JSON.stringify(this.myTestKitchenIngredient);
  }

  myOnSubmit(formPassedIn: NgForm) {
    const formValue = formPassedIn.form.value;
    console.log('01 SUBMIT formValue is it zero or what? ', formValue); // Our story thus far: {} hmmph
    /*
  {  amountName: 4
ingredient-nameName: "ketchup" }
     */
/*
    console.log('02 is formPassedIn.form.value ', formPassedIn.form.value); // yeah same as 03
    console.log('03 is formPassedIn.value ', formPassedIn.value); // yeah same as 02
    console.log('04 is typeof  formPassedIn.form.value.amountName ', typeof formPassedIn.form.value.amountName); // yeah number
    console.log('05 is typeof  formPassedIn.value.amountName ', typeof formPassedIn.value.amountName); // yeah number
*/
/* NOPE
    const ingredientWeGotPassedIn = new Ingredient(formValue.ingredient-nameName, formValue.amountName);

    "BROKE THE CODE" (duh)
    a.k.a. "I (finally) remember what I was taught in JavaScript 101 (ca. 2015, yeesh)"
    An attribute or property or whatever the hell it is, with hyphen,
    you can do the ol' object['property-name'] trick, and IT WORKS.
*/
    const stupyNameForHyphen = formValue['ingredient-nameName']; // Yes. "guacamole"
    const ingredientWeGotPassedIn = new Ingredient(formValue.ingredientNameName, formValue.amountName); // NO. undefined
    const anotherIngredientWeGotPassedIn = new Ingredient(stupyNameForHyphen, formValue.amountName); // Yes. "guacamole"
    // tslint:disable-next-line:max-line-length
    const anotherAnotherIngredientWeGotPassedIn = new Ingredient(formValue['ingredient-nameName'], formValue.amountName); // Yes. "guacamole"

    if (!this.editMode) {
      // ADD NEW
      // this.slService.addIngredient(ingredientWeGotPassedIn); // Nope
      // this.slService.addIngredient(anotherIngredientWeGotPassedIn); // Yes
      this.slService.addIngredient(anotherAnotherIngredientWeGotPassedIn); // Yes.
      /* btw, as we see here, yes DO pass in an ACTUAL NEWED-UP INGREDIENT type, not just look-alike object.
      */

/* Nope:
      this.slService.addIngredient({ name: formValue.ingredient-nameName, amount: formValue.amountName } );
*/
      this.myForm.resetForm();
      this.editMode = false;
    } else {
      // EDIT/UPDATE EXISTING
      const whatWeGotFromFormEdits = this.myForm.value;
      console.log('ING 00', whatWeGotFromFormEdits);
      // {ingredient-nameName: "ketchup", amountName: 4}

      console.log('ING 01', this.myForm.value);
      // {ingredient-nameName: "ketchup", amountName: 4}

      /* No! You've got the values okay, but
      you need to map these property names you
      dreamed up here in the code to MATCH what
      the actual MODEL for Ingredient is!

      FIX: *********************************
      You should "new" up an Ingredient explicitly,
      not just pass in a homemade object that is
      "kinda like an Ingredient" object. No.
      **************************************

      IS NOW:
      { ingredient-nameName: "ApplesWR__ are goodf", amountName: 6}
      NEEDS TO BECOME:
      { name: "ApplesWR__ are goodf", amount: 6}
       */

      /* O la. One more investigation (piccolo)
      How about: correct property names, but,
      do *not* do new(). Hmm.
       */
      const myAlmostIngredient = {
        name: whatWeGotFromFormEdits['ingredient-nameName'],
        amount: whatWeGotFromFormEdits.amountName
      };
/* ORIG: back to original. Cheers */
      this.slService.updateIngredient(this.myIngredientSelectedToEditIndex, whatWeGotFromFormEdits);


/* Little Test Investigation. Cheers
      this.slService.updateIngredient(this.myIngredientSelectedToEditIndex, myAlmostIngredient);
*/
      /* Yes, we get what I expected: that first entry
      is no longer an Ingredient, even though the property
      names do match. Okay. Makes sense.

      this.ingredients: Array(3)
0: {name: "ApplesWR__edittime", amount: 555}
1: Ingredient {name: "TomatoesWR__", amount: 10} ...

       */
      this.myForm.resetForm();
      this.editMode = false;
    }
  }

  onDeleteItem() {
    const indexToDelete: number = this.myIngredientSelectedToEditIndex;
    this.myForm.resetForm();
    this.editMode = false;

    this.slService.deleteIngredient(indexToDelete);
  }

  myClearForm() {
    this.myForm.resetForm();
    this.editMode = false;
  }

  onAddItem() { // OK *NOW* No Longer Used ...
    // superseded by myOnSubmit()
    // We make the one button do both: Add / Update
    /* Interesting.
    This OLDER method does NOT use, is not part of,
    "template-driven" forms.
    It just uses @ViewChild() to grab a
    referenceable element off the DOM,
    then we inspect/grab its .value.
    No "form" coordination, no other
    elements considered, no NgModel usage.
    See myOnSubmit() above where we
    DO use those things, for template-driven.
    Cheers.
     */
    const ingName = this.ingredientNameInputRef.nativeElement.value;
    const ingAmount = this.amountInputRef.nativeElement.value;
    console.log('00 ingAmount is it zero or what? ', ingAmount);
    console.log('01 ingAmount = this.amountInputRef.nativeElement.value ', ingAmount);
    console.log('02 this.amountInputRef.nativeElement.value ', this.amountInputRef.nativeElement.value);
    console.log('03 typeof ingAmount ', typeof ingAmount); // OH YEAH BABY. This here is a STRING.  "55"

    // hmm, WHEN I leave it empty/untouched, etc., appears to be nothing ( ? )  OK
    // O.k. - debugging I see it is empty string "" OK
    const newIngredient = new Ingredient(ingName, ingAmount);
    this.slService.addIngredient(newIngredient);
  }

  ngOnDestroy(): void {
    this.myIngredientSelectedToEditSubscription.unsubscribe();
  }

}
