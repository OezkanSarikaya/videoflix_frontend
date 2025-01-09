import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  activateAccount(uid: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/api/users/activate/${uid}/${token}/`; // URL zusammenstellen
    console.log('Sending GET request to:', url);
    return this.http.get(url); // GET-Request ohne Payload
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
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/password_reset/`, { email });
  }

 
  // Methode zur Validierung des Reset-Tokens
  validateResetToken(uid: string, token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}`);
  }

  // Methode zum Zurücksetzen des Passworts
  resetPassword(uid: string, token: string, newPassword: string): Observable<any> {
    const payload = {
      new_password1: newPassword,
      new_password2: newPassword
    };
    return this.http.post<any>(`${this.apiUrl}/api/users/password_reset/confirm/${uid}/${token}/`, payload);
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

