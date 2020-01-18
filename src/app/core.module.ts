import { NgModule } from '@angular/core';

import { RecipeService } from './recipes/recipe.service';
import { ShoppingListService } from './shopping-list/shopping-list.service';
import { HttpInterceptorsMyConst } from './http-interceptors';
import { LoggingService } from './logging.service';

@NgModule({
    declarations: [

    ],
    imports: [

    ],
    exports: [

    ],
    providers: [
        RecipeService,
        ShoppingListService,
        HttpInterceptorsMyConst,
        LoggingService,
        /*
        Unlike SharedModule, loaded both yeah Eagerly but
        also Lazily (by other Modules),
        here in only-Eagerly Loaded
        CoreModule we really do
        only import it once: by AppModule, so any Service
        provided here in CoreModule is application-wide.
        We won't run risk of getting another Instance of the
        Service from some other import in another Module.
        Cheers.
         */
    ],
})
export class CoreModule {

}
