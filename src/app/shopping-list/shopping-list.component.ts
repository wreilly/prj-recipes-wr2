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

/*
  ingredients: Ingredient[];

  With NgRx we get back an Observable...
*/
  ingredientsForShoppingList: Observable<{ ingredients: Ingredient[]}> ;

  myTemporaryDestroyableSubscriptionForIngredients: Subscription;

  constructor(
      private slService: ShoppingListService,
      private myLoggingService: LoggingService,
      private myStore: Store<{ myShoppingListReducer: { ingredients: Ingredient[] } }>,
      /*
      Store type - JavaScript object.
      One property is the reducer function name (I gave it)
      And that in turn has as its type a nested
      JavaScript object with property of ingredients,
      that is an array of Ingredient types.
       */
      ) { }

  ngOnInit() {

    /* Perhaps name is too descriptive, too specific: "ingredientsForShoppingList"
    - Yes, the yield here is indeed the ingredients, that go on the shopping-list. true.
    - But, the real point here is we obtain "That Area Of The Store" we created for the ShoppingList.
    Mostly, (possibly entirely), that ShoppingList "state" stuff is indeed just list of ingredients,
    *but* if it ever got wider/larger scope, this "too descriptive" name would be less than optimal.
    Better to name it something about ShoppingListStoreArea or something.
    O well - for now, (for ever?), I'll leave as-is = Lazy Me!
     */
    this.ingredientsForShoppingList = this.myStore.select('myShoppingListReducer');


/* BOTH LINES replaced by NgRx (above):
1) GET, 2) SUBSCRIBE
That is, NgRx .select() gets us a slice/copy, and,
returns an Observable.
You specify what part of the Store you want.

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
    // No. this.myLoggingService.printLog(JSON.stringify(this.ingredientsForShoppingList)); // "circular structure..."
/* No.
    this.myLoggingService.printLog(this.ingredientsForShoppingList); // ? printLog() takes a string. But we are handing it:
    Observable<{ingredients: Ingredient[]}>
*/

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

/* Q. Hmm, how do ' | async ' here in TS file?
   A. Hah! You do ".subscribe()". Cheers

   btw - although Angular, for this Store-related Observable
    subscription, will automatically attend to the un-subscribing,
   (I think that's what Max said), best practice still to do
   your own Subscription, ngOnDestroy, and .unsubscribe().
   So I'm told.

   HAH! Update. Well, if you DO "roll yer own," you'd best
   do an IF () TEST to make sure Angular hasn't already beaten
   you to the punch of doing the .unsubscribe() FOR YOU.
   I hit an "undefined" error when that (apparently) occurred.
   See below. Cheers.
* */
    this.myTemporaryDestroyableSubscriptionForIngredients = this.ingredientsForShoppingList.subscribe(
        (objectWeGotWithIngredients) => {
          console.log('objectWeGotWithIngredients (from NgRx Store) ', objectWeGotWithIngredients);
          /* Yes:
          ingredients: (2) [Ingredient, Ingredient]
           */
          if (objectWeGotWithIngredients.ingredients.length > 0) {
            console.log('DO WE GET HERE objectWeGotWithIngredients ', objectWeGotWithIngredients);
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
    // IF TEST needed here!!!
    if (this.myTemporaryDestroyableSubscriptionForIngredients) {
      // tslint:disable-next-line:max-line-length
      console.log('ngOnDestroy ShoppingListComponent - Doing MY OWN .unsubscribe() ', this.myTemporaryDestroyableSubscriptionForIngredients);
      /* Yes:
      ngOnDestroy ShoppingListComponent - Doing MY OWN .unsubscribe()  Subscriber
      {closed: false, _parentOrParents: null, _subscriptions: Array(1), syncErrorValue: null, syncErrorThrown: false, …}
       */
      this.myTemporaryDestroyableSubscriptionForIngredients.unsubscribe();
    } else {
      console.log('ngOnDestroy ShoppingListComponent');
      console.log('Apparently either 1) no subscription, or 2) Angular did the .unsubscribe() FOR ME - Gracias.');
    }
  }
}
