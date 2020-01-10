import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.css'],
})
export class AlertComponent {

    // *** SEE HTML for EXAMPLE & ANNOTATIONS on how this is used with *ngIf

    @Input() alertMessageErrorToDisplay: string;
    /*
    Recall, @Input() makes this component property/member "settable" from outside the component.
    Used to **PASS IN** data
     */

    @Output() myDismissMessageEventEmitter = new EventEmitter<void>(); // returns ? EMITS void. (you could emit some data; hmm)
    /*
    NOTE! Something you should Just Know: the Angular "EventEmitter" is basically, or based upon,
    a SUBJECT. Yes, the RXJS kind of Observable thing.
    So, it is something that Yes you can SUBSCRIBE to.

    And yes, over in AuthComponent we do just that: .subscribe() to this,
    to listen for the Event, the User Click (to close/dismiss the modal).
    Cheers.
     */

    /*
    Hmm, @Output() does what, exactly...?
    It is the decorator (yes?) indicating a property is an EVENT EMITTER.
    Through this, the Component can **SEND OUT** something - an event (With optional data)

    And so, in our use case here, the Event is simply a User Click. (To close/dismiss the modal)
     */

    myAlertDismissMessage() {
        // this.alertMessageErrorToDisplay = null; // << No. we did this (simply setting to null) on AuthComponent.
        // But here in Dynamic Component for modal dialog, we do @Output() and emit stuff
        this.myDismissMessageEventEmitter.emit();
    }

}
