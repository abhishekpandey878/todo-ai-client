import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthFormPayload, AuthResponse, AuthUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenStorageKey = 'mean_todo_token';
  private readonly userStorageKey = 'mean_todo_user';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  register(payload: AuthFormPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  login(payload: AuthFormPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  getCurrentUser(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        localStorage.setItem(this.userStorageKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    this.currentUserSubject.next(null);
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenStorageKey, response.token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(this.userStorageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch (_error) {
      localStorage.removeItem(this.userStorageKey);
      return null;
    }
  }
}
