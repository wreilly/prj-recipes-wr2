import { Injectable } from '@angular/core';

/* Now MAX is putting this Service instead into AppModule..
And actually that is Exactly the Same as providedIn: 'root' here.
Good.

@Injectable({
    providedIn: 'root',
})
*/
// Good to put on top of Services even if not strictly needed:
@Injectable()
export class LoggingService {
    lastlog: string;

    printLog(message: string ) {
        /*
        Okay - for "@Injectable() and providedIn: 'root',
        with the below few lines we can demonstrate that this
        is indeed one application-wide Service:
        - AppComponent printLog('a')
        - ShoppingListComponent printLog('b') >> prints b and that former a << proves the (same) Service
          used the (same) object for both Components. Cheers.

          (I also put it into HeaderComponent re:
          isAuthenticated subscription etc. Worked too.)
         */
        console.log('printLog() message ', message);
        console.log('lastlog is/was: ', this.lastlog);
        this.lastlog = message; // whamma-jamma bueno
    }

}
