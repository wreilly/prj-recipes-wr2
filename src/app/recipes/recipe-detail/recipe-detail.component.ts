import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/app.reducer';
import {StateRecipePart} from '../store/recipe.reducer'; // huh. guess we need this, in addition to fromRoot
// see typing of Observable<StateRecipePart> below
// doesn't work as Observable<fromRoot.getRecipePart>  Don't know how come. hmm.

import * as RecipeActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(
      private myRecipeService: RecipeService,
      private route: ActivatedRoute,
      private router: Router,
      private myStore: Store<fromRoot.MyOverallRootState>,
  ) {  }

  ngOnInit() {
/* 01 - No Longer using RecipeService.getRecipe()....
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.recipe = this.myRecipeService.getRecipe(this.id);
        }
      );
*/
/* 02 - One Way To Do It - All under that initial .subscribe() to Route Params */
/*
      this.route.params
          .subscribe(
              (params: Params) => {
                  this.id = +params['id'];
                  // this.recipe = this.myRecipeService.getRecipe(this.id);
                  this.myStore.select(fromRoot.getRecipeState)
                      .pipe(
                          map(
                              (stateRecipePartWeGot) => {
                                  return stateRecipePartWeGot.recipes.find(
                                      (eachRecipe: Recipe, eachRecipeIndex) => {
                                          console.log('eachRecipeIndex ', eachRecipeIndex);
                                          console.log('eachRecipe ', eachRecipe);
                                          return eachRecipeIndex === this.id;
                                      }
                                  );
                              }
                          )
                      )
                      // /.pipe() INNER AS 'TWERE  returns Observable<Recipe>  bueno.
                      .subscribe(
                          (recipeWeGot) => {
                              this.recipe = recipeWeGot;
                          }
                      );
              }
          );
*/

      /* 03 - Better Way To Do It - All under one .pipe() */
      this.route.params
          .pipe(
              map( // Route Params Observable...
                  (paramsWeGot): number => {
                      console.log('paramsWeGot ', paramsWeGot);
                      /*
                      {id: "1"}  << et voila!
                       */
                      return +paramsWeGot['id']; // << put a '+' on to number-ize... :o)
                  }
              ),
              switchMap(
                  // "switch from the Route Params Observable, to the Store Observable..." LECT. 379 ~05:06
                  (paramsIdWeGot): Observable<StateRecipePart> => {
                      this.id = paramsIdWeGot;
                      /* Lect. 382 ~13:41  (cf. RecipeEditComponent wrInitForm())
                      Angular does Subscription for us -
                      We do NOT need to do a rxjs Subscription ourselves here.
                      "[here we are in] part of our Route Params Subscription
                       (above), and there, Angular takes responsibility for
                       us and unsubscribes for us and hence we don't have
                       any ongoing old subscription here."
                       */
                      return this.myStore.select(fromRoot.getRecipeState);
                  }
              ),
              map(
                  (stateRecipePartWeGot: StateRecipePart) => {
                      return stateRecipePartWeGot.recipes.find(
                          (eachRecipe: Recipe, eachRecipeIndex) => {
                              console.log('eachRecipeIndex ', eachRecipeIndex);
                              console.log('eachRecipe ', eachRecipe);
                              return eachRecipeIndex === this.id;
                          }
                      );
                  }
              )
          ) // /.pipe() OUTER/ONLY  returns Observable<Recipe>  bueno.
          .subscribe(
              (recipeWeGot) => {
                  this.recipe = recipeWeGot;
              }
          );  // /03

  } // /ngOnInit()

  onAddToShoppingList() {
    this.myRecipeService.addIngredientsToShoppingList(this.recipe.ingredients);
    /*
    Even with NGRX - From here in the COMPONENT, we still do invoke the (Recipe)SERVICE. O.K.
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

/* No Longer Using (now NgRx)
    this.myRecipeService.deleteRecipe(this.id);
*/

      this.myStore.dispatch(new RecipeActions.DeleteRecipeActionClass(
          {idToDelete: this.id}));

      this.router.navigate(['/recipes']) // MAX has ['/recipes'] hmm
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
  } // /myOnDeleteRecipe()

}
