import { Injectable } from '@angular/core';
import {map, switchMap, tap, take, withLatestFrom} from 'rxjs/operators';
// import {Observable, of} from 'rxjs'; // guess not..
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/app.reducer';
import { Effect, Actions, ofType } from '@ngrx/effects';
import * as RecipesActions from './recipe.actions';

import { Recipe } from '../recipe.model';
import {StateRecipePart} from './recipe.reducer';
import {getRecipeState} from '../../store/app.reducer';


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
       Cheers.

       1.
       @Effect()
       myFetchRecipesEffect

       2.
       @Effect()
       myStoreRecipesEffect

 */

@Injectable()
export class RecipeEffects {
    // Constructor on >> BOTTOM <<

    whatWeGotFromStore;
    whatWeGotFromStoreJustArray;
    whatWeGotFromStoreJustArrayNoWrapper;

    @Effect() // 1.
    myFetchRecipesEffect = this.myRecipesEffectsActions$ // << no particular need for "typing" on the left-hand-side there. MAX doesn't.
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
                console.log('Used to work! recipesFetched: ', recipesFetched);
                // YES. Works again now. :o) [{},{}] << What you want. Array of Objects. Good.
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
    ); // /.pipe() @Effect 1. Fetch

    // 2.
    @Effect({dispatch: false}) // << YES, needed
    // @Effect() // << ERROR:
    /* Looks like NgRx/Effects takes as the final "dispatched Action" whatever you finally 'return'.
        For me, below, it's the whole array of Stored Recipes. And that is *not* an "Action" fer sure.

    Error: Effect "RecipeEffects.myStoreRecipesEffect" dispatched an invalid action: [object Object]
    VM13346 vendor.js:42123 ERROR TypeError: Actions must have a type property
    */
    myStoreRecipesEffect = this.myRecipesEffectsActions$
        .pipe(
            ofType(RecipesActions.STORE_RECIPES_EFFECT_ACTON),
/* */
            withLatestFrom(
                this.myStore.select(getRecipeState)
                /* whoa, what IS this "withLatestFrom()" jamjazzz?
                https://scotch.io/tutorials/rxjs-operators-for-dummies-forkjoin-zip-combinelatest-withlatestfrom
                https://cdn.scotch.io/272/bx0M4hkSDO24coSDXa73_quiz-result.png << Good Quiz Answer marbles diagram picture. cool.
                */
            ),
            switchMap( // 02 MAX-ish
                ([actionDataPassedIn, recipeStatePartPassedIn]) => { // destructuring
/* WEIRD PARAMETER NAMES used while figgering things out:
                ([whatDoWeGetFromWithLatestFrom, poppa]) => { // destructuring
*/
                    /* DESTRUCTURING FIGGERING OUT
                    https://wesbos.com/destructuring-objects/
                    "extract properties from an object or items from an array"
                    https://www.javascripttutorial.net/es6/destructuring/
                    "A function may return an array of values. The array destructuring..."

                    So, I "infer" (figger out) that what the above "withLatestFrom()" is "returning"/
                    passing-along to us down here in this switchMap(), is the equivalent
                    of "a function returning an array of values". Yep.  MBU.

                    https://rxjs-dev.firebaseapp.com/api/operators/switchMap#overloads
                    Above page shows that the 'resultSelector()' is OPTIONAL = OK, n/a for my stuff

    http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap
    Above page shows that the 2nd param "index" is INDEED OPTIONAL = BUENO
    ------
    public switchMap(
     project: function(value: T, ?index: number): ObservableInput,
     resultSelector: function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any
     ): Observable
    ------

                    So we get 'returned' to us is this-here array:
                    [ actionData, recipesState ]

                    I am pretty sure that the withLatestFrom() and its Store.select()
                    are NOT us that 2nd parameter, the "index".
                    I believe that 'index' is INDEED optional, on a switchMap (?).
                      (see API URLs above.  hmm)
                    The switchMap() 'project' method takes in as parameters:
                     (value, index: number)
                    Hmm, I do not know what the 'type' is on that 'value'
                    But (I learn from the IDE error msg) that the 'value' does
                    expect to get/be this: [never, StateRecipePart]
                    - I think that 'never' is:
                    "an Observable that emits no items to the Observer."
                    http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-never
                    https://rxjs-dev.firebaseapp.com/api/index/const/NEVER
                    "An Observable that emits no items to the Observer and never completes."
                    So - I guess our "actionData" is/could-be a NEVER ?
                    It is pretty benign/neutral/not-doing-anything - okay ?
                    - As for the StateRecipePart, I guess that is easy to understand:
                    We just did store.select() and that is what we got, so, it is passed-in. - okay
                    - Finally, fwiw, just to note it, that 'project' method apparently returns:
                    (value, index: number): ObservableInput<any> // << I think this is
                       normal/whatever for return type here in the mix of .pipe() etc.
                    That is, nothing I need to know/figure out. MBU. << AGREED. It is part of the API. cool.
                     */
                    // Above are "actionData" and "recipesState" << MAX names
                    // actionDataPassedIn and recipeStatePartPassedIn << WR__ names
                    // (whatDoWeGetFromWithLatestFrom, poppa) => { // << Errors. Must do '[]' destructuring. Hmm.
                    console.log('02 actionDataPassedIn ', actionDataPassedIn);
                    /*
                    StoreRecipesEffectActionClass {type: "[Recipes] Store Recipes"}
                     */
                    // console.log('02 poppa.recipes ', poppa.recipes);
                    // Yes. [] of 6 {} Recipes

                    // return; // poppa.recipes; // temporary fill-in
                    /*
                    ERROR TypeError: You provided 'undefined' where a stream was expected.
                    You can provide an Observable, Promise, Array, or Iterable.

                    re: ABOVE:
                    "...what happens if you don’t return an action from the effect.
                    You will see the following (ABOVE) error in the console:"
                    https://www.intertech.com/Blog/ngrx-effects-a-case-for-returning-a-no-op-action/
                    */
                    /* */
                    return this.myHttp.put(
                        'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
                        recipeStatePartPassedIn.recipes
                    );

                }
            ), // /switchMap()

        ); // /.pipe() OUTER  @Effect 2. Store


    constructor(
        private myRecipesEffectsActions$: Actions, // Actions Observable hence '$'
        private myHttp: HttpClient,
        private myStore: Store<fromRoot.MyOverallRootState>,
    ) { }

    /* BURIED (NOT (REALLY) WORKING - O WELL) CODE: MAX 01 */
    /* ****************************************** */
