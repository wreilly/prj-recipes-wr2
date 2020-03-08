import { Action } from '@ngrx/store';
import {User} from '../user.model';

// Now w @ngrx/effects, new Actions:
export const LOG_IN_START_EFFECT_ACTION = '[Auth] Login Start Effect Action';

export const LOG_IN_ACTION = '[Auth] Login Action'; // 'LOG_IN_ACTION';
// TODO Above could now be renamed "LOG_IN_SUCCESS_ACTION" ... we'll see...

export const LOG_OUT_ACTION = '[Auth] Logout Action'; // 'LOG_OUT_ACTION';

export class LogInStartEffectActionClass implements Action {
    readonly type = LOG_IN_START_EFFECT_ACTION;

    constructor(public myPayload: {
        email: string,
        password: string,
    }) { }

}

export class LogInActionClass implements Action {
    readonly type = LOG_IN_ACTION;
    constructor(
        // public myPayload: User // << No. has extra stuff like get token()
    public myPayload: {
        email: string,
        id: string, // sheesh. Max has id: on User model, but userId: on his Login Action. Sheesh.
        _token: string, // sheesh. Max uses token
        _tokenExpirationDate: Date, // sheesh. Max uses expirationDate: Date, OR, expiresIn: number
    }
    ) {  }
}

export class LogOutActionClass implements Action {
    readonly type = LOG_OUT_ACTION;
    constructor( ) {  } // no myPayload, I expect
}

export type AuthActionsUnionType =
      LogInActionClass
    | LogOutActionClass
    | LogInStartEffectActionClass;
