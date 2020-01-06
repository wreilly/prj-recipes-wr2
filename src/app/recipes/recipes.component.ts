import { Component, OnInit } from '@angular/core';

// import { AuthService } from '../auth/auth.service'; // << Put to AppComponent instead

/* No Longer Used
import { Recipe } from './recipe.model';
*/
// import { RecipeService } from './recipe.service';


@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css'],
  // providers: [RecipeService] // No Longer Used ?? at least in THIS component.
    /*
    But, another (child ( ? )) Component, RecipeListComponent, DID need this here. Hmm.
    Interesting.
    -- OR --
    I went and put providers onto RecipeListComponent, and removed from here,
    and yeah that worked too. Okay.
     */
})
export class RecipesComponent implements OnInit {
/* No Longer Used
  selectedRecipe: Recipe;
*/

/* No Longer Used:
    constructor(private recipeService: RecipeService) { }
*/
    constructor(
        // private myAuthService: AuthService,  // << Put to AppComponent instead
    ) { }

  ngOnInit() {

      // this.myAuthService.autoLogIn();  // << Put to AppComponent instead // Worked! >> Give it a shot, here at the git-go

/* RXJS SUBJECT NOW
    this.recipeService.recipeSelected
*/

// And, actually, all this below was PRE-ROUTING, so, "bye-bye!"
/*
    this.recipeService.myRecipeSelectedSubject
      .subscribe(
        (recipe: Recipe) => {
          console.log('00 recipe whatWeGot ', recipe);
          /!*
          O.K. now ...
          00 recipe whatWeGot  Recipe {name: "Tasty Schnitzel",  ...
           *!/
          this.selectedRecipe = recipe;
        }
      );
*/
  }

}
