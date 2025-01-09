// video.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';  // Dein AuthService für Token-Verwaltung

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = 'http://127.0.0.1:8000/api/genres/videos/';  // Deine API-URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  getVideos(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No access token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiUrl, { headers });
  }
}

