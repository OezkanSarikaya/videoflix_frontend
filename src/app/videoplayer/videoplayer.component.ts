import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements AfterViewInit, OnInit {
  videoId: string | null = null;
  videoData: any = null; // Hier werden die Video-Daten gespeichert

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;

  seekbarValue: number = 0;
  videoDuration: string = '00:00';

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService // Dein Service, um Video-Daten zu laden
  ) {}

  // Wird aufgerufen, wenn die Komponente geladen ist
  ngOnInit(): void {
    // Extrahiere die Video-ID aus der Route
    this.route.paramMap.subscribe((params) => {
      this.videoId = params.get('videoId');
      if (this.videoId) {
        this.loadVideoData(this.videoId); // Lade Video-Daten, wenn die ID vorhanden ist
      }
    });
  }

  // Wird aufgerufen, wenn die View (DOM) der Komponente vollständig geladen ist
  ngAfterViewInit(): void {
    if (this.videoPlayer) {
      const video = this.videoPlayer.nativeElement;

      // Event-Listener hinzufügen, um die Gesamtlänge des Videos anzuzeigen
      video.addEventListener('loadedmetadata', () => {
        this.videoDuration = this.formatTime(video.duration);
      });

      // Optionale Event-Listener für andere Funktionen
      video.addEventListener('timeupdate', () => {
        this.updateSeekbar(); // Seekbar aktualisieren, wenn die Zeit des Videos läuft
      });
    }
  }

  loadVideoData(id: string): void {
    this.videoService.getVideoById(id).subscribe(
      (data) => {
        this.videoData = data;
        // console.log('Video Data loaded:', this.videoData);
      },
      (error) => {
        console.error('Error loading video data:', error);
      }
    );
  }

  toggleVideo() {
    const video: HTMLVideoElement = this.videoPlayer?.nativeElement;
    video.paused ? video.play() : video.pause();
  }

  // Methode zum Aktualisieren der Seekbar
  updateSeekbar(): void {
    const video = this.videoPlayer.nativeElement;
    const progress = (video.currentTime / video.duration) * 100;
    this.seekbarValue = progress;
  }

  // Methode zum Aktualisieren der Videolänge
  onMetadataLoaded(): void {
    const video = this.videoPlayer.nativeElement;
    this.videoDuration = this.formatTime(video.duration);
  }

  // Methode zum Spulen des Videos
  onSeek(event: Event): void {
    const video = this.videoPlayer.nativeElement;
    const input = event.target as HTMLInputElement;
    const seekTo = (parseFloat(input.value) / 100) * video.duration;
    video.currentTime = seekTo;
  }

  // Methode zum Formatieren der Zeit (Minuten:Sekunden)
  formatTime(time: number): string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    } else {
      return `${minutes}:${this.padZero(seconds)}`;
    }
  }

  // Hilfsmethode zum Hinzufügen von führenden Nullen
  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  rewind(seconds: number): void {
    const video = this.videoPlayer.nativeElement;
    video.currentTime = Math.max(video.currentTime - seconds, 0);
  }

  forward(seconds: number): void {
    const video = this.videoPlayer.nativeElement;
    video.currentTime = Math.min(video.currentTime + seconds, video.duration);
  }

  toggleFullscreen(): void {
    const video = this.videoPlayer.nativeElement;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
