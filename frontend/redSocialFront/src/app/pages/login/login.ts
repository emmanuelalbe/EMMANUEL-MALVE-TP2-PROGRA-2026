import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]]
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    console.log('Login listo para conectar al backend:', this.loginForm.getRawValue());
  }

  protected showError(controlName: 'identifier' | 'password', error?: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }
}
