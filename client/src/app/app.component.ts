import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthUser } from './models/auth.model';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isRestoringSession = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    if (this.authService.token) {
      this.restoreSession();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  private restoreSession(): void {
    this.isRestoringSession = true;

    this.authService.getCurrentUser().subscribe({
      next: () => {
        this.isRestoringSession = false;

        if (this.router.url === '/') {
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: () => {
        this.authService.logout();
        this.isRestoringSession = false;
        this.router.navigateByUrl('/');
      }
    });
  }
}
