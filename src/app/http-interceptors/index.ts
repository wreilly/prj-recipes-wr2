// Ye Olde Barrel
/* "Barrel" of Http Interceptors */
// https://angular.io/guide/http#provide-the-interceptor

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptorService } from './auth-interceptor.service';

// We 'export' a CONST, not a CLASS. Okay.
export const HttpInterceptorsMyConst =
    [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true,
        }
    ];
