import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service'; // Der Service für das Abrufen der Videos
import { AuthService } from '../../app/services/auth.service'; // Dein AuthService
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-video-offer',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterLink, CommonModule],
  templateUrl: './video-offer.component.html',
  styleUrl: './video-offer.component.scss',
})
export class VideoOfferComponent implements OnInit {
  videos: any[] = [];
  activeThumbnailId: number | null = null;
  error: string | null = null;
  trailerId: number = 42; // autodetect this number!!!
  trailerTitle: string = 'Breakout';
  trailerDescription: string =
    'In a high-security prison, a wrongly convicted man formulates a meticulous plan to break out and prove his innocence. He must navigate a web of alliances and betrayals to reclaim his freedom and expose the truth.';
  trailerVideoUrl: string = '/media/videos/breakout-with-sound_720p.mp4';
  videosWithProgress: any[] = [];

  @ViewChild('trailer') trailerVideoElement!: ElementRef<HTMLVideoElement>;

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  openVideoPlayer(videoId: string): void {
    // Navigiere zur Video-Player-Seite und übergebe die Video-ID
    // console.log(videoId);
    

    this.router.navigate(['/videoplayer/', videoId]);
  }

  ngOnInit(): void {
    this.loadVideos();
    this.loadVideosWithProgress();
  }

  setActiveThumbnail(id: number): void {
    this.activeThumbnailId = id;
  }
  
  handleKeydown(event: KeyboardEvent): void {
    const currentThumbnail = event.target as HTMLElement;
    const parentDiv = currentThumbnail.parentElement;
  
    let nextElement: HTMLElement | null = null;
  
    if (event.key === 'ArrowRight') {
      nextElement = parentDiv?.nextElementSibling?.querySelector('img') as HTMLElement;
    } else if (event.key === 'ArrowLeft') {
      nextElement = parentDiv?.previousElementSibling?.querySelector('img') as HTMLElement;
    }
  
    if (nextElement) {
      nextElement.focus(); // Setzt den Fokus auf das nächste Thumbnail
      const movieId = nextElement.getAttribute('data-movie-id');
      this.setActiveThumbnail(Number(movieId)); 
      this.onVideoClick(Number(movieId)); 
    }
  }

  loadVideosWithProgress(): void {
    this.videoService.getVideosWithProgress().subscribe(
      (videos) => {
        this.videosWithProgress = videos;
        // console.log('Videos with progress loaded:', this.videosWithProgress);
      },
      (error) => {
        console.error('Error loading videos with progress:', error);
      }
    );
  }

  modifyVideoUrl(originalUrl: string, suffix: string): string {
    const lastDotIndex = originalUrl.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return originalUrl; // Falls keine Endung gefunden wurde
    }

    const fileName = originalUrl.slice(0, lastDotIndex); // Dateiname ohne Endung
    const extension = originalUrl.slice(lastDotIndex); // Endung (z. B. ".mp4")

    return `${fileName}${suffix}${extension}`;
  }

  onVideoClick(videoId: number): void {
    const movie = this.videos
      .flatMap((video) => video.videos)
      .find((v) => v.id === videoId);

    if (movie) {
      this.trailerTitle = movie.title;
      this.trailerId = movie.id;
      this.trailerDescription = movie.description;

      const originalUrl = movie.video_file;
      const modifiedUrl = this.modifyVideoUrl(originalUrl, '_720p');

      this.trailerVideoUrl = modifiedUrl;

      setTimeout(() => {
        this.trailerVideoElement.nativeElement.load();
      }, 0);
    }
  }

  loadVideos(): void {
    if (this.authService.isLoggedIn()) {
      this.videoService.getVideos().subscribe(
        (data) => {
          this.videos = data; // Speichere die Daten, die du vom Server bekommst
        },
        (err) => {
          this.error = 'Fehler beim Laden der Videos'; // Fehlerbehandlung
        }
      );
    } else {
      this.error = 'Nicht autorisiert. Bitte logge dich ein.'; // Wenn nicht eingeloggt, Fehler ausgeben
    }
  }
}
