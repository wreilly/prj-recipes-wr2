import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownDirective } from './dropdown.directive';
import { PutThingHereDirective } from './put-thing-here/put-thing-here.directive';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

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
    ],
    entryComponents: [
        AlertComponent, // Q. hmm does this work from here?
        // A. Apparently yeah!
    ],
})
export class SharedModule {

}
