import { Action } from '@ngrx/store';
import {User} from '../user.model';

export const LOG_IN_ACTION = '[Auth] Login Action'; // 'LOG_IN_ACTION';
export const LOG_OUT_ACTION = '[Auth] Logout Action'; // 'LOG_OUT_ACTION';

export class LogInActionClass implements Action {
    readonly type = LOG_IN_ACTION;
    constructor(
        public myPayload: User
    ) {

    }
}

export class LogOutActionClass implements Action {
    readonly type = LOG_OUT_ACTION;
    constructor( ) {  } // no myPayload, I expect
}

export type AuthActionsUnionType =
      LogInActionClass
    | LogOutActionClass;
