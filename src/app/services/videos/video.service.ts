// video.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom, of } from 'rxjs';
import { AuthService } from '../auth.service'; // Dein AuthService für Token-Verwaltung
import { environment } from '../../environment/environment';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = environment.apiUrl + '/';
  // private lastBlobUrl: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getVideoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/videos/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getVideoData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/videos/`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  async getVideoBlob(videoUrl: string): Promise<string> {
    const cleanedUrl = videoUrl.replace(/^\/+/, '');
    const fullUrl = `${this.apiUrl}/${cleanedUrl}`.replace(
      /([^:]\/)\/+/g,
      '$1'
    );

    try {
      const blob = await lastValueFrom(
        this.http
          .get(fullUrl, {
            headers: this.authService.getAuthHeaders(),
            responseType: 'arraybuffer',
          })
          .pipe(timeout(30000))
      );

      const videoBlob = new Blob([blob], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(videoBlob);

      (window as any).lastBlobURL = blobUrl; // Für Debugging

      return blobUrl;
    } catch (error) {
      console.error('❌ Fehler beim Laden des Videos:', error);
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
      responseType: 'blob', // WICHTIG: Bild als Binary-Blob anfordern
    });
  }
}
