import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import * as fromRecipeActions from './recipe.actions';

/*
       TABLE of CONTENTS

 */

@Injectable()
export class RecipeEffects {
    // Constructor on BOTTOM


    @Effect()
    SomethingRecipeEffect = this.myRecipeEffectActions$.pipe(
        // ?
        ofType(fromRecipeActions.ADD_RECIPE_ACTION),
        map(
            (whatWeGot) => {
                //
                console.log('whatWeGot ', whatWeGot);
            }
        ),
    );

    constructor(
        private myRecipeEffectActions$: Actions,
    ) { }

}
