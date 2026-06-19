import { Directive } from '@angular/core';

@Directive({
  selector: '[appUsuarioBadge]',
  host: {
    class: 'badge text-bg-primary',
  },
})
export class UsuarioBadgeDirective {}
