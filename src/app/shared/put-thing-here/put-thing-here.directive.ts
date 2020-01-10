import {Directive, ViewContainerRef} from '@angular/core';

/* https://angular.io/guide/structural-directives#write-a-structural-directive
 I believe this here Directive is *not* Structural, btw.
 Does not import TemplateRef, does not have or use <ng-template>
*/
@Directive({
    selector: '[appPutThingHereDirective]' // << '[]' syntax to get ATTRIBUTE name. Note it's camelCase
    // https://angular.io/guide/styleguide#symbols-and-file-names
})
export class PutThingHereDirective {
    /*
    MAX Code calls "PlaceholderDirective"
    Idea is this Directive gets used as an ATTRIBUTE
    on an <ng-template appPutThingHereDirective> wherever you want
    ("put thing here" / "placeholder goes here")
    in your template DOM.
    Cheers

    Other idea is this directive exposes ('public') a
    reference to its "view container"
    This is referenced by AuthComponent
     */
    constructor(
        public myPutThingHereDirectiveViewContainerRef: ViewContainerRef
    ) {
    }
}
