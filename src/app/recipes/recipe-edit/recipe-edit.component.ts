import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import {FormGroup, FormControl, Validators, FormArray, Form, AbstractControl} from '@angular/forms';
import { RecipeService } from '../recipe.service';
import {Recipe} from '../recipe.model';
import { Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/app.reducer';
import * as RecipeActions from '../store/recipe.actions';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode = false;
  myRecipeForm: FormGroup;
  private myRecipesSubscription: Subscription;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private myRecipeService: RecipeService,
      private myStore: Store<fromRoot.MyOverallRootState>,
      ) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          console.log('params ', params); // {}  or {id: "1"}
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.wrInitForm();

          // ***** NEW IDEA 01 *********************
          // DO ALL THIS INSIDE SUBSCRIPTION TO PARAM /:ID (like Instructor Code)
            // TODO Q. Refactor, if this works (hah!)  A.  No, it did not. sigh.
/*
            this.myRecipeEditFormControlRecipeName = new FormControl('default recipe name',
                { validators: [Validators.required, Validators.minLength(4)]}
            );
            this.myRecipeEditFormControlDescription = new FormControl('',
                [Validators.required]);
            this.myRecipeEditFormControlImageUrl = new FormControl('',
                {validators: [Validators.required]});

            this.myRecipeForm = new FormGroup({
                myRecipeEditFormControlRecipeNameName: this.myRecipeEditFormControlRecipeName,
                myRecipeEditFormControlDescriptionName: this.myRecipeEditFormControlDescription,
                myRecipeEditFormControlImageUrlName: this.myRecipeEditFormControlImageUrl,
            });
*/
          // ************************
        }
      );
  }

  myOnSubmit() {
      console.log('myOnSubmit! ', this.myRecipeForm.value);
      // this.myRecipeService.addRecipe(this.myRecipeForm.value); // "is not a function" ( ? )

      /* N.B.
      On our HTML Template Form, we have (crazy) names like so:
        myRecipeEditFormControlRecipeNameName
        myRecipeEditFormControlDescriptionName
        myRecipeEditFormControlImageUrlName

        Whereas on our TypeScript type model, we have (normal) names like so:
            name
            description
            imagePath
           // ingredients (ignoring for moment)

           Therefore, to truly "new up" a Recipe object, cannot directly
           use that whole mis-named object coming from the form.

           What We Got (from (crazy-named) form):
           {myRecipeEditFormControlRecipeNameName: "Texas Tea",
            myRecipeEditFormControlDescriptionName: "Gold",
            myRecipeEditFormControlImageUrlName: "https://unsplash.com/photos/rPOmLGwai2w"}

           No.
           Must "map" as 'twere its (crazy) property names
           onto the 3 or 4 parameters that Recipe() constructor expects

           And actually, we don't need to "map" anything, just put them in
           as parameters expected by the Recipe constructor: name, description, imagePath.
           Cheers

           What We Want (and will get, just by populating constructor correctly):
           description: "Gold"
           imagePath: "https://unsplash.com/photos/rPOmLGwai2w"
           name: "Texas Tea"
       */

      // const recipeToSendToService = new Recipe(this.myRecipeForm);
/* We CHANGED IT UP. Now (temporarily?) an INTERFACE instead of a CLASS */
    // RecipeModel is now trying Class with no Ingredient[]

/*
      const recipeToSendToService = new Recipe( // For CLASS.  May *not* omit Ingredient[]
          this.myRecipeForm.value.myRecipeEditFormControlRecipeNameName,
          this.myRecipeForm.value.myRecipeEditFormControlDescriptionName,
          this.myRecipeForm.value.myRecipeEditFormControlImageUrlName,
          );
*/

    const recipeToSendToStore = new Recipe( // WAS: 'recipeToSendToService' Now NgRx. cheers.
        this.myRecipeForm.value['name'],
        this.myRecipeForm.value['description'],
        this.myRecipeForm.value['imagePath'],
        this.myRecipeForm.value['ingredients']
    );

/* No longer Interface, as seen here. Instead, back to Class ...
      const recipeToSendToService: Recipe = { // For INTERFACE. May omit Ingredient[]
          name: this.myRecipeForm.value.myRecipeEditFormControlRecipeNameName,
          description: this.myRecipeForm.value.myRecipeEditFormControlDescriptionName,
          imagePath: this.myRecipeForm.value.myRecipeEditFormControlImageUrlName,
      };
*/

      if (this.editMode) {
          // UPDATE EXISTING

/* No Longer Using (now NgRx)
          this.myRecipeService.updateRecipe(this.id, recipeToSendToService);
*/

          this.myStore.dispatch(new RecipeActions.UpdateRecipeActionClass({
              idToUpdate: this.id,
              recipeToUpdate: recipeToSendToStore
              })
          );

          this.editMode = false;
/* MAX does *NOT* run "cancel". After edit/submit, his Recipe-Being-Edited is still shown
          this.myOnCancel(); // we are done!
*/
      } else {
          // ADD NEW

/* No Longer Using (now NgRx)
          this.myRecipeService.addRecipe(recipeToSendToService);
*/

          this.myStore.dispatch(new RecipeActions.AddRecipeActionClass({ recipeToAdd: recipeToSendToStore }));

          // this.myOnCancel(); // we are done!
      }

      this.myOnCancel(); // we are done! (run for both UPDATE and ADD)

  } // /myOnSubmit()


  wrInitForm() {

    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';

    const recipeIngredients = new FormArray([]);

      if (this.editMode) {

/* No Longer Using (now NgRx)
          const theRecipeToUpdate = this.myRecipeService.getRecipe(this.id);
*/

/*
Lect. 382 ~12:29  Assign the observable obtained from the Store
                  to a Subscription. (and OnDestroy(unsubscribe()) too)
(cf. RecipeDetailComponent where the Subscription is automatic, by Angular. Cheers.
*/
          this.myRecipesSubscription = this.myStore.select(fromRoot.getRecipeState)
          // this.myStore.select(fromRoot.getRecipeState)
              .pipe(
                  map(
                      (stateRecipePartWeGot) => {
                          // const theRecipeToUpdate = [];
                          // With NgRx we now do ".getRecipe(id)" right here, as 'twere:
                          return stateRecipePartWeGot.recipes.find(
                              ( eachRecipe: Recipe, eachRecipeIndex: number ) => {
                                  return eachRecipeIndex === this.id;
                                  /*
                                  Q. Why does above work, that the route param/:id can be
                                  used to find the desired Recipe in the array of them?
                                  A. Because our array of Recipes really has no "unique,
                                  unchanging ID" on each Recipe.
                                  Instead, we rely simply on the array index, for both
                                  routing e.g. /recipes/1 or /recipes/1/edit
                                  and for then retrieving that Recipe from the array:
                                  arrayOfRecipes[1]
                                  Q.2. As opposed to what.
                                  A.2. As compared to: a Recipe model that actually had
                                  an id: number property on it. That situation would be
                                  different, and would not use the .find(item, index)
                                  parameter of index, to locate which recipe in our array
                                  of them.
                                  Cheers.
                                   */
                              }
                          ); // /.find()
                      }
                  ) // /map()
              ) // /.pipe()
              .subscribe(
                  (theRecipeToUpdate: Recipe) => {
                      recipeName = theRecipeToUpdate.name;
                      recipeDescription = theRecipeToUpdate.description;
                      recipeImagePath = theRecipeToUpdate.imagePath;
                      if (theRecipeToUpdate.ingredients) { // Yes
                          // if (theRecipeToUpdate['ingredients']) { // Yes. Instructor Code.

                          /* Old school.
                          for (let i = 0; i < theRecipeToUpdate.ingredients.length; i++) {
                          */
                          // Instructor Code. ('const' here vs. 'let' fwiw)
                          for (const thisIngredient of theRecipeToUpdate.ingredients) {
                              recipeIngredients.push(
                                  new FormGroup({
                                      name: new FormControl(
                                          thisIngredient.name,
                                          [Validators.required],
                                      ),
                                      amount: new FormControl(
                                          thisIngredient.amount,
                                          [Validators.required],
                                      )
                                  })
                              );
                          }
                      } else {
                          // If NO ingredients on the recipe
                          // we just use our originally initialized empty array of Controls = OK
                      }
                  }
              ); // /.subscribe()
      } // /if (editMode)

    this.myRecipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });

  } // /wrInitForm()

    myOnCancel() {
/* MAX Code does NOT do this:
        this.myRecipeForm.reset(); // << nope
*/
/* WR__ This navigate() seems not right
Yeah, this wasn't right.
Better below MAX code

WRONG:
http://0.0.0.0:4200/recipes/1/edit << FROM
http://0.0.0.0:4200/recipes        << TO << NOPE
*/
/* No
        this.router.navigate(['']).then(() => {}); // empty Promise .then()

        I first (sorta) thought this line was equivalent to Max's below. Nope!
*/

        /* MAX Code has: */
        this.router.navigate(['../'], { relativeTo: this.route }).then(() => {});
        // empty Promise .then()
        // fwiw: this.route: ActivatedRoute
/*
RIGHT:
http://0.0.0.0:4200/recipes/1/edit << FROM
http://0.0.0.0:4200/recipes/1      << TO << YEP
*/

    }

    myOnAddIngredient() {
        /* "Give Me a single-field Form, With Which I Will Add an Ingredient" */
        // Dynamically (at user button request) add a FormControl (for an Ingredient) to the FormArray.
        (this.myRecipeForm.get('ingredients') as FormArray).push(
            new FormGroup({
                name: new FormControl('', [Validators.required]),
                amount: new FormControl('', [Validators.required])
            })
        );
    }

    myOnDeleteIngredient(whichOne: number) {
     // (<FormArray>this.myRecipeForm.controls['ingredients']).removeAt(whichOne); // Yes
        (this.myRecipeForm.controls['ingredients'] as FormArray).removeAt(whichOne); // Yes
    }

  get ingredientControls(): AbstractControl[] { // GETTER
      // return (<FormArray>this.myRecipeForm.get('ingredients')).controls; // Yes
      return (this.myRecipeForm.controls['ingredients'] as FormArray).controls; // Yes
  }

    myClearAllRecipeIngredients(): void {
      // NEW Way:
      // (<FormArray>this.myRecipeForm.controls['ingredients']).clear(); // New with Angular 8.
      // (this.myRecipeForm.controls['ingredients'] as FormArray).clear();

      // OLD SCHOOL WAY: WHILE () {}
      // https://stackoverflow.com/questions/41852183/angular-2-remove-all-items-from-a-formarray
        while ((<FormArray>this.myRecipeForm.get('ingredients')).length !== 0) {
            (<FormArray>this.myRecipeForm.get('ingredients')).removeAt(0); // << The secret: Continually remove POSITION ZERO
        }
    }

    ngOnDestroy(): void {
      /*
      Don't forget to test with if () for *existence* of Subscription!
      If I just do NEW RECIPE I never enter "editMode" and never create Subscription. Cheers.
       */
      if (this.myRecipesSubscription) {
          this.myRecipesSubscription.unsubscribe();
      }
    }
}
