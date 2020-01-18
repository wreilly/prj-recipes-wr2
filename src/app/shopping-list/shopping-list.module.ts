import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common'; // << Now comes from SharedModule
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
// I guess in ShoppingList I do use plain old Forms (not Reactive)
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { ShoppingListComponent } from './shopping-list.component';
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';

/* Extra Credit ;o)
*** ROUTING *** ( such as it is )

We'll put the (one-route) Shopping List routing
here in the ShoppingListModule.

Alternatives were:
1. Do nothing. Leave in the app-routing.module.ts (too little)
2. Create whole new shopping-list-routing.module.ts (too much)
3. Incorporate the ShoppingList routing here in ShoppingListModule (just right) :o)
 */

const myShoppingListRoutes: Routes = [
    {
/* Now Lazy Loaded, so path 'shopping-list' is over in APP-routing.module
        path: 'shopping-list',

        Here in this module we just have relative path of '' to that
*/
        path: '',
        component: ShoppingListComponent,
    }
];

@NgModule({
    declarations: [
        ShoppingListComponent,
        ShoppingEditComponent,
    ],
    imports: [
        // CommonModule, // << Now from SharedModule
        // ReactiveFormsModule,
        FormsModule, //  Needed here (though not in Recipes Module)
        RouterModule.forChild(myShoppingListRoutes),
        SharedModule,
    ],
    exports: [
/* Not Needed to be exported!
        RouterModule, // << nope
        // because the routing is right here in the ShoppingListModule, no need.
        // Contrast with RecipesModule, where routing was in its own RecipesRoutingModule.
        // That one did need to be exported
        // **UPDATE** to above statement. No. Even in RecipesModule it
        was **NOT** needed to export the RecipesRoutingModule. Interesting.
*/
    ],
})
export class ShoppingListModule {

}
