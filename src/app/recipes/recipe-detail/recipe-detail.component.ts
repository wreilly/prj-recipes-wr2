import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
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
    /*
    Even with NGRX - From here in the COMPONENT, we still do invoke the SERVICE. O.K.
    So the line above is UNCHANGED.
    It is over in the SERVICE that we actually use NGRX. Cheers.
     */
  }

  onEditRecipe() {
    // Both work:
    // this.router.navigate(['edit'], {relativeTo: this.route});
    this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  myOnDeleteRecipe() {

    this.myRecipeService.deleteRecipe(this.id);
    this.router.navigate(['recipes'])
        .then(
            (resolvedWeGot) => {
              console.log('OnDeleteRecipe, navigation worked. resolvedWeGot ', resolvedWeGot);
            },
            (rejectedOrErrorWeGot) => {
              console.log('OnDeleteRecipe, navigation failed. rejectedOrErrorWeGot ', rejectedOrErrorWeGot);
              /*
              Error: Cannot match any routes. URL Segment: 'recipesfoobar' ...
               */
            }
        );
  }

}
