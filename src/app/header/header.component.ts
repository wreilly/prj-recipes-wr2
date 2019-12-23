import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  // myHttp = new HttpClient(); // << Nope

  constructor(
      private myDataStorageService: DataStorageService,
      private myHttpClient: HttpClient
  ) { }

  sendBitOText(bitOText) { // TODO 20191221-0802 refactor the HTTP biz here to DataStorageService
    console.log('Header sendData', bitOText);
    const bitOJSON = { stuff: bitOText };
    this.myHttpClient.post('https://wr-ng8-prj-recipes-wr2.firebaseio.com/tossthings.json',
        bitOJSON)
        .subscribe(whatWeGot => {
          console.log(whatWeGot);
        // yep: {name: "-LwV2qXv_l5ZkrnGjKfj"}
        });
  }

  sendData() {
    this.myDataStorageService.storeRecipes(); // fire & forget
  }

  fetchData() {
    this.myDataStorageService.fetchRecipes().subscribe(); // << kinda benign noop .subscribe() cheers
    // 03 Now with Resolver biz we changed data service so yeah now we gotta trigger from here w .subscribe()
    // WAS:  fire & forget
        // 02 NOW 1) Service does do .subscribe(). Also, the Service method returns void, so, we don't do .pipe() here either. Cheers.
        // 01 WAS N.B. The Service method does not do '.subscribe()'. Va bene.
        /*
        .pipe(
            tap(
                whatWeGot => {
                  console.log('whatWeGot ', whatWeGot);
                }
            )
        ); // /.pipe()
        */
        // .subscribe();
      // 02 NOW dropping .subscribe() here.
    /* 01 So far at least I do need to "trigger" from here
      in the Component with this otherwise kind of
      useless (here) '.subscribe()'
      Go over to Service to see how/where/why the action
      happens (heading to RecipeListComponent with help
      from RecipeService).
      Cheers.
     */
  } // /fetchData()
}
