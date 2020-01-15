import { Directive, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @HostBinding('class.open') isOpen = false;
  /*
  Sheesh. Something I did not understand (or recall now, from lecture long ago):

  'class' apparently is ("you get for free" ?), from Angular:
  the class attribute on the element. Reserved word I have to imagine.
Yeah, class must be a HostPropertyName:
  https://angular.io/api/core/HostBinding#hostpropertyname

  And '.open' is the name of a class you use, from Bootstrap CSS/LESS:

That is:
  e.g. <div class="dropdown" appDropdown>
  becomes, upon click (see HostListener just below)
       <div class="dropdown open" appDropdown>


  http://0.0.0.0:4200/recipes/node_modules/bootstrap/dist/css/less/dropdowns.less
---------------------
  // Open state for the dropdown
.open {
  // Show the menu
  > .dropdown-menu {
    display: block;
  }

  // Remove the outline when :focus is triggered
  > a {
    outline: 0;
  }
}
---------------------
   */

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
