import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl; // Hier definierst du die Basis-URL deines Backends
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  // Methode zum sicheren Zugriff auf localStorage
  private get isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Login-Methode
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/api/users/login/`, body);
  }

  // Signup-Methode
  signup(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/api/users/signup/`, body);
  }

  // Password Reset anfordern
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/password_reset/`, { email });
  }

  // Passwort zurücksetzen
  resetPassword(uid: string, token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}/`, { new_password: newPassword });
  }

  // Setze das JWT
  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('access_token', token); // Optional: Du kannst das Token auch im localStorage speichern
  }

  // Hol das JWT
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('access_token');
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

  // Logout des Benutzers
  logout() {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}

