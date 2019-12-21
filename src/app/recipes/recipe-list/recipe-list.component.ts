import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
//  providers: [RecipeService], // << No not here, in AppModule instead
})
export class RecipeListComponent implements OnInit, OnDestroy {
  myTempRecipesArray: [];
  recipes: Recipe[];
  myStuff: any[];
  subscription: Subscription;

  constructor(private recipeService: RecipeService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // this.subscription = this.recipeService.recipesChanged // INSTRUCTOR
    this.subscription = this.recipeService.recipesOnServiceChangedSubject.subscribe(
        (recipes: Recipe[]) => {
          console.log('WR__ in INSTRUCTOR CODE DO WE GET HERE 01 HMM recipes (we got)', recipes); // YES!
          this.recipes = recipes;
          console.log('WR__ in INSTRUCTOR CODE DO WE GET HERE 02 HMM this.recipes ', this.recipes); // YES!
        }
      );
    // this.myTempRecipesArray = this.recipeService.getRecipes();
/* Q. Do Not Need so why use? MBU
   A. Well, on VERY FIRST load no, you're right, recipes[] winds up Empty.
   And yeah, you gotta click "Fetch Data"
   BUT, on subsequent revisits to this component (e.g. click on Shopping List, then
   click back to Recipes), you DO have recipes[] in there. Cheers.
*/
    this.recipes = this.recipeService.getRecipes();
    console.log('this.recipes ', this.recipes);
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
