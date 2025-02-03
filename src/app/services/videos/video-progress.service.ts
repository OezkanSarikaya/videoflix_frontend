import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class VideoProgressService {
  private apiUrl = environment.apiUrl + '/api/video-progress/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Fortschritt speichern
  saveProgress(videoId: number, progress: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(
      this.apiUrl,
      { video: videoId, progress },
      { headers }
    );
  }

  // Fortschritt abrufen
  getProgress(videoId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}${videoId}/`, { headers });
  }
}
