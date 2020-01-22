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
import {shoppingListReducer} from './shopping-list/store/shopping-list.reducer';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({
      myShoppingListReducer: shoppingListReducer
    }),
      /*
      O LA!
      re: above line:

      Right-Hand Side (RHS): shoppingListReducer
      Left-Hand Side (LHS): myShoppingListReducer

      RHS: This name, shoppingListReducer, comes from the exported function in shopping-list.reducer.ts.
      LHS: This name, myShoppingListReducer, is introduced right here, in app.module.ts.
           This LHS name gets used in shopping-list.component.ts constructor, like so:
              private myStore: Store<{ myShoppingListReducer: { ingredients: Ingredient[] } }>,

      Many programmers just *Keep The Same Name.*
      Not me.
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
      the "myShoppingListReducer" to get at that part of the Store. Cheers.
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
