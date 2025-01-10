import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Hier definierst du die Basis-URL deines Backends
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Methode zum sicheren Zugriff auf localStorage
  private get isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  isLoggedIn(): boolean {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return false;
    }

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiry = payload.exp * 1000;

    return Date.now() < expiry;
  }

  private getTokenExpiry(token: string): number {
    const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Extrahiere den Payload des Tokens
    return tokenPayload.exp * 1000; // Konvertiere den Expiry-Timestamp von Sekunden zu Millisekunden
  }

  activateAccount(uid: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/api/users/activate/${uid}/${token}/`; // URL zusammenstellen

    return this.http.get(url); // GET-Request ohne Payload
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/api/users/login/`, { email, password })
      .pipe(
        tap((tokens: any) => {
          this.storeTokens(tokens);
        })
      );
  }

  // Signup-Methode
  signup(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/api/users/signup/`, body);
  }

  // Password Reset anfordern
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/password_reset/`, {
      email,
    });
  }

  // Methode zur Validierung des Reset-Tokens
  validateResetToken(uid: string, token: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}`
    );
  }

  // Methode zum Zurücksetzen des Passworts
  resetPassword(
    uid: string,
    token: string,
    newPassword: string
  ): Observable<any> {
    const payload = {
      new_password1: newPassword,
      new_password2: newPassword,
    };
    return this.http.post<any>(
      `${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}/`,
      payload
    );
  }

  // Hol das JWT
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  // Setze den Authorization Header
  getAuthHeaders() {
    const token = this.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Überprüfe, ob der Benutzer eingeloggt ist
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  isAccessTokenExpired(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return true;

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  }

  isRefreshTokenAvailable(): boolean {
    const refreshToken = localStorage.getItem('refreshToken');
    return !!refreshToken;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Weiterleitung zur Login-Seite
    window.location.href = '/login';
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.http
      .post(`${this.apiUrl}/api/users/token/refresh/`, {
        refresh: refreshToken,
      })
      .pipe(
        tap((tokens: any) => {
          // Speichere die neuen Tokens im Local Storage
          this.storeTokens(tokens);
        })
      );
  }

  storeTokens(tokens: { access: string; refresh: string }): void {
    if (tokens.access) {
      localStorage.setItem('accessToken', tokens.access);
    }
    if (tokens.refresh) {
      localStorage.setItem('refreshToken', tokens.refresh);
    }
  }
}
