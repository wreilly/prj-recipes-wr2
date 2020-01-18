import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';
import { LoggingService } from '../logging.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  ingredients: Ingredient[];
  ingredientSelectedToEdit: Ingredient;

  myIngredientsChangedSubscription = new Subscription();
/* No. Not needed in this component. From here we SEND (.next), not Subscribe. Cheers. (We Subscribe over in ShoppingEditComponent)
  myIngredientSelectedToEditSubscription = new Subscription();
*/

  constructor(
      private slService: ShoppingListService,
      private myLoggingService: LoggingService,
      ) { }

  ngOnInit() {
    console.log('HEY !!! 01 ngOnInit() is running on ShoppingListComponent. this.ingredients is BEFORE ', this.ingredients);
    this.ingredients = this.slService.getIngredients();
    console.log('HEY !!! 02 ngOnInit() is running on ShoppingListComponent. this.ingredients is AFTER ', this.ingredients);
/* RXJS SUBJECT NOW
WAS:
    this.slService.ingredientsChanged
*/

/* NAH NOPE NO
EXPERIMENT 02 plain old Observable ( ? )

    this.slService.myIngredientsChangedObservable.subscribe((whatWeGot) => {
      console.log('whatWeGot plain old Observable ? ', whatWeGot); // NOT HEARD FROM
    })
*/
    this.myIngredientsChangedSubscription = this.slService.myIngredientsChangedSubject
      .subscribe(
        (ingredients: Ingredient[]) => {
          // tslint:disable-next-line:max-line-length
          console.log('ING WR__ DO WE GET HERE **YES** - Both Add New & Update Existing. ? ingredients are now ', ingredients);
          this.ingredients = ingredients;
        }
      );

/* No - There Is No Need for this Shopping List Component
to subscribe to this Subject. Nope.
Here in the List, we SEND (.next()) TO that Subject, over
on the Service
Let OTHER Components (like Shopping Edit Component) do
the Subscribing etc.

    this.myIngredientSelectedToEditSubscription = this.slService.myIngredientToEdit.subscribe((ingredientToEditWeGot) => {
      this.ingredientSelectedToEdit = ingredientToEditWeGot;

    });
*/

    this.myLoggingService.printLog('ShoppingListComponent says Hi');

  } // /ngOnInit()

  populateFormWithIngredient(myIndexPassedIn) {
    console.log('well we are populating. hmm.');

    const yeahIngredientWeSelectedButSoWhat: Ingredient = this.slService.getIngredient(myIndexPassedIn);

    console.log('yeahIngredientWeSelectedButSoWhat ', yeahIngredientWeSelectedButSoWhat); // yeah {name: "ApplesWR__", amount: 5}

    // So yeah the above is interesting but kinda useless.
    // Instead, below, let's do some NEXT-ing. Ya! JoJo Rabbit!
    this.slService.myIngredientToEditIndex.next(myIndexPassedIn);

  }

  myClearShoppingList(): void {

    if (this.ingredients.length > 0) {
/* Hah! No!
Not simply clear the local array of Ingredients here on the Component. No.
      this.ingredients = []; // just clear it ?
*/

      this.slService.deleteAllIngredients(); // that's it!

    }
  }

  ngOnDestroy(): void {
    this.myIngredientsChangedSubscription.unsubscribe();
    // this.myIngredientSelectedToEditSubscription.unsubscribe();
  }
}
