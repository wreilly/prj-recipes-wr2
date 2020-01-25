import { Component, OnInit , OnDestroy} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';
import { LoggingService } from '../logging.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

/* No Longer:
  ingredients: Ingredient[];

  With NgRx we get back an *Observable*...
*/
  ingredientsForShoppingList: Observable<{ ingredients: Ingredient[]}> ;

  myTemporaryDestroyableSubscriptionForIngredients: Subscription;

  constructor(
      private slService: ShoppingListService,
      private myLoggingService: LoggingService,
/* No you can't rename, here in the Component, the area of the Store,
   that was established over in AppModule.
      private myStore: Store<{ myShoppingListReducerFunctionHereInShoppingList: { ingredients: Ingredient[] } }>, // << No
*/
      private myStore: Store<{ myShoppingListReducer: { ingredients: Ingredient[] } }>,
      /*
      myStore is an object property
      It is of type Store - which in turn is a JavaScript object.
      One property on that object is the reducer function name (which I gave it, in AppModule).
      And that property ('myShoppingListReducer') in turn has as its type,
      a nested JavaScript object with property of 'ingredients', and
      that has as its type an array of Ingredient types.
       */
      ) { }

  ngOnInit() {

    this.ingredientsForShoppingList = this.myStore.select('myShoppingListReducer');

/* BOTH LINES (below) replaced by NgRx (above):
// OLDER CODE:
    this.ingredients = this.slService.getIngredients();

    this.myIngredientsChangedSubscription = this.slService.myIngredientsChangedSubject
      .subscribe(
        (ingredients: Ingredient[]) => {
          this.ingredients = ingredients;
        }
      );
*/

    this.myLoggingService.printLog('ShoppingListComponent says Hi');

  }

  populateFormWithIngredient(myIndexPassedIn: number) {
    this.slService.myIngredientToEditIndex.next(myIndexPassedIn);
  }

  myClearShoppingList(): void {

    this.myTemporaryDestroyableSubscriptionForIngredients = this.ingredientsForShoppingList.subscribe(
        (objectWeGotWithIngredients) => {
          console.log('objectWeGotWithIngredients (from NgRx Store) ', objectWeGotWithIngredients);
          /* Yes:
          ingredients: (2) [Ingredient, Ingredient]
           */
          if (objectWeGotWithIngredients.ingredients.length > 0) {
            console.log('DO WE GET HERE objectWeGotWithIngredients ', objectWeGotWithIngredients); // Yes

            // TODO W-I-P no more ingredients are being seen on Service; headed to NGRX
            let whatIngredientsAreInService: Ingredient[] = this.slService.getIngredients();
            console.log('whatIngredientsAreInService 01 object ', whatIngredientsAreInService);
            this.slService.deleteAllIngredients(); // that's it!
            whatIngredientsAreInService = this.slService.getIngredients(); // go back and get again
            console.log('whatIngredientsAreInService 02 object', whatIngredientsAreInService); // yes []
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
