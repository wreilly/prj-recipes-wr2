import { NgModule } from '@angular/core';

/*
These next 3 Module imports are needed here in the
RecipesModule.
Why?
Because the Components herein use these pieces (routing, *ngIf, forms etc).
Note that the Service (RecipeService) remains in the root AppModule.
 */
import { RouterModule } from '@angular/router'; // RecipesComponent has <router-outlet>
/*
import { CommonModule } from '@angular/common'; // Subset of BrowserModule; for *ngIf etc. // << Now from SharedModule
*/
import { ReactiveFormsModule } from '@angular/forms'; // RecipesEdit has Forms

import { SharedModule } from '../shared/shared.module';

import { RecipesComponent } from './recipes.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeItemComponent } from './recipe-list/recipe-item/recipe-item.component';
import { RecipeStartComponent } from './recipe-start/recipe-start.component';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';

import { RecipesRoutingModule } from './recipes-routing.module';
// N.B. Recipes Routing is imported HERE in RecipesModule.
// *NOT* imported by, say, "parent" AppRoutingModule. No.

/*
 import {RecipeService} from './recipe.service';
// I guess Services (usually?) left in APP Module (not down here in Recipes Module)
*/

/* ****************
OK am learning (hard way, kinda) that we
also need to explicitly import a Directive
here in our Recipes Feature Module:
   DropDownDirective
(At least, this is the story till we arrange
the whole "SharedModule")
 */
/* Nope. Time for SharedModule instead.
import { DropdownDirective } from '../shared/dropdown.directive';
*/
/*
Hah! We've seen THIS before:

"Uncaught Error: Type DropdownDirective is part of the declarations of 2 modules:
RecipesModule and AppModule!
Please consider moving DropdownDirective to a higher module
that imports RecipesModule and AppModule.
You can also create a new NgModule that exports and includes
DropdownDirective then import that NgModule in RecipesModule and AppModule."

TIME FOR THAT SHARED MODULE AFTER ALL,
LOOKS LIKE :o/
 */

@NgModule({
    providers: [
/*
        RecipeService,
// I guess Services (usually?) << YES  left in APP Module (not down in Recipes Module)
*/
    ],
    declarations: [
        // DECLARE COMPONENTS & Such
        // https://angular.io/api/core/NgModule#declarations
        RecipesComponent,
        RecipeListComponent,
        RecipeDetailComponent,
        RecipeItemComponent,
        RecipeStartComponent,
        RecipeEditComponent,
/* Nope, should come via SharedModule instead
        DropdownDirective,
*/
    ],
    imports: [
        // IMPORT MODULES // https://angular.io/api/core/NgModule#imports
        RouterModule, // << seems to have worked, too << YES this is what we want
        // RouterModule.forChild(),
        // << you'd do this ".forChild()" here only if you did NOT create a RecipesRoutingModule separately. but we do, so, no line here
/*
        CommonModule, // << Now from SharedModule
*/
        ReactiveFormsModule,
        RecipesRoutingModule, // << yep, here is where RecipesModule imports that RecipesRoutingModule. Good.
        /*
        That is, no, the RecipesRoutingModule is *NOT* imported by the AppRoutingModule. Cheers.
         */
        SharedModule,
    ],
    exports: [
/* Nah
        DropdownDirective, // << WebStorm tried to help me and put this here
That was prior to my having the SharedModule etc. Cheers.
*/

        // EXPORT MODULES & COMPONENTS // https://angular.io/api/core/NgModule#exports
        /*
        Odd. So far (end of 02 .zip) I am (still) not exporting anything, yet seems
        most everything works in the app.
        I must be missing something ...
         */

        // Huh, here in the RecipesModule, not even RecipesRoutingModule needs to be exported.
        // Do note that in the RecipesRoutingModule, YES, that needs to export the RouterModule

        /* I guess the Router .forChild() stuff takes care of
        exporting/importing/connecting/supplying/merging the routing info,
        from the "child" RecipesRouting up to the "parent" AppRouting,
        somehow? Guess so. All right then.
        */
    ],
})
export class RecipesModule {

}
