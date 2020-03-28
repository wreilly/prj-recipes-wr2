import {Recipe} from '../recipe.model';

import * as fromRecipeActions from './recipe.actions';
// No >> import {ADD_RECIPE_ACTION, SET_RECIPES_ACTION} from './recipe.actions'; // << Use "*" above instead

export interface StateRecipePart {
    recipes: Recipe[]; // << cf. in RecipeService, this is the only "state"
}

const initialStateRecipePart = {
    recipes: [
        /*
        Here is a BACK-UP of the basic 6 test recipes ... ! (whew!)
        If/when I lose/override/o-well my data on Firebase (hah! can happen!)
        then you can come in here, UNCOMMENT, restart app, and
        do "Send Data" to put this BACK to Firebase. cheers.
        (o la)
         */
/*
        {"description":"A 99 103 super-tasty Schnitzel - just awesome!","imagePath":"https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG","ingredients":[{"name":"Meat","amount":1},{"name":"French Fries","amount":20},{"name":"crackers","amount":665},{"name":"still works","amount":33},{"name":"ketchup","amount":2},{"name":"chops","amount":3}],"name":"Basic 99 103 22 choppa Class ngrx started up edit still works"},
        {"description":"W-a-a-a-l, 7777 it looks purty good. indeed","imagePath":"https://bakeorbreak.com/wp-content/uploads/2012/03/cccofcake1kR3.jpg","ingredients":[{"amount":2,"name":"coffee"},{"amount":2,"name":"cake"},{"amount":658,"name":"let us edit some22"},{"amount":4,"name":"ketchup"}],"name":"Let new 7777 navigate UsEdit23 Coffee FOR DUKE Cake EDITTIME Max08 Edit the 2nd 3rd"},
        {"description":"T'ain't none!","imagePath":"https://drdavinahseats.com/wp-content/uploads/2019/06/Keto-Surf-Turf-1800_2700-Pinterest-Image-November-scaled.png","ingredients":[{"amount":4,"name":"keto"}],"name":"Surf. 99 Make it CHANGE. Turf. No Ingredients You Say NO WAY!"},
        {"description":"No one is not even not here or anything unlike that whatsoever at all!","imagePath":"https://bmexdi064h-flywheel.netdna-ssl.com/wp-content/uploads/2019/05/Grilled-Asparagus-foodiecrush.com-008.jpg","name":"Asparagus Duke the CatDog was here. Bark! Nary a One EDITED","ingredients":[]},
        {"description":"test","imagePath":"https://image.shutterstock.com/z/stock-photo-pancakes-with-berries-and-maple-syrup-365501507.jpg","name":"Does new work?","ingredients":[]},
        {'description': 'Can\'t use this picture in public, kids!',
            'imagePath': 'https://image.shutterstock.com/z/stock-photo-pancakes-with-berries-and-maple-syrup-365501507.jpg',
            'ingredients': [{'amount': 4, 'name': 'Berry, Straw'},
                {'amount': 10, 'name': 'Berry, Blue'},
                {'amount': 1, 'name': 'Syrup'},
                {'amount': 19, 'name': 'Butter'}],
            'name': 'Puncakes that NECESSARY Likes'},
*/
    ]
};


