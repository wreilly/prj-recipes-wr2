import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
/*
import {  } from '';
import {  } from '';
import {  } from '';
import {  } from '';
*/

const myAuthRoutes: Routes = [
    {
/* Lazy loaded, now this path 'auth' is over in APP-routing.module
        path: 'auth',

        Here in AuthModule we just want relative '' path to that
*/
        path: '',
        component: AuthComponent,
    }
];

@NgModule({
    declarations: [
        AuthComponent,
    ],
    imports: [
        RouterModule.forChild(myAuthRoutes),
        ReactiveFormsModule,
        SharedModule,
    ],
    exports: [
/*
        RouterModule,
*/
/*
Hmm hitting error:
core.js:4002 ERROR Error: Uncaught (in promise): Error: Cannot match any routes. URL Segment: 'auth'
Error: Cannot match any routes. URL Segment: 'auth'
    at ApplyRedirects.push../node_modules/@angular/router/fesm5/router.js.ApplyRedirects.noMatchError
 */
        /* Not Needed to be exported! Q. Really?  A. _____
        RouterModule, // << nope
        // because the routing is right here in the AuthModule, no need.
        // (This is like ShoppingListModule, too.)
        //
        // Contrast with RecipesModule, where routing was in its own RecipesRoutingModule.
        // That one did need to be exported
*/

    ],
    providers: [

    ],
})
export class AuthModule {

}
