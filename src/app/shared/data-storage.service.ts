import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
// import {Subject, throwError} from 'rxjs'; // << NO not here in Service
import {Observable, throwError} from 'rxjs';
import {tap, map, catchError} from 'rxjs/operators';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';

/* @Injectable() */
@Injectable({
    providedIn: 'root'
})
export class DataStorageService {
    /* OK
    Finally (mebbe) figgered it out. Yeesh.
No. We do NOT keep a variable/whatever here
in the Data Service for those Recipes.
No.
     */
/* NOPE:
    allThoseRecipes: Subject<any[]>; // will be <Recipe[]> n'est-ce pas?
    allThoseRecipesSubject$ = new Subject<any[]>(); // will be <Recipe[]> n'est-ce pas?
*/

    constructor(
        private myHttp: HttpClient, // << shortcut, default way we've been doing
        // myHttp: HttpClient, // << see note below NOT GETTING TO WORK any "long cut". Hmmph. o well.
        private myRecipeService: RecipeService,
        ) { }
        /*
        NOTE on 'private'
        I'd forgotten (Lecture 279 ~05:00) - this is a TypeScript
        shortcut.
        'private' is an "accessor" ( ? ) Hmm.
        private myHttp: HttpClient << TS will create a property on the class
        and assign to it whatever is passed in, via
        I guess the "magic" of Angular DI Dependency Injection.
        Very groovy.

        So as the alternative...
         01 I'll try:
          constructor( myHttp ) // Error (see below)
         02 I'll try again:
          constructor( myHttp: HttpClient ) // << Happier
        and then property declaration like so:
          myHttp: HttpClient;
         */
/* Boo-hoo not getting to work this "long cut" o well
    myHttp: HttpClient;
*/
    /*
    Hmm. Error?
    Error: Arguments array must have arguments.
    at injectArgs (core.js:685)
    at core.js:11183
    at _callFactory (core.js:20296)
    at _createProviderInstance ...
     */

    storeRecipe() {
        // TODO
    }

    // fetchRecipes(): Observable<Recipe[]> { // void {
    fetchRecipes() { // void {
        return this.myHttp.get<Recipe[]>( // << 03 'return' is back. Oi!<< 02 removed the 'return' after all
            // Also: Best to put the Type there on the .get()
            // 'https://wr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json',
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
            )
            .pipe(
                tap(
                    (recipesWeFetched) => {
                        // (recipesWeGot: any[]) => { // Now TS knows what type; don't have to resort to any[]. Better.
                        console.log('tap (for the h. of it) - recipesWeFetched ', recipesWeFetched);
                        // NOPE >>  this.allThoseRecipesSubject$ = recipesWeGot;
                        // return recipesWeGot; // I think you MUST 'return' from here, kids.
                    }
                ),
                map(
/* OLDER. TESTING "TOSSTHINGS"
                    (allThoseTossThingsOneBigObject) => { // WR__ code, temporary, re: "tossthings"
                        const tossThingsArray: [] = [];
                        for (const thisKey in allThoseTossThingsOneBigObject) {
                            if (allThoseTossThingsOneBigObject.hasOwnProperty(thisKey)) {
                                tossThingsArray.push({
                                    ...allThoseTossThingsOneBigObject[thisKey],
                                    // @ts-ignore
                                    'myId': thisKey,
                                });
                            }
                        }
                        console.log('tossThingsArray ', tossThingsArray);
                        return tossThingsArray;
                    }
*/
                    (recipesWeFetched: Recipe[]) => {
                        const recipesWithAtLeastEmptyArrayIngredients = recipesWeFetched.map(
                            eachRecipe => {
                                return {
                                    ...eachRecipe, // good old spread operator whatever would we do without it
                                    ingredients: eachRecipe.ingredients ? eachRecipe.ingredients : [],
                                };
                            }
                        );
                        return recipesWithAtLeastEmptyArrayIngredients;
                    }
                ),
                tap(
                    (recipesWithAtLeastEmptyArrayIngredients) => {
                        this.myRecipeService.setRecipes(recipesWithAtLeastEmptyArrayIngredients);
                    }
                )
            ); // /.pipe()
        // 03 Back to NOT .subscribe() here. Now on Resolver or some G.D. thing. oi.
        // Also (important!) - use tap() to do the "setRecipes" schtick.
/*
            .subscribe(
                (arrayOfStuffWeGot: Recipe[]) => {
                    console.log('arrayOfStuffWeGot ', arrayOfStuffWeGot);

/!*
                    NO. We don't store it here in the Service somehow.
                    See next line. We send it right over to the RecipeService, kids.
                    this.allThoseRecipesSubject$ = arrayOfStuffWeGot;
*!/
                    this.myRecipeService.setRecipes(arrayOfStuffWeGot);
                }
            );
*/
        /* 02 NOW INSTEAD WE REVERT
        We are back to .subscribe() here in Data Service.
        Q. Why?
        A. So that we can get the data right here. From here we send
        it over to RecipeService. It is not going back to a calling Component.
        The Calling Component (triggering more like it) is the Header.
        The Header does not need or want the data. Cheers.
         */
/* 01. WAS : Hmm, We'll leave the "subscribing" over on the Component ?
            .subscribe( // << ixnay, here on Service. Cheers.
                (whatWeGot) => {
                    return whatWeGot;
                }
            );
*/
    } // /fetchRecipes()

