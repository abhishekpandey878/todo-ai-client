import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthFormPayload } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent implements OnInit {
  authMode: 'login' | 'register' = 'login';
  readonly registrationEnabled = false;
  isAuthenticating = false;
  authErrorMessage = '';
  authSuccessMessage = '';
  authForm: AuthFormPayload = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.token) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    if (mode === 'register' && !this.registrationEnabled) {
      this.authErrorMessage = 'Registration is currently disabled.';
      this.authSuccessMessage = '';
      return;
    }

    this.authMode = mode;
    this.authErrorMessage = '';
    this.authSuccessMessage = '';
  }

  submitAuth(): void {
    if (this.authMode === 'register' && !this.registrationEnabled) {
      this.authErrorMessage = 'Registration is currently disabled.';
      this.authSuccessMessage = '';
      return;
    }

    const email = this.authForm.email.trim();
    const password = this.authForm.password.trim();
    const name = this.authForm.name?.trim() ?? '';

    if (!email || !password || (this.authMode === 'register' && !name)) {
      this.authErrorMessage = 'Please fill in all required fields.';
      this.authSuccessMessage = '';
      return;
    }

    this.isAuthenticating = true;
    this.authErrorMessage = '';
    this.authSuccessMessage = '';

    const request$ =
      this.authMode === 'register'
        ? this.authService.register({ name, email, password })
        : this.authService.login({ email, password });

    request$.subscribe({
      next: (response) => {
        this.isAuthenticating = false;

        if (this.authMode === 'register') {
          this.authService.logout();
          this.authMode = 'login';
          this.authForm = {
            name: '',
            email: response.user.email,
            password: ''
          };
          this.authSuccessMessage = 'Registration successful. Please log in to continue.';
          return;
        }

        this.authForm = { name: '', email: '', password: '' };
        this.router.navigateByUrl('/dashboard');
      },
      error: (error: HttpErrorResponse) => {
        this.authErrorMessage = error.error?.message ?? 'Authentication failed.';
        this.authSuccessMessage = '';
        this.isAuthenticating = false;
      }
    });
  }
}
