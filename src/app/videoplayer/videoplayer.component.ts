import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { VideoService } from '../services/videos/video.service';
import { VideoProgressService } from '../services/videos/video-progress.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast/toast.service';
import { environment } from '../environment/environment';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements AfterViewInit, OnInit, OnDestroy {
  volume: number = 0.5; // Standardlautstärke auf 50%
  apiUrl = environment.apiUrl;
  videoId: string | null = null;
  videoData: any = null;
  toastResponse: boolean = false;
  isMuted: boolean = false;
  isResolutionPopupOpen: boolean = false;
  selectedResolution: string = 'auto';
  isUserSelectedResolution: boolean = false;
  resolution = '720p';
  resolutions: string[] = ['120p', '360p', '720p', '1080p'];
  bufferedTime: number = 0;
  bufferedPercent: number = 0;
  isProgressChecked = false;
  isVideoDescriptionVisible = false;
  hasDismissedProgressToast: boolean = false;
  currentVideoFile: string = '';
  private intervalId: any; // Referenz für das Interval
  private isDestroyed = false;

  @ViewChild('target', { static: false }) target!: ElementRef<HTMLVideoElement>;
  @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;
  @ViewChild('container') playerContainerRef!: ElementRef;

  seekbarValue: number = 0;
  videoDuration: string = '00:00';
  currentTime: number = 0;

  resizeListener!: () => void;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private progressService: VideoProgressService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.addEventListener(
      'beforeunload',
      this.saveProgressBeforeUnload.bind(this)
    );
  }

  updateBufferedProgress(): void {
    if (!this.seekbar || !this.target) return;

    const video = this.target.nativeElement;
    this.bufferedPercent = (this.bufferedTime / video.duration) * 100;
    const playedPercent = (video.currentTime / video.duration) * 100;

    this.seekbar.nativeElement.style.background = `
        linear-gradient(to right,
          #fff ${playedPercent}%, /* Abgespielter Bereich */
          #999 ${playedPercent}%, /* Geladener Bereich */
          #999 ${this.bufferedPercent}%, /* Noch nicht geladener Bereich */
          #666 ${this.bufferedPercent}%)
    `;
  }

  toogleVideoDescription(): void {
    this.isVideoDescriptionVisible = !this.isVideoDescriptionVisible;

    if (this.isResolutionPopupOpen) {
      this.isResolutionPopupOpen = false;
    }
  }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.videoId = params.get('videoId');
      if (this.videoId) {
        await this.loadVideoData(this.videoId); // Warten auf Daten

        // SetTimeout, um sicherzugehen, dass Angular das Video-Element gerendert hat
        setTimeout(async () => {
          if (this.target) {
            const video = this.target.nativeElement;

            // 🎯 Abgespielten Bereich flüssig updaten
            video.addEventListener('timeupdate', async () => {
              this.currentTime = video.currentTime;
              const currentResolutionIndex = this.resolutions.indexOf(
                this.resolution
              );

              if (
                this.bufferedTime < this.currentTime + 3 &&
                this.currentTime + 3 < video.duration &&
                currentResolutionIndex - 1 >= 0 &&
                !this.isUserSelectedResolution
              ) {
                this.setResolution(
                  this.resolutions[currentResolutionIndex - 1],
                  this.currentTime
                );

                this.resolution = this.resolutions[currentResolutionIndex - 1];
                this.toastService.showToast(
                  `Die Videoauflösung wurde automatisch auf ${this.resolution} optimiert!`,
                  false
                );
              }

              this.updateBufferedProgress();
            });

            video.addEventListener('progress', () => {
              this.bufferedTime = this.getBufferedTime();
              this.updateBufferedProgress();
            });

            video.addEventListener('loadedmetadata', async () => {
              const savedProgress = await this.checkVideoProgress(
                this.videoId as string
              );

              this.videoDuration = this.formatTime(video.duration);

              this.seekbarValue = 0;

              if (savedProgress > 0 && !this.hasDismissedProgressToast) {
                // Benutzer fragen, ob er fortsetzen möchte

                this.toastService
                  .showToast(
                    `Möchten Sie das Video bei ${savedProgress.toFixed(
                      0
                    )} Sekunden fortsetzen?`,
                    true
                  )
                  .subscribe({
                    next: (response: boolean) => {
                      if (response) {
                        this.isProgressChecked = true;

                        setTimeout(() => {
                          video.currentTime = savedProgress;

                          // Warten auf das 'seeked' Event, um sicherzustellen, dass das Video den neuen Wert erreicht hat
                          video.addEventListener('seeked', () => {
                            this.updateSeekbar();
                          });
                        }, 100); // Versuche
                      } else {
                        this.hasDismissedProgressToast = true;
                        this.isProgressChecked = true;
                      }
                    },
                    error: (err) =>
                      console.error('Fehler bei Toast-Antwort:', err),
                  });
              }
            });
          } else {
            console.error('❌ target ist immer noch undefined!');
          }
        });
      }
    });

    // Bildschirmgröße überwachen (aber keine neuen Netzwerk-Tests starten!)
    if (!this.resizeListener) {
      this.resizeListener = () => {
        this.cdr.detectChanges();

        if (!this.isUserSelectedResolution) {
          this.determineOptimalResolution();
        }
      };
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.saveProgress();

    window.removeEventListener(
      'beforeunload',
      this.saveProgressBeforeUnload.bind(this)
    );

    if (this.target && this.target.nativeElement) {
      const video = this.target.nativeElement;
      video.pause(); // Stoppt das Video
      video.currentTime = 0; // Setzt die Wiedergabe auf den Anfang
      video.src = ''; // Entfernt die Videoquelle
      video.load(); // Lädt das Video neu (ohne Quelle)
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.determineOptimalResolution();
    clearInterval(this.intervalId);

    if (this.target?.nativeElement) {
      //   console.log('destroy!');

      const video = this.target.nativeElement;

      if (video) {
        video.pause(); // Stoppt das Video
        video.currentTime = 0; // Setzt das Video zurück auf den Anfang
        // console.log('Video pausiert und zurückgesetzt');
      }

      // 🛑 1️⃣ Video pausieren (falls noch aktiv)
      video.pause();
      video.currentTime = 0; // Zurücksetzen für sicheres Stoppen

      // 🚫 2️⃣ Video-Quelle komplett entfernen
      video.removeAttribute('src');
      video.load(); // Erzwingt komplettes Entladen

      // 🔊 3️⃣ Falls das Video einen aktiven Media-Stream hat, beenden
      const mediaStream = video.srcObject as MediaStream;
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop()); // Alle Streams stoppen
        video.srcObject = null;
      }

      // ⚡ 4️⃣ Event Listener entfernen, um sicherzugehen
      video.onplay = null;
      video.onpause = null;
      video.onended = null;
      video.ontimeupdate = null;
      // video.onloadedmetadata = null;

      // 🗑️ 5️⃣ (Optional) Element aus DOM entfernen, falls nötig
      video.parentNode?.removeChild(video);
    }
  }

  getBufferedTime(): number {
    if (!this.target) return 0;

    const video = this.target.nativeElement;
    if (video.buffered.length > 0) {
      return video.buffered.end(video.buffered.length - 1); // Letzter gepufferter Bereich
    }
    return 0;
  }

  determineOptimalResolution(): void {
    if (this.isDestroyed) return;
    this.isUserSelectedResolution = false;

    setTimeout(() => {
      const screenWidth = window.innerWidth;
      let newResolution = '720p';

      if (screenWidth >= 1280) {
        newResolution = '1080p';
      } else if (screenWidth >= 1024) {
        newResolution = '720p';
      } else if (screenWidth >= 480) {
        newResolution = '360p';
      } else {
        newResolution = '120p';
      }

      if (this.resolution !== newResolution) {
        const video = this.target?.nativeElement;
        this.currentTime = video ? video.currentTime : 0;

        this.resolution = newResolution;
        this.selectedResolution = newResolution;

        this.toastService.showToast(
          `Die Videoauflösung wurde automatisch auf ${this.resolution} optimiert!`,
          false
        );
        this.cdr.detectChanges();

        this.setResolution(this.resolution, this.currentTime);
      }
    }, 0);
  }

  async loadVideoData(id: string): Promise<void> {
    try {
      const data = await lastValueFrom(this.videoService.getVideoById(id));

      // Standardmäßig 720p hinzufügen, falls kein Suffix existiert
      if (!data.video_file.match(/_(120p|360p|720p|1080p)\.mp4$/)) {
        const filename = data.video_file.replace('.mp4', '_720p.mp4');
        data.video_file = filename;
      }

      this.currentVideoFile = data.video_file;

      data.video_file = await this.videoService.getVideoBlob(data.video_file); //neu

      this.videoData = data;
    } catch (error) {
      console.error('loadVideoData: ❌ Fehler beim Laden des Videos:', error);
    }
  }

  checkVideoProgress(videoId: number | string): Promise<number> {
    return new Promise((resolve, reject) => {
      const videoIdNumber =
        typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;

      if (this.isProgressChecked) return resolve(0); // Schon gesetzt → 0 zurückgeben

      this.progressService.getProgress(videoIdNumber).subscribe(
        (res) => {
          if (res.progress > 0) {
            resolve(res.progress); // ✅ Nur den Wert zurückgeben
          } else {
            resolve(0); // Falls kein Fortschritt → 0 zurückgeben
          }
        },
        (error) => {
          console.error('Fehler beim Laden des Fortschritts:', error);
          reject(error);
        }
      );
    });
  }

  saveProgressBeforeUnload(): void {
    if (this.target && this.target.nativeElement && this.videoId) {
      const video = this.target.nativeElement;
      video.pause();
      const progress = video.currentTime;
      // this.isProgressChecked = false;
      if (progress > 0) {
        this.progressService
          .saveProgress(Number(this.videoId), progress)
          .subscribe(
            () => console.log('Progress saved before unload'),
            (error) => console.error('Error saving progress:', error)
          );
      }
    }
  }

  saveProgress(): void {
    if (this.target && this.videoId) {
      const video = this.target.nativeElement;
      const progress = video.currentTime;

      if (progress > 0) {
        this.progressService
          .saveProgress(parseInt(this.videoId), progress)
          .subscribe(
            () => {},
            // () => console.log('Progress saved successfully'),
            (error) => console.error('Error saving progress:', error)
          );
      }
    }
  }

  toggleVideo(): void {
    if (!this.target || !this.target.nativeElement) return;
    const video = this.target.nativeElement;
    video.paused ? video.play() : video.pause();
    this.isResolutionPopupOpen = false;
  }

  rewind(seconds: number): void {
    if (this.target) {
      // console.log('rewind' +this.target);
      const video = this.target.nativeElement;
      video.currentTime = Math.max(video.currentTime - seconds, 0);
      this.currentTime = video.currentTime;
      this.videoDuration = this.formatTime(video.duration);
    }
  }

  forward(seconds: number): void {
    if (this.target) {
      const video = this.target.nativeElement;
      video.currentTime = Math.min(video.currentTime + seconds, video.duration);
      this.currentTime = video.currentTime;
      this.videoDuration = this.formatTime(video.duration);
    }
  }

  updateSeekbar(): void {
    if (this.target) {
      const video = this.target.nativeElement;
      this.seekbarValue = (video.currentTime / video.duration) * 100;
      this.videoDuration = this.formatTime(video.duration);
      this.currentTime = video.currentTime;
    }
  }

  onSeek(event: Event): void {
    if (this.target) {
      const video = this.target.nativeElement;
      const input = event.target as HTMLInputElement;
      const seekTo = (parseFloat(input.value) / 100) * video.duration;
      video.currentTime = seekTo;
      this.currentTime = video.currentTime;
      this.videoDuration = this.formatTime(video.duration);
    }
  }

  updateVolume(target: HTMLVideoElement): void {
    target.volume = this.volume; // Setze die Lautstärke des Video-Players
    const video = this.target.nativeElement;
    if (this.volume == 0) {
      this.isMuted = true;
      video.muted = true;
    } else {
      video.muted = false;
      this.isMuted = false;
    }
  }

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

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  toggleFullscreen(): void {
    const playerContainer = this.playerContainerRef.nativeElement;

    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  toggleMute(): void {
    if (!this.target || !this.target.nativeElement) return;
    const video = this.target.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
    if (video.muted) {
      this.volume = 0;
    } else {
      this.volume = 0.5;
    }
  }

  toggleResolutionPopup(): void {
    this.isResolutionPopupOpen = !this.isResolutionPopupOpen;
    this.isVideoDescriptionVisible = false;
  }

  userSelectedResolution(resolution: string): void {
    this.isUserSelectedResolution = true;
    this.setResolution(resolution);
  }

  async setResolution(
    resolution: string,
    resumeTime: number = 0
  ): Promise<void> {
    if (!this.target) return;
    this.selectedResolution = resolution;

    const video = this.target.nativeElement;

    // Speichere aktuelle Zeit
    const currentTime = video.currentTime;

    const baseUrl = this.currentVideoFile.replace(
      /_(120p|360p|720p|1080p)\.mp4$/,
      ''
    );
    let newSrc = `${baseUrl}_${resolution}.mp4`;

    newSrc = await this.videoService.getVideoBlob(newSrc);
    this.videoData.video_file = newSrc;

    // Warte, bis Metadaten geladen sind, dann setze `currentTime`
    video.src = this.apiUrl + newSrc;
    video.src = newSrc;
    video.load(); // Lade das neue Video

    video.addEventListener(
      'loadedmetadata',
      () => {
        setTimeout(() => {
          if (resumeTime > 0) {
            video.currentTime = resumeTime;
          } else {
            video.currentTime = currentTime;
          }
          video.play();
        }, 100);
      },
      { once: true }
    ); // 🔄 Event-Listener wird nur einmal ausgeführt
  }
}
