
export class User {
    /*
    https://kendaleiv.com/typescript-constructor-assignment-public-and-private-keywords/

BAD OLD WAY (jus' kiddin')
----------------
class TestClass {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }
}
----------------

GROOVY COOL NEW WAY (Thanks, TypeScript!)
----------------
class TestClass {
  constructor(private name: string) { }
}
----------------
     */
    /*
    01 MAX Code has 'public' on first two, 'private' on last two.
    That apparently is "shortcut" to not need to then
    declare variable names (as I do bit further below).

    Below I try the "non-shortcut" way, for learning, etc.
     */
/* WORKS BEAUTIFULLY. WOW. WHAT MAX DOES.
GROOVY COOL NEW WAY (Thanks, TypeScript!)
    constructor(
        public email: string,
        public id: string, // Firebase item ID (on the user)
        private _token: string,
        private _tokenExpirationDate: Date,
    ) { }
*/

    /*
    O LA. YEAH THAT WORKED (above)
token: "eyJhbGciOiJ...oRn8q1CJw"
email: "necessary@cat.edu"
id: "hMv51L1tHof1paEgJe9ZEjUVhH82"
_token: "eyJhbGci...1CJw"
_tokenExpirationDate: Fri Jan 03 2020 08:08:40 GMT-0500 (Eastern Standard Time) {}
     */

/* USED ALONG WITH "#03" and "#04" BELOW
Leaving off the 'public' and 'private' totally messed up constructing new User. Sheesh!
*/
    constructor(
        // BAD OLD WAY (jus' kiddin')
        emailPassedIn: string,
        idPassedIn: string, // Firebase item ID (on the user)
        _tokenPassedIn: string,
        _tokenExpirationDatePassedIn: Date,
    ) {
        // O LA!!!
        // What I forgot was here inside constructor braces codeblock!!!
        // To make the **ASSIGNMENTS**
        // from PARAMS onto CLASS MEMBERS.
        // Yeesh.
        this.email = emailPassedIn;
        this.id = idPassedIn;
        this._token = _tokenPassedIn;
        this._tokenExpirationDate = _tokenExpirationDatePassedIn;
    }


/* 02 First I tried, omitting 'public', 'private'. Seemed to work. Didn't complain. fwiw.
    email = '';
    id = '';
    _token = '';
    _tokenExpirationDate = null;
*/

// 03 Here we are with the variable declarations, along w. 'public'/'private'. Cheers. (So much for shortcuts.)
/* Pretty interesting. With this "#03" the new User() gets you this:
*
* token: null
email: ""
id: ""
_token: ""
_tokenExpirationDate: null
*
* */
/* 03:
    public email = '';
    public id = '';
    private _token = '';
    private _tokenExpirationDate = null;
*/


// 04 Here we are with no initialization values. B'oh!?
/* Hmm. With this "#04" new User() gets you empty one!
User { token: null }

*/
// BAD OLD WAY (jus' kiddin')
    public email;
    public id;
    private readonly _token;
    private readonly _tokenExpirationDate;

// Ignore these next 2 lines
    mailing; // testing var declaration a la primitive-issimo. okay.
    mailingString: string; // testing var declaration a la primitive but Typed mode. okay.

    get token() {

        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            // Token expired or non-existent
            return null;
        }
        console.log('primitive-issimo: this.mailing ', this.mailing);
        console.log('primitive but Typed: this.mailingString ', this.mailingString);
        // console.log('primitive but Typed: this.mailingString ', 1000 * this.mailingString); // << error
        // "error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type."
        // (Same for the left-hand side, btw)

        return this._token;
    }

}
