import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class VideoProgressService {
  private apiUrl = 'http://127.0.0.1:8000/api/video-progress/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Fortschritt speichern
  saveProgress(videoId: number, progress: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      this.apiUrl,
      { video: videoId, progress },
      { headers }
    );
  }

  // Fortschritt abrufen
  getProgress(videoId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}${videoId}/`, { headers });
  }

  // Methode zum Erstellen der Auth-Header
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
}
