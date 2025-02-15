import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service'; // Der Service für das Abrufen der Videos
import { AuthService } from '../../app/services/auth.service'; // Dein AuthService
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-video-offer',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterLink, CommonModule],
  templateUrl: './video-offer.component.html',
  styleUrl: './video-offer.component.scss',
})
export class VideoOfferComponent implements OnInit, OnDestroy {
  videos: any[] = [];
  apiUrl = environment.apiUrl;
  activeThumbnailId: number | null = null;
  error: string | null = null;
  trailerId: number = 18; // autodetect this number!!!
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

  ngOnDestroy(): void {
    // Event-Listener entfernen, um Speicherlecks zu vermeiden
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    const isMobile = window.innerWidth < 600;
    const videoPreview = document.querySelector(
      '.video-preview'
    ) as HTMLElement;
    const videoContent = document.querySelector(
      '.video-content'
    ) as HTMLElement;
    const videoOverlay = document.querySelector(
      '.video-overlay'
    ) as HTMLElement;

    if (isMobile) {
      videoContent?.classList.add('hidden');
      videoPreview?.setAttribute('style', 'display: unset;');
      videoOverlay?.setAttribute('style', 'display: unset;');
    } else {
      videoContent?.classList.remove('hidden');
      videoPreview?.setAttribute('style', 'display: block;');
      videoOverlay?.setAttribute('style', 'display: flex;');
    }
  };

  closeMobileTrailer(): void {
    const isMobile = window.innerWidth < 600;
    const videoPreview = document.querySelector(
      '.video-preview'
    ) as HTMLElement;
    const videoContent = document.querySelector(
      '.video-content'
    ) as HTMLElement;
    const videoOverlay = document.querySelector(
      '.video-overlay'
    ) as HTMLElement;

    videoContent?.classList.remove('hidden');
    videoPreview?.setAttribute('style', 'display: hidden;');
    videoOverlay?.setAttribute('style', 'display: hidden;');
  }

  openVideoPlayer(videoId: string): void {
    // Navigiere zur Video-Player-Seite und übergebe die Video-ID
    this.router.navigate(['/videoplayer/', videoId]);
  }

  ngOnInit(): void {
    this.loadVideos();
    this.loadVideosWithProgress();
    window.addEventListener('resize', this.handleResize);
  }

  setActiveThumbnail(id: number): void {
    this.activeThumbnailId = id;
  }

  handleKeydown(event: KeyboardEvent): void {
    const currentThumbnail = event.target as HTMLElement;
    const parentDiv = currentThumbnail.parentElement;

    let nextElement: HTMLElement | null = null;

    if (event.key === 'ArrowRight') {
      nextElement = parentDiv?.nextElementSibling?.querySelector(
        'img'
      ) as HTMLElement;
    } else if (event.key === 'ArrowLeft') {
      nextElement = parentDiv?.previousElementSibling?.querySelector(
        'img'
      ) as HTMLElement;
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
    const isMobile = window.innerWidth < 600;
    const videoPreview = document.querySelector(
      '.video-preview'
    ) as HTMLElement;
    const videoContent = document.querySelector(
      '.video-content'
    ) as HTMLElement;

    const videoOverlay = document.querySelector(
      '.video-overlay'
    ) as HTMLElement;

    if (isMobile) {
      // Auf Smartphones (<600px)
      videoPreview?.setAttribute('style', 'display: unset;');
      videoOverlay?.setAttribute('style', 'display: unset;');
      videoContent?.classList.add('hidden');
    } else {
      // Auf Desktops (>=600px)

      videoContent?.classList.remove('hidden');
    }

    // console.log(`Video ${videoId} angeklickt.`);

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

  // loadVideos(): void {
  //   if (this.authService.isLoggedIn()) {
  //     this.videoService.getVideos().subscribe(
  //       (data) => {
  //         this.videos = data; // Speichere die Daten, die du vom Server bekommst
  //       },
  //       (err) => {
  //         this.error = 'Fehler beim Laden der Videos'; // Fehlerbehandlung
  //       }
  //     );
  //   } else {
  //     this.error = 'Nicht autorisiert. Bitte logge dich ein.'; // Wenn nicht eingeloggt, Fehler ausgeben
  //   }
  // }

  // loadVideos(): void {
  //   if (this.authService.isLoggedIn()) {
  //     this.videoService.getVideos().subscribe(
  //       (data) => {
  //         this.videos = data;

  //         // Thumbnails für jedes Video laden
  //         this.videos.forEach((genre: any) => {
  //           genre.videos.forEach((movie: any) => {
  //             this.videoService
  //               .getThumbnailUrl(movie.thumbnail)
  //               .subscribe((blob) => {
  //                 const objectURL = URL.createObjectURL(blob);
  //                 movie.thumbnailUrl = objectURL; // Speichern der Blob-URL
  //               });
  //           });
  //         });
  //       },
  //       (err) => {
  //         this.error = 'Fehler beim Laden der Videos';
  //       }
  //     );
  //   } else {
  //     this.error = 'Nicht autorisiert. Bitte logge dich ein.';
  //   }
  // }

  



  loadVideos(): void {
    if (this.authService.isLoggedIn()) {
      this.videoService.getVideos().subscribe(
        async (data) => {
          console.log("Raw API Response:", data); // ✅ Check 1: Rohdaten vom Backend
          
          try {
            this.videos = await Promise.all(
              data.map(async (video: any) => {
                const videosWithThumbnails = await Promise.all(
                  video.videos.map(async (movie: any) => {
                    try {
                      const thumbnailUrl = await this.getThumbnailBlob(movie.thumbnail);
                      return { ...movie, thumbnailUrl };
                    } catch (error) {
                      console.error("Error loading thumbnail for movie:", movie, error);
                      return { ...movie, thumbnailUrl: '' }; // Setze leer, falls Fehler
                    }
                  })
                );
                return { ...video, videos: videosWithThumbnails };
              })
            );
  
            console.log("Processed Videos:", this.videos); // ✅ Check 2: Nach Verarbeitung
          } catch (error) {
            console.error("Error processing videos:", error);
          }
        },
        (err) => {
          this.error = 'Fehler beim Laden der Videos'; // Fehlerbehandlung
        }
      );
    } else {
      this.error = 'Nicht autorisiert. Bitte logge dich ein.'; // Wenn nicht eingeloggt, Fehler ausgeben
    }
  }
  

  async getThumbnailBlob(thumbnail: string): Promise<string> {
    // Entferne alle führenden Slashes von "thumbnail" (falls vorhanden)
    const cleanedThumbnail = thumbnail.replace(/^\/+/, '');
    const url = `${this.apiUrl}/${cleanedThumbnail}`;
    console.log("Fetching Thumbnail:", url); // ✅ Check 3: URL stimmt?
  
    const headers = new Headers({
      Authorization: `Bearer ${this.authService.getAccessToken()}`,
    });
  
    try {
      const response = await fetch(url, { headers });
      console.log("Fetch Response:", response); // ✅ Check 4: API Antwort?
  
      if (!response.ok) {
        console.error("Failed to fetch thumbnail", response.status);
        throw new Error("Bild konnte nicht geladen werden");
      }
  
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
      return ''; // Leerer String bei Fehler
    }
  }

  // Hilfsfunktion zur Korrektur der URL
  fixThumbnailUrl(thumbnail: string): string {
    return `${this.apiUrl}/${thumbnail.replace(/^\/+/, '')}`;
  }
}