/*
    switchMap( // 01 MAX Code: LECT. 383 ~02:17...04:40
() => { // << Guess you can ignore the "whatWeGot" = {type: "[Recipes] Store Recipes"}
    // return; // 01 kill off here, in bud
    return this.myHttp.put(
    'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
    this.myStore.select(fromRoot.getRecipeState)
.pipe(
        take(1), // ? hmm
    map(
(recipeStateWeGot) => {
    console.log('MAX: 01A recipeStateWeGot ', recipeStateWeGot);
    console.log('MAX: 01B JSON.stringify(recipeStateWeGot) ', JSON.stringify(recipeStateWeGot));
    return recipeStateWeGot.recipes;
}
)
)
);
}
),
*/
    /* ****************************************** */


    /* BURIED (WORKING) CODE: WR__ */
    /* ****************************************** */
/*
                switchMap( // 02 WR__ Code: Hey !  it Did Work (so that's cool)
                // (whatWeGot) => {
                ([actionDataNever, whatWeGot]) => { // << Now using that destructuring - woot
                    // return; // kill it off here
                    console.log('whatWeGot if/anything Store Recipes effect action ', whatWeGot);
                    /!* OK:
                    {recipes: Array(6)}
                     *!/
    console.log('actionDataNever ', actionDataNever);
    /!* OK:
    StoreRecipesEffectActionClass {type: "[Recipes] Store Recipes"}
     *!/
    /!* Yep:

    StoreRecipesEffectActionClass {type: "[Recipes] Store Recipes"}

    * Okay, so fwiw, looks like all you "get" upon running Effect is the
    * Action Type (just above). All right. Kinda benign/neutral.
    * *!/
    // let recipesFromAppStoreToStoreToFirebase: Recipe[]; // t.b.d. if needed
    return this.myStore.select(fromRoot.getRecipeState)
.pipe(
        take(1),
    map(
(recipeStateWeGot: StateRecipePart) => {
    console.log('recipeStateWeGot ', recipeStateWeGot); // array of 6 = Ok
    // << YES. StateRecipePart (basically { recipes: Recipe[] } )

    // return recipesFromAppStoreToStoreToFirebase = recipeStateWeGot.recipes; // << Yes
    return recipeStateWeGot.recipes; // << Also Yes
}
),

); // /.pipe() INNER
}
),
map(
    (whatWeGotFromStore) => {
        // return; // gotta kill this off too
        console.log('whatWeGotFromStore ', whatWeGotFromStore); // << recipes
        /!*
        Yes, array of 6 ...

        WRONG-O.
        Hmm, the above yielded an object holding my array. Not good.
{
"-M3NlJR1JrPknVN9sfGm":  // << MY LITTLE OOPS !!! !!! !!! << Y? 'CUZ I DID *POST* NOT *PUT* OI.
[
{ "description":"A super-tasty Schnitzel - just awesome!", ... },
{ "description":"W-a-a-a-l, it looks purty good. indeed", ... }
]
}

HOPEFUL FIX: Use ...spread operator to (magically?) get the Array OUT of that ??? << NAH
REAL FIX: Change POST to PUT (here below in myStoreRecipesEffect http call). Oi!
YES: Now (with PUT on StoreRecipes) here in Fetch we (once again) correctly get:
 whatWeGotFromStore  [{…}, {…}, {…}, {…}, {…}, {…}]
         *!/

        /!* EXPERIMENT/EXPLORATION (FAILED/WRONG-HEADED O WELL)

        Q. Can I do this?
        Namely, use ...spread operator on an array,
        with NO "array literal" wrapping [ ]
        e.g,
          const whatWeGotFromStoreJustArrayNoWrapper = ...whatWeGotFromStore;
        A. No! (kinda dumb idea!) (but hey!)

        "Spread syntax allows an iterable such as an array expression...
        to be expanded in places where zero or more...elements (for array literals) are expected,"
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        "The spread operator unpacks the elements of an array."
        https://www.javascripttutorial.net/es6/javascript-spread/

[...["😋😛😜🤪😝"]] // Array [ "😋😛😜🤪😝" ]
[..."🙂🙃😉😊😇🥰😍🤩!"] // Array(9) [ "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "!" ]
https://medium.com/coding-at-dawn/how-to-use-the-spread-operator-in-javascript-b9e4a8b06fab
[...["my string in lieu of emojis"]] // Array [ "my string in lieu of emojis" ]
[..."my short string"] // Array [ "m", "y", "s", "h", "o", "r", "t", "s", "t", "r", "i", "n", "g" ]


         *!/
        /!* NOPE. FAILED/DUMB EXPERIMENT. Cheers.
                            const whatWeGotFromStoreJustArrayNoWrapper = ...whatWeGotFromStore;
                            console.log('whatWeGotFromStoreJustArrayNoWrapper ', whatWeGotFromStoreJustArrayNoWrapper);
        *!/

        const whatWeGotFromStoreJustArray = [...whatWeGotFromStore];
        console.log('whatWeGotFromStoreJustArray ', whatWeGotFromStoreJustArray);
        /!*
        Yeah. Not a lotta magic, as we get same array we sent in o well no biggie.
         whatWeGotFromStoreJustArray [{…}, {…}, {…}, {…}, {…}, {…}]
         *!/



        return this.myHttp.put('https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json', whatWeGotFromStoreJustArray)
            /!* DUMMKOPFF !! oi. Not "POST" but "PUT" ! (Yeesh!)
        return this.myHttp.post('https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json', whatWeGotFromStoreJustArray)

        O la: ("stuff you shoulda known/remembered" category)
        "The POST method is used to request that the origin server accept
        the entity enclosed in the request as a new subordinate of the resource
        identified by the Request-URI in the Request-Line. ...
        PUT replaces the resource in its entirety."
        https://restfulapi.net/rest-put-vs-post/
*!/
            /!* NOTE from "Fetch" http line above.
            Q. Do we .pipe() or .subscribe() immediately here, off the http line?
            Or do we return to go to next map() or whatever, in the pipe? Hmm.

NOTE: N.B. I (mistakenly) thought you'd use .pipe() off of the above line
(as seen in DataStorageService). Sigh. No. No, you don't.
You instead proceed to next map() just below.
Q. Y, exactly?
A. Don't know, exactly.
A.2. I guess because we're already in a .pipe() ? hmm.
*!/
            .subscribe( // << Q. Is this correct? or problematic. Hmm, well, it did work! did write data to Firebase, but ...
                // Note that MAX Code does NOT do any .subscribe() after http
                (yesOk) => {
                    console.log('yesOk ', yesOk);
                    /!* 01 OLDER This was when I sent a POST and ADDED a whole array = WRONG
                    Hmm. unsure if so "yesOk" but here's what we got:
                     {name: "-M3NlJR1JrPknVN9sfGm"} << this was KEY to that added array
                     *!/
                    /!* 02 NEWER Now doing PUT. I guess I 'return' the whole array I sent. hmm.
                    [{…}, {…}, {…}, {…}, {…}, {…}]
                     *!/
                }
            );
    }
)
*/

/* ******************************************* */

} // /class RecipeEffects { }
