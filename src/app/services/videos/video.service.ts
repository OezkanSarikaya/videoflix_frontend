// video.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service'; // Dein AuthService für Token-Verwaltung
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = environment.apiUrl + '/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getVideoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/videos/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getVideos(): Observable<any> {
    // return this.http.get(this.apiUrl + 'api/genres/videos/', {
      return this.http.get(`${this.apiUrl}api/genres/videos/`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getVideosWithProgress(): Observable<any> {
    return this.http.get(`${this.apiUrl}api/video-progress-list/`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
