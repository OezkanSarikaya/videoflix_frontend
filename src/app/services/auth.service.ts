import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL zu deinem Backend
  private accessToken: string | null = null;
  private refreshTokenTimeout: any;

  constructor(private http: HttpClient, private router: Router) {}

  // Überprüft, ob der Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() < expiry;
  }

  // Account-Aktivierung
  activateAccount(uid: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/api/users/activate/${uid}/${token}/`;
    return this.http.get(url);
  }

  // Startet den Timer für das automatische Token-Refresh
  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer(); // Vorherige Timer stoppen

    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = tokenPayload.exp * 1000;
    const timeout = expiresAt - Date.now() - 60000; // 1 Minute vor Ablauf

    if (timeout > 0) {
      console.log(`🕒 Timer wird in ${timeout / 1000} Sekunden ausgelöst`);
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe();
      }, timeout);
    } else {
      console.warn('❌ Timeout zu kurz, kein Timer gestartet');
    }
  }

  // Stoppt den Timer für das automatische Token-Refresh
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  // Login-Methode
  login(email: string, password: string, rememberme: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/login/`, { email, password }).pipe(
      tap((tokens) => {
        this.storeTokens(tokens, rememberme);
        this.startRefreshTokenTimer();
      })
    );
  }

  // Signup-Methode
  signup(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/api/users/signup/`, body);
  }

  // Passwort zurücksetzen anfordern
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/password_reset/`, { email });
  }

  // Reset-Token validieren
  validateResetToken(uid: string, token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}`);
  }

  // Passwort zurücksetzen
  resetPassword(uid: string, token: string, newPassword: string): Observable<any> {
    const payload = {
      new_password1: newPassword,
      new_password2: newPassword,
    };
    return this.http.post<any>(
      `${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}/`,
      payload
    );
  }

  // Hol den Access Token
  getAccessToken(): string | null {
    return (
      this.accessToken ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }

  // Setze den Authorization Header
  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Überprüft, ob der Benutzer authentifiziert ist
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Überprüft, ob der Access Token abgelaufen ist
  isAccessTokenExpired(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return true;

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  }

  // Überprüft, ob ein Refresh Token vorhanden ist
  isRefreshTokenAvailable(): boolean {
    const refreshToken = this.getRefreshToken();
    return !!refreshToken;
  }

  // Logout-Methode
  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.stopRefreshTokenTimer();
    this.router.navigate(['/login']);
  }

  // Refresh Token Methode
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
  
    if (!refreshToken) {
      console.warn('⚠️ Kein Refresh Token gefunden! Benutzer wird ausgeloggt.');
      this.logout();
      return throwError(() => new Error('No refresh token found'));
    }
  
    return this.http.post<any>(`${this.apiUrl}/api/users/token/refresh/`, { refresh: refreshToken }).pipe(
      tap({
        next: (tokens) => {
          console.log('✅ Refresh erfolgreich:', tokens);
          const rememberme = !!localStorage.getItem('accessToken');
          this.storeTokens(tokens, rememberme);
          this.startRefreshTokenTimer();
        },
        error: (error) => {
          console.error('❌ Refresh fehlgeschlagen:', error);
  
          // Falls der Server 401 zurückgibt -> Logout
          if (error.status === 401) {
            console.warn('⛔ Refresh Token abgelaufen! Benutzer wird ausgeloggt.');
            this.logout();
          }
        }
      })
    );
  }

  // Hol den Refresh Token
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  }

  // Speichere Tokens im Storage
  private storeTokens(tokens: any, rememberme: boolean): void {
    const storage = rememberme ? localStorage : sessionStorage;

    // Speichere den Access Token
    storage.setItem('accessToken', tokens.access);

    // Speichere den Refresh Token nur, wenn er vorhanden ist
    if (tokens.refresh) {
      storage.setItem('refreshToken', tokens.refresh);
    }
  }
}
