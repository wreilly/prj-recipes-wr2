import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
// import {Subject, throwError} from 'rxjs'; // << NO not here in Service
import {Observable, ObservableInput, throwError, Subscription, of} from 'rxjs';
import {tap, map, take, exhaustMap, catchError} from 'rxjs/operators';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';
import { User } from '../auth/user.model'; // << Yah. Just to Type a parameter; see below. << Nah.
import { AuthService } from '../auth/auth.service';

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
        private myAuthService: AuthService,
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


    // fetchRecipes(): void {
    fetchRecipes(): Observable<Recipe[]> {
        // >> NOPE. Tried it. Nope. >> N.B. Now returns just void,
        // because We also now do .subscribe() here no longer off HeaderComponent y not

        /*
       Note re: .subscribe()
       - Over on storeRecipes(), we do the .subscribe() right here in the Service.
       What comes back is kinda benign, etc., on "storing"
       - Whereas HERE, on fetchRecipes(), we do NOT do the .subscribe() here.
       Instead, for "fetching," let the calling Component/Etc. do the .subscribe()
       Let the caller get back an Observable<Recipe[]>
       This is needed by the RecipesResolverService for example.

       Hmm, what about HeaderComponent? MAX code has it do its own .subscribe(). Okay
       Whereas the MAX RecipesResolverService does NOT do its own .subscribe(). Hmm.

        */


        // << A la MAX Code.
        // We now use HTTPInterceptor for AUTH/TOKEN logic etc.
        // Let DataStorageService just fetch/store.


        return this.myHttp.get<Recipe[]>( // << ??
            /* Q. Hmm, does above return an Array of Recipes simply, or
            actually (somehow?) an OBSERVABLE of <Recipe[]> ?
             */
            /* A. Well, interestingly, both are sort of happening here.
            1) the http.get line does return JUST a plain array of Recipe[]
            2) but the higher-up fetchRecipes() method ultimately returns an OBSERVABLE<Recipe[]>

            How/why is that?
            MBU: The plain array of Recipe[] off the http.get
            is "returned", in first sense, in sense of passing it DOWN/BELOW/ON to the
            .pipe() and its operators within (map(), tap()).

            Pipe and map and tap all do 'RXJS' stuff, and they all
            take in an OBSERVABLE and return an OBSERVABLE.

            So, the plain Recipe[] magically/rxjs-ically goes in as an
            Observable<Recipe[]> to .pipe, on to map(), on to tap(),
            and what finally comes out of all that is yes an Observable<Recipe[]>.

            That final Observable<Recipe[]> is what the http.get line then
            'returns', in second/final sense, UP/BACK/TO the
            highest-level method fetchRecipes(),
            which in turn returns this Observable<Recipe[]> back to the
            calling Component/Resolver whatever.

            Note:
            - HeaderComponent needed to call fetchRecipes().subscribe()
            - RecipesResolverService does not. just fetchRecipes() is enough.
              - Why? Because for Resolver, Angular does the .subscribe() for you. Cheers.

             */

            // << N.B. before .subscribe() here, this line had 'return'
            // No longer .subscribe() here, so the 'return is restored (above)
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json')
            .pipe(
                map(
                    (recipesFetched: Recipe[]) => {
                        return recipesFetched.map(
                            eachRecipe => {
                                return {
                                    ...eachRecipe,
                                    ingredients: eachRecipe.ingredients ? eachRecipe.ingredients : []
                                };
                            }); // /.map() (Array map)
                    }), // /map() (RXJS map)
                tap(
                    (newArrayRecipesWithAtLeastEmptyIngredientsWeGot: Recipe[]) => {

                        this.myRecipeService.setRecipes(newArrayRecipesWithAtLeastEmptyIngredientsWeGot);

                        // MBU: Use of tap() has implicit 'return'
                    }
                ) // /tap()
            ); // /.pipe()
/* I tried the .subscribe() here but bumped into problem with RecipesResolverService.

            .subscribe(
                (whatWeGotBackFetching) => { console.log('whatWeGotBackFetching ', whatWeGotBackFetching); } // yep. Recipe[]
                /!*
                [{…}, {…}, {…}, {…}, {…}, {…}]
                 *!/
            );
*/

        /* OLDER NOTE: (now we do .subscribe() here y not)
        Do Note:
        The calling HeaderComponent invokes the (necessary) '.subscribe()' to kick this off.
         */
    } // /fetchRecipes()


    // fetchRecipesWORKED(): Observable<Recipe[]> {
    fetchRecipesWORKED() { // seems to not have needed the type return (line above) Okay.

        /*
        UPDATE Need to kill off this ancient unused code!
        It is calling the now-removed userSubject$ from AuthService.
        Going to substitute some stupid nothing Subject here instead.
        Good luck.
        https://angular.io/guide/observables#subscribing

        https://stackoverflow.com/questions/36986548/when-to-use-asobservable-in-rxjs
        const myAPI = {
  getData: () => return new Observable(subscriber => {
    const source = new SomeWeirdDataSource();
    source.onMessage = (data) => subject.next({ type: 'message', data });
    source.onOtherMessage = (data) => subject.next({ type: 'othermessage', data });
    return () => {
      // Even better, now we can tear down the data source for cancellation!
      source.destroy();
    };
  });
}
         */
        const myAPI = {
            getData: () => {
                return new Observable(
                    (subscriber) => {
/* Okay, so I have completely neutered this bit of code.
But, I guess I have done what I sought to do: swapped in a benign useless Observable
that my former code below can ".pipe()" etc. in lieu of the former AuthService.userSubject$.
Woot. iguess

                        const source = new SomeWeirdDataSource();
                        source.onMessage = (data) => subject.next({ type: 'message', data });
                        source.onOtherMessage = (data) => subject.next({ type: 'othermessage', data });
*/
                        return () => {
                            // Even better, now we can tear down the data source for cancellation!
                            // source.destroy();
                        };
                    });
            }
        }
        // return this.myAuthService.userSubject$ // <<<<<<<<<<<<< KEY LINE COMMENTED OUT, EFFECTIVELY
        return myAPI.getData()  // <<<<<<<<<<< TOTAL DUMMY OBSERVABLE JUST SWAPPED IN SO IT'LL COMPILE FER CHRISSAKES
            .pipe(
                tap((userIGot: User) => {
                    console.log('WR__CODE fetchRecipes TAP() userIGot y not ', userIGot); //
                    }
                ),
                take(1), // gets the 1 item that Subject will yield up: our User

                /* https://blog.angular-university.io/rxjs-higher-order-mapping/
           ExhaustMap: "ignore new values in the source Observable
           until the previous value is completely processed"
                 */
                exhaustMap(
                    didWeGetAUser => {
                        console.log('WR__CODE fetchRecipes EXHAUSTMAP() didWeGetAUser y not ', didWeGetAUser); //
                        return this.myHttp.get<Recipe[]>(
                                'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
                            {
                                params: new HttpParams().set('auth', didWeGetAUser.token)
                            }
                        );
                    }),
/* Whoops. Don't do this nested .pipe() biz.
                            .pipe( // << NOPE. Not a "nested" .pipe() thank you very much.
*/
                map(
                    recipesFetched => {
                        return recipesFetched.map(
                            eachRecipe => {
                                return {
                                    ...eachRecipe,
                                    ingredients: eachRecipe.ingredients ? eachRecipe.ingredients : []
                                };
                            }); // /.map()
                    }), // map()
/* This map() not working. Cheers.
                map(
                    (recipesFetched: Recipe[]) => {
                        const newArrayRecipesWithAtLeastEmptyIngredients: Recipe[] = [];
                        recipesFetched.map(
                            eachRecipe => {
                                newArrayRecipesWithAtLeastEmptyIngredients.push(
                                    {
                                        ...eachRecipe,
                                        'ingredients': eachRecipe.ingredients ? eachRecipe.ingredients : []
                                    }
                                );
                            }
                        );
                        return newArrayRecipesWithAtLeastEmptyIngredients;
                    }
                ),
*/
                tap(
                    newArrayRecipesWithAtLeastEmptyIngredientsWeGot => {
                        this.myRecipeService.setRecipes(newArrayRecipesWithAtLeastEmptyIngredientsWeGot);
                    }
                ) // /tap()

/* As above, Don't Do this nested .pipe() biz
                            ); // /.pipe() inner
*/

            ); // /.pipe() << one-and-only   // >> nope: outer
    } // /fetchRecipesWORKED()



    fetchRecipesOLDER(): Observable<Recipe[]> {
        /* ************************************
        THIS DID NOT WORK (either)

        I below am trying to 1) go to Auth Service
        and get the User and get the G.D. TOKEN
        and put it in a variable.

        Because I then expect to 2) proceed to use that
        variable in the HTTP GET, in a subsequent, separate
        codeblock.

        WRONG.

        Instead you need to (see fetchRecipes() above)
        1) yeah get the Auth Service User and the token,
        but 2) you need to run the HTTP GET ***Right Within***
        the codeblock wherein you obtained the Auth Service
        User Token.

        ********* /DID NOT WORK  *************
         */
/* Nah!
        let bearerTokenToSend: string;
        let thisUserObservable: Observable<User>;
        /!* Hmm. line below:
        "error TS2322: Type 'Observable<User>' is not assignable to type 'string'."
         *!/
        thisUserObservable = this.myAuthService.userSubject$
            .pipe(
                tap(
                    (thatUser) => {
                        let tokenWeGot;
                        tokenWeGot = thatUser.token; // string, n'est-ce pas?
                        return tokenWeGot; // string, n'est-ce pas?
                    }
                ),
                map(
                    (godDamnedTokenWeGot) => {
                        return godDamnedTokenWeGot;
                    }
                )
            );
*/

/* Nah.
        thisUserObservable.subscribe(
            (sheeshUser) => {
                bearerTokenToSend = sheeshUser.token;
                return bearerTokenToSend;
            }
        )
*/

        return this.myHttp.get<Recipe[]>(
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
            {
                /* No. Firebase has different way (param). Header is for ROW (Rest Of World).
                                headers: {
                                    Authentication: 'Bearer' + bearerTokenToSend
                                }
                */
               // params: new HttpParams().set('auth', bearerTokenToSend)
                // warning from IDE: 'variable may not have been initialized' << oh yeah! right you are, re: my bearerTokenToSend. Sheesh.
            }
        )
            .pipe(
                /* this bit wasn't doing anything ... okay. */
                map(
                    (recipesFetched: Recipe[]) => {
                        console.log('recipesFetched ', JSON.stringify(recipesFetched));
                        /* Recipe with NO INGREDIENTS[]:
                        {"description":"T'ain't none!",
                        "imagePath":"https://drdavinahseats.com/uploa...aled.png",
                        "name":"Surf. Turf. No Ingredients You Say NO WAY!"},
                         */
                        const newArrayRecipesWithAtLeastEmptyIngredients: Recipe[] = [];
                        recipesFetched.map(
                            eachRecipe => {
                                newArrayRecipesWithAtLeastEmptyIngredients.push(
                                    {
                                        ...eachRecipe,
                                        'ingredients': eachRecipe.ingredients ? eachRecipe.ingredients : []
                                    }
                                );
                            }
                        );
                        console.log('newArrayRecipesWithAtLeastEmptyIngredients ', JSON.stringify(
                            newArrayRecipesWithAtLeastEmptyIngredients
                        ));
                        /*Recipe with AT LEAST EMPTY INGREDIENTS[]:
                        {"description":"T'ain't none!",
                        "imagePath":"https://drdavinahseats.com/uploa...aled.png",
                        "name":"Surf. Turf. No Ingredients You Say NO WAY!",
                        "ingredients":[]}
                         */
                        return newArrayRecipesWithAtLeastEmptyIngredients;
                    }
                ),
                tap(
                    recipesFetched => {
                        this.myRecipeService.setRecipes(recipesFetched);
                    }
                )
            ); // /.pipe()
    } // /fetchRecipesOLDER() // << NOT CALLING



    fetchRecipesOLDEST() { // void {
    // fetchRecipes(): Observable<Recipe[]> { // void {

/*  ****************************
THIS DID NOT WORK
Trying "my way" to add Token to the Request.

        const thisUserTokenNow = this.myAuthService.userSubject$.pipe(
            tap(whatWeGot => console.log('TAP? ', whatWeGot)), // hmm, NOT SEEN.
            take(1),
            exhaustMap(userIGot => {
                console.log('exhaustMap? ', userIGot); // hmm, NOT SEEN, EITHER.
                return userIGot.token;
            }) // implicit (shorthand) 'return'. Who knew.
        );

        console.log('thisUserTokenNow ', thisUserTokenNow);
        /!* Hmm. as in, wtf. Etc.
        thisUserTokenNow  AnonymousSubject {_isScalar: false, observers: Array(0), ...
         *!/

        // console.log('JSON etc. thisUserTokenNow ', JSON.stringify(thisUserTokenNow));
        // No. Circular berkular.

        / ***** /(above) DID NOT WORK  ****************
*/

        return this.myHttp.get<Recipe[]>( // << 03 'return' is back. Oi!<< 02 removed the 'return' after all
            // Also: Best to put the Type there on the .get()
            // 'https://wr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json',
            /* https://firebase.google.com/docs/database/rest/auth#authenticate_with_an_id_token
            curl "https://<DATABASE_NAME>.firebaseio.com/users/ada/name.json?auth=<ID_TOKEN>"
             */
/* Yeah worked. Pre-token.
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
*/
/* Nope.
            `https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json?auth=${thisUserTokenNow}`,
*/
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
                        const recipesWithAtLeastEmptyArrayIngredients: Recipe[] = recipesWeFetched.map(
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
    } // /fetchRecipesOLDEST() // << NOT CALLING

    storeRecipe() {
        // TODONOPE (Q. Store 1 Recipe ?  A. Guess not.)
    }


    storeRecipes(): Subscription {
        // << A la MAX Code.
        // We now rely on HTTPInterceptors re: AUTH/TOKEN etc.

        /*
        Note re: .subscribe()
        - Here on storeRecipes(), we do the .subscribe().
        What comes back (simple "ACK") is kinda benign, etc., upon "storing"
        e.g. {name: "-LwhEb8qPJct0j7yBgWl"}
        - Whereas on fetchRecipes(), we do NOT do the .subscribe() here.
        Instead, for "fetching," let the calling Component/Etc. do the .subscribe()
        Let the caller get back an Observable<Recipe[]>
        That is what is needed by the RecipesResolverService for example.
         */

        const recipesToStore: Recipe[] = this.myRecipeService.getRecipes();

        if (recipesToStore.length === 0) {
            // Oops we prob don't want to send 0 Recipes back to Firebase. No.
            // Q. Why (not)? A. Because that would OVERWRITE all Recipes on Firebase. (boo-hoo)
            // Prolly not what you want.
            /*
            One further comment re: this if() test:
            Scenario:
            - User upon login has 0 Recipes, in the app. (There are of course Recipes over on Firebase)
            - User needs to "Fetch Data" to get Recipes into the app (from Firebase)
            - If instead user ran our "Send Data" first, with 0 Recipes in the app,
               before fetching, THAT is scenario we are guarding against, here:
            AVOID: Overwriting all Recipes on Firebase by sending 0 Recipes. Cheers.

            In other words, Firebase is Too Stupid, a.k.a.
            you can Shoot Yourself in the Foot if not careful.
            Cheers.
             */
            alert('We are not going to let you ZERO OUT your Firebase Database. Solly!');
            return;
        }

        this.myHttp.put( // << MAX Code, no 'return'. Hmm.
        // return this.myHttp.put( // WR__. worked. hmm.
                        'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
                        recipesToStore,
                    ) // /.put()
                        .pipe(
                            tap(
                                (whatWeGotSending) => {
                                    console.log('whatWeGotSending ', whatWeGotSending);
                                } // yep: {name: "-LwhEb8qPJct0j7yBgWl"}
                            )
                            // N.B. I've removed the catchError() that I had, from here; now on the Interceptor.
                            /* << Update note: that catchError() is now "doing nothing"
                               just passes through the entire HttpErrorResponse it gets. Cheers.
                             Also note: MAX Code doesn't have any error handling here on DataStorageService.storeRecipes().
                            (Nor on fetchRecipes(), fwiw.)
                            MAX Code also does NOT have error handling on AuthInterceptorService, fwiw.
                            MAX Code DOES have error handling on AuthService.signUp and .logIn.
                             */
                        ) // /.pipe()
            .subscribe(
                (whatWeGotSending) => { console.log('whatWeGotSending ', whatWeGotSending); } // yep: {name: "-LwhEb8qPJct0j7yBgWl"}
            );

    } // /storeRecipes()



    storeRecipesWORKED() {
        const recipesToStore: Recipe[] = this.myRecipeService.getRecipes();


        /*
        UPDATE Need to kill off this ancient unused code!
        It is calling the now-removed userSubject$ from AuthService.
        Going to substitute some stupid nothing Subject here instead.
        Good luck.
        https://angular.io/guide/observables#subscribing

        https://stackoverflow.com/questions/36986548/when-to-use-asobservable-in-rxjs
        const myAPI = {
  getData: () => return new Observable(subscriber => {
    const source = new SomeWeirdDataSource();
    source.onMessage = (data) => subject.next({ type: 'message', data });
    source.onOtherMessage = (data) => subject.next({ type: 'othermessage', data });
    return () => {
      // Even better, now we can tear down the data source for cancellation!
      source.destroy();
    };
  });
}
         */
        let myObservableOfThing;
        const myAPITwo = { // No. OperatorFunction<string, any>  cannot work w ExhaustMap below's OperatorFunction<User, any>  Cheers.
            myObservableOfThing: myObservableOfThing = of('a', 'b', 'c'),
        };
        const myAPI = { // Yeah, once completely neutered, this at least can swap in, doing nothing. harrumph & Etc.
            getData: () => {
                return new Observable(
                    (subscriber) => {
                        /* Okay, so I have completely neutered this bit of code.
                        But, I guess I have done what I sought to do: swapped in a benign useless Observable
                        that my former code below can ".pipe()" etc. in lieu of the former AuthService.userSubject$.
                        Woot. iguess

                                                const source = new SomeWeirdDataSource();
                                                source.onMessage = (data) => subject.next({ type: 'message', data });
                                                source.onOtherMessage = (data) => subject.next({ type: 'othermessage', data });
                        */
                        return () => {
                            // Even better, now we can tear down the data source for cancellation!
                            // source.destroy();
                        };
                    });
            }
        }
        // return this.myAuthService.userSubject$ // <<<<<<<<<<<<< KEY LINE COMMENTED OUT, EFFECTIVELY
        return myAPI.getData() // YEAH <<<<<<<<<<< TOTAL DUMMY OBSERVABLE JUST SWAPPED IN SO IT'LL COMPILE FER CHRISSAKES
        // return myAPITwo.myObservableOfThing // NO <<<<<<<<<<< TOTAL DUMMY OBSERVABLE TRIED TO SWAP IN O WELL
            .pipe(
            take(1), // gets user data, once. unsubscribes.
            exhaustMap(
                (userWeGot: User): ObservableInput<any> => {
                    return this.myHttp.put(
                        'https://wr-ng8-prj-recipes-wr2.firebaseio.com/recipes.json',
                        recipesToStore,
                        {
                            params: new HttpParams().set('auth', userWeGot.token)
                        }
                    ); // /.put()
                }
            ), // /exhaustMap()
            catchError(
                (catchErrorWeGot: HttpErrorResponse) => {
                    console.log('catchErrorWeGot ', catchErrorWeGot);
                    if (catchErrorWeGot.error instanceof ErrorEvent) {
                        // A client-side or network error occurred. Handle it accordingly.
                        console.error('An error occurred:', catchErrorWeGot.error.message);
                    } else {
                        // The backend returned an unsuccessful response code.
                        // The response body may contain clues as to what went wrong,
                        console.error(
                            `Backend returned code ${catchErrorWeGot.status}, ` +
                            `body was: ${ JSON.stringify(catchErrorWeGot.error) }`);
                    }
                    // return an observable with a user-facing error message
                    return throwError('Oops Send Data');
                }
            ) // /catchError()
        ) // /.pipe()
            .subscribe(
                (whatWeGotSending) => { console.log('whatWeGotSending ', whatWeGotSending); } // yep: {name: "-LwhEb8qPJct0j7yBgWl"}
            );
    } // /storeRecipesWORKED()



    storeRecipesOLDER() {
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
    } // /storeRecipesOLDER()

}
