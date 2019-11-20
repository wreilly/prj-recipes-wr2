import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { RecipeService } from '../recipe.service';
import {Recipe} from '../recipe.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
//  providers: [RecipeService], // << No not here, in AppModule instead
    // https://itnext.io/understanding-provider-scope-in-angular-4c2589de5bc
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  myRecipeForm: FormGroup;
/* Moving to wrInitForm()
  myRecipeEditFormControlRecipeName: FormControl;
  myRecipeEditFormControlImageUrl: FormControl;
  myRecipeEditFormControlDescription: FormControl;
*/
  // myRecipeEditFormControlIngredientItem: FormControl; // << ??

  constructor(
      private route: ActivatedRoute,
      private myRecipeService: RecipeService,
      ) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          console.log('good heavens great scott. are we ever here? params ', params); // yeah. {}  or {id=1}
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          // ***** NEW IDEA 02 *********************
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


      this.myRecipeService.addRecipe(recipeToSendToService); // "is not a function" ( ? )
  } // /myOnSubmit()


  wrInitForm() {

/* Hmm. nope ?
    let myRecipeEditFormControlRecipeName: FormControl;
    let myRecipeEditFormControlImageUrl: FormControl;
    let myRecipeEditFormControlDescription: FormControl;
*/
// Instead (sigh)
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);
    /* Init recipeIngredients with, for first parameter to constructor, an array.
    From the API, that array is labelled 'controls' and is of type AbstractControl[].
    AbstractControl is more than just FormControl, but also
    FormGroup (which we'll use), and FormArray too.
    (You can nest this stuff like crazy.)
    >> E.G. We'll populate our FormArray with FormGroups (of FormControls) for our list of Ingredients (With name and amount)

- FormGroup
  - FormControl (name recipe)
  - FormControl (description)
  - FormControl (imagePath)
  - FormArray (ingredients)
    - FormGroup (ingredient)
      - FormControl (name ingredient)
      - FormControl (amount)
    - FormGroup ( " ) etc. ...
      - FormControl
      - FormControl
    - FormGroup
      - FormControl
      - FormControl

    Q. What about nothing as param? e.g. new FormArray();
    A.

    https://angular.io/api/forms/FormArray#constructor
    constructor(controls: AbstractControl[],...)

    https://angular.io/api/forms/AbstractControl
    "AbstractControl is base class for FormControl, FormGroup, and FormArray."
    */
      // NEW
      if (this.editMode) {
          // UPDATE EXISTING, so, get existing recipe data
          // We do so based upon the passed-in param ID

          /* NO. You had WRONG notion here.
          - 1. We are NOT immediately "setting the value" out in the form,
          of data we get back from the Service, for the current recipe.
          - 2. In fact, at this moment in the code, we do not yet even HAVE
          a form, with controls, to populate! That will come a few lines below where we "new FormGroup()".
          - 3. >> So the logic needed here is to PREPARE the "default value" to set into each FormControl: empty still if editMode false,
          and the data value from the Service, if editMode true
          - 4. This all happens upon initial rendering of the "Edit Recipe" page, dependent on the URL ID parameter (E.g. 0 or 1 etc)
          - 5. Cheers

          1. from above: NO:
                    const recipeToUpdate = this.myRecipeService.getRecipe(this.id);
                    this.myRecipeForm.controls['name'].setValue(recipeToUpdate.name);
                    this.myRecipeForm.get('imagePath').setValue(recipeToUpdate.imagePath);
                    this.myRecipeForm.controls['description'].setValue(recipeToUpdate.description);
          */

// 3. from above: YES:
          const theRecipeToUpdate = this.myRecipeService.getRecipe(this.id);
          recipeName = theRecipeToUpdate.name;
          recipeDescription = theRecipeToUpdate.description;
          recipeImagePath = theRecipeToUpdate.imagePath;
          if (theRecipeToUpdate.ingredients) { // Q. does this work too? A. YES
              // if (theRecipeToUpdate['ingredients']) { // Instructor Code

              /* Meh. This works okay. Old school. Clunky.
              for (let i = 0; i < theRecipeToUpdate.ingredients.length; i++) {
*/
// Instructor Code. Mo' better: ('const' here vs. 'let' fwiw)
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
              // If NO ingredients on the recipe, we just use our originally initialized empty array of Controls = OK
          }
      } // /if editMode


    this.myRecipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });

  } // /wrInitForm()

  get ingredientControls() { // GETTER
/* NO. Not simply return ...
      return this.myRecipeForm.get('ingredients');
*/
// Cast as FormArray, get out and return the controls:
      return (<FormArray>this.myRecipeForm.get('ingredients')).controls;
  }

/*
  wrInitFormNOPE() {

    let myRecipeEditFormControlRecipeName: FormControl;
    let myRecipeEditFormControlImageUrl: FormControl;
    let myRecipeEditFormControlDescription: FormControl;


    myRecipeEditFormControlRecipeName = new FormControl('default recipe name',
        { validators: [Validators.required, Validators.minLength(4)]}
    );
    myRecipeEditFormControlDescription = new FormControl('',
        [Validators.required]);
    myRecipeEditFormControlImageUrl = new FormControl('',
        {validators: [Validators.required]});

    this.myRecipeForm = new FormGroup({
      myRecipeEditFormControlRecipeNameName: myRecipeEditFormControlRecipeName,
      myRecipeEditFormControlDescriptionName: myRecipeEditFormControlDescription,
      myRecipeEditFormControlImageUrlName: myRecipeEditFormControlImageUrl,
    });
  }
*/

}