    storeRecipes() {
        const recipesToStore: Recipe[] = this.myRecipeService.getRecipes();
        this.myHttp.put( // << Whoops PUT not POST
            // 'https://wr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json',
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
            recipesToStore // << Hmm, as array, kid?
        )
            .pipe(
                catchError(
                    // https://angular.io/guide/http#getting-error-details
                    (catchErrorWeGot: HttpErrorResponse) => {
                        console.log('catchErrorWeGot ', catchErrorWeGot);
                        /*
                        HttpErrorResponse {headers: HttpHeaders, ...
                        status: 404
statusText: "Not Found"
url: "https://foobarwr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json"
ok: false
name: "HttpErrorResponse"
message: "Http failure response for https://foobarwr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json: 404 Not Found"
error:
error: "404 Not Found"
                         */

                        // tslint:disable-next-line:max-line-length
                        if (catchErrorWeGot.type === 4) { // <<  N/A! Nah. This is an HttpErrorResponse, not an HttpEventType. Does not have '.type' Does not have Enum for type e.g. 4 for 'Response'.
                            // tslint:disable-next-line:max-line-length
                            console.log('LOGGING 4 4 4 4 intercept | pipe | catchError | Response 4 ', catchErrorWeGot.type); // << Nah, not seen. N/A here. cheers.
                        }

                        if (catchErrorWeGot.error instanceof ErrorEvent) {
                            // A client-side or network error occurred. Handle it accordingly.
                            console.error('An error occurred:', catchErrorWeGot.error.message);
                        } else {
                            // The backend returned an unsuccessful response code.
                            // The response body may contain clues as to what went wrong,
                            console.error(
                                `Backend returned code ${catchErrorWeGot.status}, ` +
                                `body was: ${ JSON.stringify(catchErrorWeGot.error) }`);
                            /*
                            Backend returned code 404, body was: [object Object]
with JSON.stringify() ->     body was: {"error":"404 Not Found"}
                             */
                        }
                        // return an observable with a user-facing error message
                        return throwError('Oops Send Data');
                        /*
                        core.js:4002 ERROR Oops Send Data
defaultErrorLogger
                         */
                    }
                )
            ) // /.pipe()
            .subscribe(
                (whatWeGotSending) => { console.log('whatWeGotSending ', whatWeGotSending); } // yep: {name: "-LwhEb8qPJct0j7yBgWl"}
            ); // gotta trigger it to GO!
    } // /storeRecipes()

}
