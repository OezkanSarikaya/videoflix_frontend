import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { RouterLink } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service';  // Der Service für das Abrufen der Videos
import { AuthService } from '../../app/services/auth.service';  // Dein AuthService
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-video-offer',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterLink, CommonModule],
  templateUrl: './video-offer.component.html',
  styleUrl: './video-offer.component.scss'
})
export class VideoOfferComponent implements OnInit {
  videos: any[] = [];
  error: string | null = null;
  trailerTitle: string = 'Breakout';
  trailerDescription: string = 'In a high-security prison, a wrongly convicted man formulates a meticulous plan to break out and prove his innocence. He must navigate a web of alliances and betrayals to reclaim his freedom and expose the truth.';
  trailerVideoUrl: string = '/media/videos/breakout_720p.mp4';
  


  constructor(private videoService: VideoService, private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  modifyVideoUrl(originalUrl: string, suffix: string): string {
    const lastDotIndex = originalUrl.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return originalUrl; // Falls keine Endung gefunden wurde
    }
    
    const fileName = originalUrl.slice(0, lastDotIndex); // Dateiname ohne Endung
    const extension = originalUrl.slice(lastDotIndex);   // Endung (z. B. ".mp4")
    
    return `${fileName}${suffix}${extension}`;
  }

  onVideoClick(videoId: number): void {
    // Suche das Video anhand der ID
    for (const video of this.videos) {
      const movie = video.videos.find((v: any) => v.id === videoId);
      if (video) {
        // Werte in die Variablen speichern
        this.trailerTitle = movie.title;
        this.trailerDescription = movie.description;

        const originalUrl = movie.video_file;
        const modifiedUrl = this.modifyVideoUrl(originalUrl, '_720p');

        this.trailerVideoUrl = modifiedUrl;

        break;
      }
    }
  }

  loadVideos(): void {
    if (this.authService.isLoggedIn()) {
      this.videoService.getVideos().subscribe(
        (data) => {
          this.videos = data;  // Speichere die Daten, die du vom Server bekommst
        },
        (err) => {
          this.error = 'Fehler beim Laden der Videos';  // Fehlerbehandlung
        }
      );
    } else {
      this.error = 'Nicht autorisiert. Bitte logge dich ein.';  // Wenn nicht eingeloggt, Fehler ausgeben
    }
  }
}
