import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
  // providers: [RecipeService],
  /*
  UPDATE:
  Now need to *remove* Service provision from here in
  Component; use shared one in AppModule instead.

  WAS:
  O la. Error without above.
  See also 1) RecipesComponent *used to* have (no longer) this entry
  2) RecipeListComponent *does have* this entry
  P.S. You'd think I could just put it on AppModule, but maybe that's overkill etc.
  P.P.S. Prob we are headed to refactoring to a RecipeModule ... T.B.D.
   */
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private myRecipeService: RecipeService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.recipe = this.myRecipeService.getRecipe(this.id);
        }
      );
  }

  onAddToShoppingList() {
    this.myRecipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
    // this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  myOnDeleteRecipe() {
    /* Notes:
    Simple mode. Just delete Recipe entire.
    No concerns re: Shopping List of Ingredients
    Any Ingredient on this about-to-be-deleted Recipe *may* continue
    to be over on the Shopping List. No problem.

    Advanced mode would be: any Ingredient on this Recipe,
    that is over on the Shopping List (that is, the "To Shopping List"
    function was executed, once), ought also
    be removed from the Shopping List.
    (I.e., if two Recipes had Ingredient of 'Salami' '4', when
    you Delete one of those Recipes, that Ingredient ought not be removed.)

    Advanced mode would be: any Ingredient on this Recipe,
    that is *uniquely* on the Shopping List, ought also
    be removed from the Shopping List.
    (I.e., if two Recipes had Ingredient of 'Salami' '4', when
    you Delete one of those Recipes, that Ingredient ought not be removed.)

    Hah! I was wrong. (ye gods)
    There will *not be* "unique" Ingredient entries.
    With above scenario, you get 'Salami' '4' and then again 'Salami' '4'.
    We'd have to rewrite things to have it become 'Salami' '8'
     */

    this.myRecipeService.deleteRecipe(this.id);
    this.router.navigate(['recipes']) // ['recipesfoobar'])
        .then(
            (resolvedWeGot) => {
              console.log(resolvedWeGot); // resolve  e.g. true
            },
            (rejectedOrErrorWeGot) => {
              console.log(rejectedOrErrorWeGot); // rejected (navigation failed)
              /* Yep:  tried ['recipesfoobar'] = no way:
              Error: Cannot match any routes. URL Segment: 'recipesfoobar'
    at ApplyRedirects.push../node_modules/@angular/router/fesm5/router.js.ApplyRedirects.noMatchError (router.js:2459)
               */
            }
        );
  }

}
