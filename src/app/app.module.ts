import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Template-driven e.g. shopping list edit
import { ReactiveFormsModule } from '@angular/forms'; // Reactive (model-driven) e.g. recipe edit
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

import { RecipesModule } from './recipes/recipes.module';
/* RECIPES MODULE
import { RecipesComponent } from './recipes/recipes.component';
import { RecipeListComponent } from './recipes/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeItemComponent } from './recipes/recipe-list/recipe-item/recipe-item.component';
import { RecipeStartComponent } from './recipes/recipe-start/recipe-start.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
*/
import {RecipeService} from './recipes/recipe.service';
// I guess Services (usually?) left in APP Module (not down in Recipes Module)

import { ShoppingListModule } from './shopping-list/shopping-list.module';
/* SHOPPING-LIST MODULE
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { ShoppingEditComponent } from './shopping-list/shopping-edit/shopping-edit.component';
*/

import { ShoppingListService } from './shopping-list/shopping-list.service';


// import { DataStorageService } from './shared/data-storage.service'; // << RECIPES-RESOLVER.SERVICE instead of here in AppModule!

// import { RecipesRoutingModule } from './recipes/recipes-routing.module'; // no. over in RecipesModule instead
import { AppRoutingModule } from './app-routing.module';


import { AuthComponent } from './auth/auth.component';
// import { AuthService } from './auth/auth.service';

// Ye Olde Barrel (of Interceptors)
// Nah: import { AuthInterceptorService } from './http-interceptors/auth-interceptor.service';
import { HttpInterceptorsMyConst } from './http-interceptors'; // dont' need '/index.ts' apparently. Okay.


/* THESE 4 GO IN SHARED MODULE.

import { DropdownDirective } from './shared/dropdown.directive';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { AlertComponent } from './shared/alert/alert.component';
import { PutThingHereDirective } from './shared/put-thing-here/put-thing-here.directive';
*/

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
/* RECIPES MODULE
    RecipesComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeItemComponent,
    RecipeStartComponent,
    RecipeEditComponent,
*/
/* SHOPPING-LIST MODULE
    ShoppingListComponent,
    ShoppingEditComponent,
*/

    AuthComponent,

/* THESE 4 GO IN SHARED MODULE
    DropdownDirective,
    LoadingSpinnerComponent,
    AlertComponent,
    PutThingHereDirective,
*/
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    RecipesModule,
//    RecipesRoutingModule, // no. over in RecipesModule instead
    ShoppingListModule,
  ],
  exports: [
      SharedModule,
  ],
  providers: [
    ShoppingListService,
    RecipeService, // I guess Services (usually?) left in APP Module (not down in Recipes Module)
    HttpInterceptorsMyConst,
  ],
  entryComponents: [
/*
      AlertComponent, // Moved to SharedModule. (Q. Does it work from there?) (A. Seems, yeah!)
*/
  ],
  // WR__ test editing added RecipeService.
  // yes, needs to be here at root, not up/over in a Shopping component...
  // https://itnext.io/understanding-provider-scope-in-angular-4c2589de5bc
  bootstrap: [AppComponent]
})
export class AppModule { }
