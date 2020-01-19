import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';

// import { ShoppingListComponent } from './shopping-list/shopping-list.component';

/* RECIPES-ROUTING MODULE
import { RecipesComponent } from './recipes/recipes.component';
import { RecipeStartComponent } from './recipes/recipe-start/recipe-start.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
*/

/* RECIPES-ROUTING MODULE
import { RecipesResolverService } from './recipes/recipes-resolver.service';
*/
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
 */

// import {AuthComponent} from './auth/auth.component';

// Interesting. AuthGuard not needed here in root App Routing. Just Recipe-Routing.
// import {AuthGuard} from './auth/auth.guard';

const appRoutes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },

  /* OK! We've arrived at loadChildren - Lect. 330 lazy loading */
  {
    path: 'recipes',

    /* OLDER WAY. THIS WORKS: */
        loadChildren: './recipes/recipes.module#RecipesModule'
  },
/*
    Okay - in WebStorm IDE we did *not* get the nice IDE help that is seen
    in VisualStudio Code, for the file system path to 'loadChildren:'.
    BUT!
    With this nifty Angular 8(+) alternative syntax for Lazy Loading, we'll get better IDE support,
    as it will no longer be "string only" for indicating
    what is your Module, its path.
    Cheers.
    https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14851314#content

    ERROR:
    "ERROR in src/app/app-routing.module.ts(56,25): error TS1323: Dynamic import is only supported
    when '--module' flag is 'commonjs' or 'esNext'.

    src/app/app-routing.module.ts(56,72): error TS2339: Property 'ModuleName' does not exist on
    type 'typeof import("/Users/william.reilly/dev/Angular/Udemy-Angular5-MaxS/2019/WR__/prj-recipes-wr2/src/app/recipes/recipes.module")'."


    FIX:
    Don't Forget!  "Dynamic Import" needs:
    "tsconfig.json file, you use
    "module": "esnext",
instead of
    "module": "es2015","

    ALSO (apparently??)
    https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/14851314#questions/8850802

src/tsconfig.app.json:5
ORIG:
    "module": "es2015",

MY EDIT:
    "module": "esNext", // << actually, just omit/remove this line

    UPDATE: Actually, in tsconfig.app.json, just REMOVE the "module" line
     */
    /*
Error: Runtime compiler is not loaded with production configuration
https://github.com/angular/angular-cli/issues/10582
https://github.com/angular/angular-cli/issues/10582#issuecomment-523763194
"...the transpiler is not handling a multiline format of the arrow function."
 */
    // HOPEFULLY YEP: one-liner << DANG did Not work 'for me' :o(
/*
    loadChildren: () => import('./recipes/recipes.module').then(m => m.RecipesModule)
*/
      // '.RecipesModule' is my name, name I gave it (albeit per naming conventions). Cheers.

/* NOPE: Multi-line

    loadChildren: () => {
      return import('./recipes/recipes.module').then(m => m.RecipesModule);
      // '.RecipesModule' is my name, name I gave it (albeit per naming conventions). Cheers.
    }
*/
//  },
/* btw No ".ts" file extension! (oi!)
  loadChildren: './recipes/recipes.module.ts#RecipesModule' },
*/

  /* RECIPES-ROUTING MODULE
    {
      path: 'recipes', // << N.B. When refactored to RecipesRouting, the 'recipes' becomes just ''
      component: RecipesComponent,
      canActivate: [ AuthGuard ],
      children: [
      { path: '', component: RecipeStartComponent },
      { path: 'new', component: RecipeEditComponent, resolve: [RecipesResolverService] },
          // MAX does not have Resolver on 'new' but I do. Cheers.
      { path: ':id', component: RecipeDetailComponent, resolve: [RecipesResolverService] },
      { path: ':id/edit', component: RecipeEditComponent, resolve: [RecipesResolverService] },
    ] }, // << NOPE. Max code does NOT have "resolver" on the RecipesComponent per se. NO >> , resolve: [RecipesResolverService] },
  */

/* ShoppingListModule now
  { path: 'shopping-list', component: ShoppingListComponent },
*/
// RE-INTRODUCE path, for LAZY LOADING
  {
    path: 'shopping-list',
    loadChildren: './shopping-list/shopping-list.module#ShoppingListModule'
  },
    /*
    Error: Runtime compiler is not loaded with production configuration
    https://github.com/angular/angular-cli/issues/10582
    https://github.com/angular/angular-cli/issues/10582#issuecomment-523763194
    "...the transpiler is not handling a multiline format of the arrow function."
    https://github.com/angular/angular-cli/issues/10582#issuecomment-546241471 << "one-liner didn't work for me" << ME TOO (WR__)
     */
    // HOPEFULLY YEP: one-liner
/* DANG did NOT work 'for me' :o(
    loadChildren: () => import('./shopping-list/shopping-list.module').then(moduleWeGot => moduleWeGot.ShoppingListModule)
*/
/* NOPE
    loadChildren: () => {
      return import('./shopping-list/shopping-list.module')
          .then(
              moduleWeGot => moduleWeGot.ShoppingListModule
          );
    }
*/
 // },
/* AuthModule now
  { path: 'auth', component: AuthComponent },
*/
/*
Now with LAZY Loading we re-introduce here in APP-routing.module:
 */
  {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule'
    // Very nice. This one (auth) was already a one-liner :o)
/* DANG did NOT work 'for me' :o(
    loadChildren: () => import('./auth/auth.module').then(moduleWeGot => moduleWeGot.AuthModule)
*/
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
