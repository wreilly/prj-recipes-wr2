import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {map, switchMap, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import * as RecipesActions from './recipe.actions';
// import {SetRecipesEffectActionClass} from './recipe.actions';


/*
       TABLE of CONTENTS

       Nota Bene!
       This EFFECTS file for Recipes ...
       ... is effectively (no pun intended or otherwise)
       becoming & holding all the LOGIC that WAS in
       the DataStorageService ( ! )

       That is, HTTP calls to Firebase, for:
       - fetchRecipes
       - storeRecipes
cheers.

       1.
       @Effect()
       myFetchRecipesEffect

 */

@Injectable()
export class RecipeEffects {
    // Constructor on >> BOTTOM <<


    @Effect() // 1.
    myFetchRecipesEffect = this.myRecipesEffectsActions$ // << no particular need for "typing" here. MAX doesn't.
    // myFetchRecipesEffect: Observable<any> = this.myRecipesEffectsActions$ // << didn't break stuff. but hey.
    // myFetchRecipesEffect: Observable<RecipesActions.SetRecipesEffectActionClass> = this.myRecipesEffectsActions$
        .pipe(
        /* This "type" is below: Observable<RecipesActions.SetRecipesEffectActionClass>

        That is, even though the "ofType()" here is for acting upon FETCH Recipes effect/actions,
        what is *returned* in the subsequent action "newed up()" below is
        the SET Recipes action type. So the "type" for the returned Observable is <SetRecipes>. Cheers.

        type = SET_RECIPES_EFFECT_ACTION;
        public myPayload: Recipe[]
         */
        ofType(RecipesActions.FETCH_RECIPES_EFFECT_ACTION),

        /* Yeah, you *can* do this (useless, log-only) "map()"
* before the switchMap() below.
* But I'll Comment it Out again ... cheers. */
/* Log-only:
        map(
            (whatWeGot) => {
                //
                console.log('??? 11 whatWeGot if/anything fetch recipes effect action ', whatWeGot);
                /!*  Yep:   {type: "[Recipes] Fetch Recipes"}   *!/
                return whatWeGot;
            }
        ),
*/

        switchMap(
            /*
            https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap
            "switchMap maintains only one inner subscription at a time"
            "avoid switchMap in scenarios where every request needs to complete; think writes to a database."
             */
            (whatWeGot) => {
                // MAX speaks of "fetchAction" data; but we are not getting any payload ... True, we just get the "type" info back. OK.
                console.log('??? 22 whatWeGot if/anything fetch recipes effect action ', whatWeGot);
                /* Yep:   {type: "[Recipes] Fetch Recipes"}   */

                return this.myHttp.get<Recipe[]>('https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json');
                /*
                N.B. I (mistakenly) thought you'd use .pipe() off of the above line
                (as seen in DataStorageService). Sigh. No. No, you don't.
                You instead proceed to next map() just below.
                Q. Y, exactly?
                A. Don't know, exactly.
                A.2. I guess because we're already in a .pipe() ? hmm.
                 */
            }),
        map(
            (recipesFetched: Recipe[]) => {
                return recipesFetched.map(
                    (eachRecipe: Recipe) => {
                        return {
                            ...eachRecipe,
                            ingredients: eachRecipe.ingredients ? eachRecipe.ingredients : []
                        };
                    }
                ); // /.map() array
            }
        ), // /map RxJs
// Surprise, surprise. Something I'd seen before (but not remembered. sigh.)
        // Below, we do NOT need "Store" and ".dispatch()". Nope.
/* Refactored here from DataStorageService, which DID use Store and .dispatch()
this.myStore.dispatch(new RecipesActions.SetRecipesEffectActionClass(newArrayRecipesWithAtLeastEmptyIngredientsWeGot));
*/
// But here in NGRX/Effects, we just want to return a newed up Action/Effect. NGRX does dispatch automatically.
        // MAX: "goal is to return a newed up action, which will be dispatched (by NgRx Effects) automatically:
        map( // Max has map() = OK.
            /* I tried  tap() = WRONG-O. Big Error:
            ==========
ERROR Error: Effect "RecipeEffects.myFetchRecipesEffect" dispatched an invalid action: [{"description":"A super-tasty Schnitzel
...
core.js:4002 ERROR TypeError: Actions must have a type property
==============
             */
            (recipesArrayWeGot: Recipe[]) => {
                return new RecipesActions.SetRecipesEffectActionClass(recipesArrayWeGot); // YES! WORKS! (w. *return*)
                // new RecipesActions.SetRecipesEffectActionClass(recipesArrayWeGot); // << No. Cannot omit that *return*. No way.
                /* Unused expression. Expected an assignment or function call...
                *
                * core.js:4002 ERROR TypeError: Actions must be objects
                * ERROR Error: Effect "RecipeEffects.myFetchRecipesEffect"
                * dispatched an invalid action: undefined
                * */
            }
        )
    ); // /.pipe()

    constructor(
        private myRecipesEffectsActions$: Actions, // Actions Observable hence '$'
        private myHttp: HttpClient,
    ) { }

}
