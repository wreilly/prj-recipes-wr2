import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RecipesComponent } from './recipes.component';
import { RecipeStartComponent } from './recipe-start/recipe-start.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';

import { RecipesResolverService } from './recipes-resolver.service';
/*
We "resolve" for 2 scenarios:
- RecipeDetail /:id
- RecipeEdit   /:id/edit
On both of these pages, if the user happens to hit Refresh,
we do NOT want to go get all Recipe[] data from Firebase,
IF we already do have "local" data Recipes.
The "local" would at this juncture be the canonical, latest,
greatest Recipes data. Don't overwrite it by going back to Firebase!
That's what the Resolver determines.

Note: I also do the "resolve" on the 3rd scenario of
- RecipeEdit /new
 */

import { AuthGuard } from '../auth/auth.guard';

const myRecipesRoutes: Routes = [
    {
        path: 'recipes',  // << YES 'recipes'!!! for now... (# 02)
/*
        path: '',  // << NOT 'recipes'!!! << when we get to loadChildren() in AppRouting, in later lectures... (# 06)
*/
        component: RecipesComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: RecipeStartComponent,
            },
            {
                path: 'new',
                component: RecipeEditComponent,
                resolve: [RecipesResolverService],
                /*
                Interesting finding:
                Here in TypeScript/WebStorm IDE I got no complaint when I put resolve: inside an array [] or NOT inside an array.
                Okay.
                But then in running code I did hit ERROR when I had left off the [].
                All righty then!
                We are *putting* those durned [] right back on we are.
                Cheers.
                 */
                // apparently with or without []
            },
            {
                path: ':id',
                component: RecipeDetailComponent,
 /* NO. Missing [], or {}

https://angular.io/api/router/Route#resolve
resolve? : ResolveData
"A map of DI tokens used to look up data resolvers. See Resolve."

ERROR THIS HITS:
==================
core.js:4002 ERROR Error: Uncaught (in promise): NullInjectorError: StaticInjectorError(AppModule)[function () { return []:
  StaticInjectorError(Platform: core)[function () { return []:
    NullInjectorError: No provider for function () { return [!
NullInjectorError: StaticInjectorError(AppModule)[function () { return []:
  StaticInjectorError(Platform: core)[function () { return []:
    NullInjectorError: No provider for function () { return [!
    at NullInjector.push../node_modules/@angular/core/fesm5/core.js.NullInjector.get (core.js:725)
    at resolveToken (core.js:11918)
    at tryResolveToken (core.js:11862)
    at StaticInjector.push../node_modules/@angular/core/fesm5/core.js.StaticInjector.get (core.js:11764)
    at resolveToken (core.js:11918)
    at tryResolveToken (core.js:11862)
    at StaticInjector.push../node_modules/@angular/core/fesm5/core.js.StaticInjector.get (core.js:11764)
    at resolveNgModuleDep (core.js:20234)
==================

NO:
               resolve: RecipesResolverService, // << Hits Error seen above.
*/
/* NO:
I tried Yet Another syntax, per
this web page:
https://github.com/angular/angular/issues/20339

                resolve: [
                    {
                        myNameWhatIsItObjectInsideArray: RecipesResolverService }
                ], // << Hits Error seen below:
ERROR SEEN for above:
--------------------
ERROR Error: Uncaught (in promise): NullInjectorError: StaticInjectorError(AppModule)[[object Object]]:
  StaticInjectorError(Platform: core)[[object Object]]:
    NullInjectorError: No provider for [object Object]! ...
--------------------
 */

/* YES
                resolve: [RecipesResolverService], // << YES. I WUZ WRONG! >> "apparently with or without []" << No, not "without"
*/
/* YES this worked too.
Q. I still don't know what that
property name on the left is/means/etc. ??
O well!

A. Debugging we see:
- As OBJECT (:id), 'myNameWhatIsItObject' is (of course) just a KEY, that corresponds to the DI token 'RecipesResolverService'. OK.
- As ARRAY (:id/edit), the DI token to 'RecipesResolverService' is just a string in an Array. OK.

Mystery solved & Etc. ;o)

path: ':id'
resolve:
  myNameWhatIsItObject: ƒ RecipesResolverService(myDataStorageService, myRecipeService)
     arguments: (...)

path: ':id/edit'
resolve: Array(1)
   0: ƒ RecipesResolverService(myDataStorageService, myRecipeService)
     arguments: (...)
*/
                resolve: {
                    myNameWhatIsItObject: RecipesResolverService
                },
            }, // /path:':id' route
            /*
            PLEASE NOTE:
            See BOTTOM of this file
            for more info on
            'myNameWhatIsItObject'
            above
             */
            {
                path: ':id/edit',
                component: RecipeEditComponent,
                resolve: [RecipesResolverService],
            },
        ]
    },
];


@NgModule({
    declarations: [
        // None
    ],
    imports: [
        RouterModule.forChild(myRecipesRoutes),
    ],
    exports: [RouterModule],
    providers: [
        // None
    ],
})
export class RecipesRoutingModule { }

/* ************************
DEBUGGING NOTE re: ABOVE

My: 'myNameWhatIsItObject' is (no surprise) a KEY

In this case I opted to use an OBJECT for my 'resolve'

resolve: {
       myNameWhatIsItObject: RecipesResolverService
         }

Alternatives (also seen above) include
an ARRAY:
resolve: [RecipesResolverService] // << yeah works too

But as for the OBJECT, here is the
ANGULAR CODE that handles it,
and we see where the KEY gets
processed etc.:
----------------------
router.js:3487
----------------------
function resolveNode(resolve, futureARS, futureRSS, moduleInjector) {
    var keys = Object.keys(resolve);
    // WR__ keys is ['myNameWhatIsItObject']
    if (keys.length === 0) {
        return of({});
    }
    if (keys.length === 1) {
        var key_1 = keys[0];
        // WR__ (above) key_1 of course is 'myNameWhatIsItObject'

        // WR__ (below) so resolve[key_1] of course is RecipesResolverService
        // WR__ And that RecipesResolverService is what you want - the DI token! :o)
        return getResolver(resolve[key_1], futureARS, futureRSS, moduleInjector)
            .pipe(map(function (value) {
            var _a;
            return _a = {}, _a[key_1] = value, _a;
        }));
    }
    var data = {};
    var runningResolvers$ = from(keys).pipe(mergeMap(function (key) {
        return getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
            .pipe(map(function (value) {
            data[key] = value;
            return value;
        }));
    }));
    return runningResolvers$.pipe(last$1(), map(function () { return data; }));
}
----------------------


   ************************
 */
