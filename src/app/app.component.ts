import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { LoggingService } from './logging.service';
import { Store } from '@ngrx/store';
import * as fromRoot from './store/app.reducer';
import * as AuthActions from './auth/store/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
      private myAuthService: AuthService,
      private myLoggingService: LoggingService,
      private myStore: Store<fromRoot.MyOverallRootState>,
  ) { }


  ngOnInit() {
/* No longer on AuthService - now on NGRX/Effects etc.
    this.myAuthService.autoLogIn();
*/
    this.myStore.dispatch(new AuthActions.AutoLoginActionClass());
    this.myLoggingService.printLog('AppComponent says Hi');
  }

/* No longer:
  loadedFeature = 'recipe';
  onNavigate(feature: string) {
    this.loadedFeature = feature;
  }
*/

}