export function recipeReducer (
    ngrxState: StateRecipePart = initialStateRecipePart,
    ngrxAction: fromRecipeActions.RecipesActionsUnionType,
): StateRecipePart {

    switch (ngrxAction.type) {
        /*
        N.B. No "Fetch" Recipes here in Reducer. See Effects.
        Likewise no "Store" Recipes here in Reducer - see Effects.
         */
        case fromRecipeActions.ADD_RECIPE_ACTION:
            console.log('ADD_RECIPE_ACTION woot ngrxAction.myPayload.recipeToAdd ', ngrxAction.myPayload.recipeToAdd);
/* WR__ Code: (nah) (though it works)
            ngrxState.recipes.push(ngrxAction.myPayload.recipeToAdd);
            return {
                ...ngrxState,
                recipes: [ ...ngrxState.recipes ]
            };
*/
// MAX Code: (yah) Concatenate array by just adding it in, after comma! easy-peasy
            return {
                ...ngrxState,
                recipes: [ ...ngrxState.recipes, ngrxAction.myPayload.recipeToAdd ]
            }; // /ADD_RECIPE_ACTION

        case fromRecipeActions.UPDATE_RECIPE_ACTION:
            /*
            myPayload: { idToUpdate: number, recipeToUpdate: Recipe }
             */
            // WR__ Code: (nah) this whamma-jamma stuff ain't right
/*
            ngrxState.recipes[ngrxAction.myPayload.idToUpdate] = ngrxAction.myPayload.recipeToUpdate; // whamma-jamma?
            return {
                ...ngrxState,
                recipes: [ ...ngrxState.recipes ]
            };
*/
            // MAX Code: He takes trouble to CREATE A COPY (hmm) of the passed-in payload. Hmm.
            /*
            Next line(s) are key: we declare/define/create a new object, 'maxUpdatedRecipePassedIn', that is a Recipe.
            To do so, the ...spread operator is used, twice in fact, to:
            (1) ...copy into this new object, the one to-be-updated Recipe, from out the pre-existing array of Recipes on the Store
            (2) ...apply to that Recipe, a ...copy of the passed-in Recipe (with the updated data)
            Line (2) is the key one - this is where the data overwriting/updating happens.
             */
            const maxUpdatedRecipePassedIn = {
                ...ngrxState.recipes[ngrxAction.myPayload.idToUpdate], // << (1) Copy in old/existing
                ...ngrxAction.myPayload.recipeToUpdate, // << (2) Overwrite/update w new
            };
            const maxUpdatedRecipesAllTold = [ ...ngrxState.recipes ]; // N.B. A *copy* of the array to update
            maxUpdatedRecipesAllTold[ngrxAction.myPayload.idToUpdate] = maxUpdatedRecipePassedIn; // update the one Recipe
            return {
                ...ngrxState,
                recipes: maxUpdatedRecipesAllTold, // << does not need (yet another) copy. No ...spread here
            }; // /UPDATE_RECIPE_ACTION

        case fromRecipeActions.DELETE_RECIPE_ACTION:
            // WR__ Code: (WUL) (Wish Us Luck) (I think mine does work, but, Max's is mo' better.)
            /*
            I think I need to get a COPY of the Array of all those Recipes in the Store, for starters. Bueno.
            N.B. .splice() does CHANGE the ORIGINAL array it works on.
            (Since (below) we do make a copy from out of the true "original" in the Store,
            the fact we now, using .splice() will change the array that is our copy,
            is okay and safe to do.
            In the end, we are NOT changing the *real* original (in the Store). Cheers.)

            Cf. Max's .filter() which does return a NEW Array (good, right?). Hence no need to "make copy" in advance. Okay.
             */
/*
            const wr__AllRecipes = [ ...ngrxState.recipes ];
            wr__AllRecipes.splice(ngrxAction.myPayload.idToDelete, 1);

            return {
                ...ngrxState,
                recipes: wr__AllRecipes,
            };
*/
            // MAX Code: Hmm. No copy. But (I guess?) .filter() returns a NEW Array, so there you go.
            return {
                ...ngrxState,
                recipes: ngrxState.recipes.filter(
                    (eachRecipe, eachRecipeIndex) => {
                        return eachRecipeIndex !== ngrxAction.myPayload.idToDelete;
                    }
                ),
            }; // /DELETE_RECIPE_ACTION

        case fromRecipeActions.SET_RECIPES_EFFECT_ACTION:
            console.log('??? REDUCER SET_RECIPES 22 - ngrxAction.myPayload ', ngrxAction.myPayload);  // << yes. array.
            // MAX Code - uses spread operator, inside literal [ array ] brackets
            return {
                ...ngrxState,
                recipes: [ ...ngrxAction.myPayload ],
            };
/* WR__ Code below - I *think* should work ( ? ) t.b.d.
No use of: [ ], no use of: '...', -- Just put the Recipe[] directly onto the recipes: property. I think works.
btw, SEE ALSO lengthy discussion/comment in ShoppingListReducer.START_EDIT_ACTION
            return {
                ...ngrxState,
                recipes: ngrxAction.myPayload, // << I think works
            };
*/

        default:
            return ngrxState; // as-is

    }

}
