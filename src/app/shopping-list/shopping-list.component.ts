import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';

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

  constructor(private slService: ShoppingListService) { }

  ngOnInit() {
    this.ingredients = this.slService.getIngredients();
/* RXJS SUBJECT NOW
    this.slService.ingredientsChanged
*/
    this.myIngredientsChangedSubscription = this.slService.myIngredientsChangedSubject
      .subscribe(
        (ingredients: Ingredient[]) => {
          console.log('ingredients are now ', ingredients);
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
  } // /ngOnInit()

  populateFormWithIngredient(myIndexPassedIn) {
    console.log('well we are populating. hmm.');

    const yeahIngredientWeSelectedButSoWhat: Ingredient = this.slService.getIngredient(myIndexPassedIn);

    console.log('yeahIngredientWeSelectedButSoWhat ', yeahIngredientWeSelectedButSoWhat); // yeah {name: "ApplesWR__", amount: 5}

    // So yeah the above is interesting but kinda useless.
    // Instead, below, let's do some NEXT-ing. Ya! JoJo Rabbit!
    this.slService.myIngredientToEditIndex.next(myIndexPassedIn);

  }

  ngOnDestroy(): void {
    this.myIngredientsChangedSubscription.unsubscribe();
    // this.myIngredientSelectedToEditSubscription.unsubscribe();
  }
}
