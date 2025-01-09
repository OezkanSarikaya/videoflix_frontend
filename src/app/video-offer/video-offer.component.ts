import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { RouterLink } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service';  // Der Service für das Abrufen der Videos
import { AuthService } from '../../app/services/auth.service';  // Dein AuthService
import { CommonModule } from '@angular/common';


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

  constructor(private videoService: VideoService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadVideos();
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
