// video.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';  // Dein AuthService für Token-Verwaltung

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = 'http://127.0.0.1:8000/';  // Deine API-URL

  constructor(private http: HttpClient, private authService: AuthService) {}
  

  getVideoById(id: string): Observable<any> {
    // const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    
    // if (!token) {
    //   throw new Error('No access token found');
    // }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}api/videos/${id}`, { headers: this.authService.getAuthHeaders(), });
  }

  getVideos(): Observable<any> {
    // const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    
    // if (!token) {
    //   throw new Error('No access token found');
    // }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiUrl + 'api/genres/videos/', { headers: this.authService.getAuthHeaders(), });
  }

  getVideosWithProgress(): Observable<any> {
    return this.http.get(`${this.apiUrl}api/video-progress-list/`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}

