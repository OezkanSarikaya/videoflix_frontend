// video.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom , of } from 'rxjs';
import { AuthService } from '../auth.service'; // Dein AuthService für Token-Verwaltung
import { environment } from '../../environment/environment';
import { timeout  } from 'rxjs/operators';

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

  // getVideoBlob(videoUrl: string): Observable<string> {
  //   const cleanedUrl = videoUrl.replace(/^\/+/, '');
  //   const fullUrl = `${this.apiUrl}/${cleanedUrl}`.replace(/([^:]\/)\/+/g, '$1');
  //   const token = this.authService.getAccessToken();
  
  //   return this.http.get(fullUrl, {
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${token}`,
  //     }),
  //     responseType: 'blob', // 📌 Blob als Antwort
  //   }).pipe(
  //     map(blob => URL.createObjectURL(blob)), // 📌 Blob zu URL umwandeln
  //     catchError(error => {
  //       console.error('❌ Fehler beim Abrufen des Videos:', error);
  //       return of(''); // Fehler: Leere URL zurückgeben
  //     })
  //   );
  // }

  // async getVideoBlob(videoUrl: string): Promise<string> {
  //   const cleanedUrl = videoUrl.replace(/^\/+/, ''); // Entfernt führende Slashes
  //   const fullUrl = `${this.apiUrl}/${cleanedUrl}`.replace(
  //     /([^:]\/)\/+/g,
  //     '$1'
  //   ); // Entfernt doppelte Slashes

  //   const token = this.authService.getAccessToken();

  //   const headers = new Headers({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   try {
  //     const response = await fetch(fullUrl, { headers });

  //     if (!response.ok) {
  //       console.error(
  //         '❌ Fehler beim Abrufen des Videos:',
  //         response.status,
  //         response.statusText
  //       );
  //       throw new Error(
  //         `Video konnte nicht geladen werden (Status: ${response.status})`
  //       );
  //     }

  //     const blob = await response.blob();
  //     // console.log('✅ Video erfolgreich geladen:', fullUrl);
  //     return URL.createObjectURL(blob);
  //   } catch (error) {
  //     console.error('getVideoBlob: ❌ Fehler beim Laden des Videos:', error);
  //     return '';
  //   }
  // }

  async getVideoBlob(videoUrl: string): Promise<string> {
    const cleanedUrl = videoUrl.replace(/^\/+/, '');
    const fullUrl = `${this.apiUrl}/${cleanedUrl}`.replace(/([^:]\/)\/+/g, '$1'); 

    console.log('🔍 Fetching video:', fullUrl);

    try {
      const blob = await lastValueFrom(
        this.http.get(fullUrl, { headers: this.authService.getAuthHeaders(), responseType: 'blob' }).pipe(timeout(30000))
      );

      const blobUrl = URL.createObjectURL(blob);
      (window as any).lastBlobURL = blobUrl; // Für Debugging
      console.log('✔ Blob gespeichert:', blobUrl);

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
