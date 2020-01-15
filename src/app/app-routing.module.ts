import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShoppingListComponent } from './shopping-list/shopping-list.component';

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

import {AuthComponent} from './auth/auth.component';

// Interesting. AuthGuard not needed here in root App Routing. Just Recipe-Routing.
// import {AuthGuard} from './auth/auth.guard';

const appRoutes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
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
  { path: 'auth', component: AuthComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
