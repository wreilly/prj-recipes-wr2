import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { RecipeService } from '../recipes/recipe.service';

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
        private myHttp: HttpClient,
        private myRecipeService: RecipeService,
        ) { }

    fetchRecipes(): void {
        this.myHttp.get( // << removed the 'return' after all
            'https://wr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json',
            )
            .pipe(
                tap(
                    (recipesWeGot: any[]) => {
                        console.log('recipesWeGot ', recipesWeGot);
                        // NOPE >>  this.allThoseRecipesSubject$ = recipesWeGot;
                        // return recipesWeGot; // I think you MUST 'return' from here, kids.
                    }
                ),
                map(
                    (allThoseTossThingsOneBigObject) => {
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
                )
            )// /.pipe()
            .subscribe(
                (arrayOfStuffWeGot) => {
                    console.log('arrayOfStuffWeGot ', arrayOfStuffWeGot);

/*
                    NO. We don't store it here in the Service somehow.
                    See next line. We send it right over to the RecipeService, kids.
                    this.allThoseRecipesSubject$ = arrayOfStuffWeGot;
*/
                    this.myRecipeService.setRecipes(arrayOfStuffWeGot);
                }
            );
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
}
