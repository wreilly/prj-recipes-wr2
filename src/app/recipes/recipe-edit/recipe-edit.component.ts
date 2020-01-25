import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import {FormGroup, FormControl, Validators, FormArray, Form, AbstractControl} from '@angular/forms';
import { RecipeService } from '../recipe.service';
import {Recipe} from '../recipe.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  myRecipeForm: FormGroup;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private myRecipeService: RecipeService,
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

    const recipeToSendToService = new Recipe(
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
          this.myRecipeService.updateRecipe(this.id, recipeToSendToService);
          this.editMode = false;
          this.myOnCancel(); // we are done!
      } else {
          // ADD NEW
          this.myRecipeService.addRecipe(recipeToSendToService);
          this.myOnCancel(); // we are done!
      }

  } // /myOnSubmit()


  wrInitForm() {

    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';

    const recipeIngredients = new FormArray([]);

      if (this.editMode) {

          const theRecipeToUpdate = this.myRecipeService.getRecipe(this.id);
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
      } // /if (editMode)

    this.myRecipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });

  } // /wrInitForm()

    myOnCancel() {
        this.myRecipeForm.reset();
        this.router.navigate(['']).then(() => {}); // empty Promise .then()
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

}
