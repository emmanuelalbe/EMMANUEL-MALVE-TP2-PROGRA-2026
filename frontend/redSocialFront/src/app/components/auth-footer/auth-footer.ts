import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-footer',
  templateUrl: './auth-footer.html',
  styleUrl: './auth-footer.css',
})
export class AuthFooterComponent {
  readonly anio = new Date().getFullYear();
}
