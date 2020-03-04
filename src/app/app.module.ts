import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

/* These 2 now subsumed into AppReducer map (following line)
import {shoppingListReducer} from './shopping-list/store/shopping-list.reducer';
import { authReducer } from './auth/store/auth.reducer';
*/
import { myRootReducersMap } from './store/app.reducer'; // YES
// import * as fromRoot from './store/app.reducer'; // also good; maybe not needed here in AppModule


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot(
      // 03 Should be just this: myRootReducersMap
        // (and, don't forget to remove those surrounding '{ }' !! o la.)
        // 03A Also the '*' as fromRoot and then fromRoot.myRootReducersMap  works fine
        // fromRoot.myRootReducersMap
        myRootReducersMap
    ),
/* 02 No.
For root, finally, having already prepared a "ActionReducerMap" over in AppReducer,
here in AppModule you do not (need to, nor should) re-name, re-associate, re-assign
to (yet another) property name & Etc. No.
You just (see 03 above) put the myRootReducersMap in directly, alone. Cheers.

StoreModule.forRoot({
      myOverallRootStateViaReducer: myRootReducersMap, // << No need for LHS
      )}
*/
/* 01 PRIOR to AppReducer's introduction to combine these
    StoreModule.forRoot({
      myShoppingListViaReducer: shoppingListReducer,
      myAuthViaReducer: authReducer,
    }),
*/
      /*
      O LA!
      re: above line:

      Right-Hand Side (RHS): shoppingListReducer
      Left-Hand Side (LHS): myShoppingListViaReducer

      RHS: This name, shoppingListReducer, comes from the exported function in shopping-list.reducer.ts.
      LHS: This name, myShoppingListViaReducer, is introduced right here, in app.module.ts.
           This LHS name gets used in shopping-list.component.ts constructor, like so:
              private myStore: Store<{ myShoppingListViaReducer: { ingredients: Ingredient[] } }>,

      Many programmers just *Keep The Same Name.*

N.B. MAX Code actually does use different names:
shoppingList: shoppingListReducer

      Anyway, re: "same name" - Not for me.
      I like to (feel I sort of have to) *Change 'Em Up.*
      Why?
      To LEARN exactly what each is DOING.

      So, here in the AppModule, one creates a sort of MAPPING,
      FROM the names of reducers as established over in *-reducer.ts files (ok),
      TO the names (different y not) of "parts" or "sections" or "areas"
      of the Store, as established here in app.module.ts. (also ok).

      Then, with that "mapping" in place, Components and whatnot that call/need the Store, use these
      Mapped Names to get a reference to that area of the Store.

      Below the initial example we have, of the ShoppingListComponent using
      the Store, to get the list of ingredients.
      That list comes from the shopping-list reducer, into the Store, and
      is from there available to the Component. In the Component, you invoke
      the "myShoppingListViaReducer" to get at that part of the Store. Cheers.
      (I had mistakenly been invoking just "shoppingListReducer" = WRONG-O.)
       */
    !environment.production ? StoreDevtoolsModule.instrument({
      maxAge: 10
    }) : [],
    SharedModule,
    CoreModule, // << anything here is Eagerly Loaded
  ],
  exports: [
  ],
  providers: [
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
