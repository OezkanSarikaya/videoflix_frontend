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

  async getVideoBlob(videoUrl: string): Promise<string> {
    // console.log('getVideoBlob:'+videoUrl);
    
    const cleanedUrl = videoUrl.replace(/^\/+/, ''); // Entfernt führende Slashes
    const fullUrl = `${this.apiUrl}${cleanedUrl}`;

    const headers = new Headers({
      Authorization: `Bearer ${this.authService.getAccessToken()}`,
    });

    try {
      const response = await fetch(fullUrl, { headers });

      if (!response.ok) {
        console.error('Fehler beim Abrufen des Videos:', response.status);
        throw new Error('Video konnte nicht geladen werden');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Fehler beim Laden des Videos:', error);
      return '';
    }
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


  getThumbnailUrl(thumbnailPath: string): Observable<Blob> {
    const headers = this.authService.getAuthHeaders(); // Holt den Bearer-Token
    return this.http.get(`${this.apiUrl}${thumbnailPath}`, { 
      headers,
      responseType: 'blob' // WICHTIG: Bild als Binary-Blob anfordern
    });
  }
}
