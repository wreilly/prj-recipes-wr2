import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { LoggingService } from './logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
      private myAuthService: AuthService,
      private myLoggingService: LoggingService,
  ) { }


  ngOnInit() {
    this.myAuthService.autoLogIn();
    this.myLoggingService.printLog('AppComponent says Hi');
  }

/* No longer:
  loadedFeature = 'recipe';
  onNavigate(feature: string) {
    this.loadedFeature = feature;
  }
*/

}
