import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownDirective } from './dropdown.directive';
import { PutThingHereDirective } from './put-thing-here/put-thing-here.directive';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

// import { LoggingService } from '../logging.service';

@NgModule({
    declarations: [
        DropdownDirective,
        PutThingHereDirective,
        AlertComponent,
        LoadingSpinnerComponent,
    ],
    imports: [
        // (Recall: Components and Directives are declared, not imported)
        CommonModule,
    ],
    exports: [
        DropdownDirective,
        PutThingHereDirective,
        AlertComponent,
        LoadingSpinnerComponent,
        CommonModule, // << Interesting. Save importing this elsewhere (e.g. RecipesModule etc.)
    ],
    entryComponents: [
        AlertComponent, // Q. hmm does this work from here?
        // A. Apparently yeah!
    ],
    providers: [
        // LoggingService, // << Not best idea, here
        /*
        SharedModule is interesting case because it is both
        - Eagerly Loaded in AppModule
        - Lazily Loaded in AuthModule, ShoppingListModule, RecipesModule
        So, a SERVICE in SharedModule is going to get
        all those INSTANCES of it. Whoa. Watch out.
        Is that REALLY what you want. (Mebbe it is.)
        Cheers.
         */
    ],
})
export class SharedModule {

}
