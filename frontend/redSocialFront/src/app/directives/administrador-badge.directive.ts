import { Directive } from '@angular/core';

@Directive({
  selector: '[appAdministradorBadge]',
  host: {
    class: 'badge text-bg-danger',
  },
})
export class AdministradorBadgeDirective {}
