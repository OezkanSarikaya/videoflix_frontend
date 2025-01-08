import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './videoplayer.component.html',
  styleUrl: './videoplayer.component.scss'
})
export class VideoplayerComponent implements AfterViewInit {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;

  seekbarValue: number = 0;
  videoDuration: string = '00:00';

    // Wird aufgerufen, wenn die Komponente geladen ist
    ngAfterViewInit(): void {
      const video = this.videoPlayer.nativeElement;
  
      // Event-Listener hinzufügen, um die Gesamtlänge des Videos anzuzeigen
      video.addEventListener('loadedmetadata', () => {
        this.videoDuration = this.formatTime(video.duration);
      });
    }

  // @ViewChild('videoPlayer') videoPlayer?: ElementRef;

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
