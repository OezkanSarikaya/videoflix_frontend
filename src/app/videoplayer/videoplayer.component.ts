import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service';
import { VideoProgressService } from '../../app/services/videos/video-progress.service';
import { CommonModule } from '@angular/common';
import { ToastService } from './../services/toast/toast.service';
import { HeaderComponent } from '../shared/header/header.component';
import { environment } from '../environment/environment';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HeaderComponent],
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements AfterViewInit, OnInit, OnDestroy {
  private onLoadedMetadata: (() => void) | null = null;
  private isNetworkTestDone = false; // ✅ Flag für Netzwerktest
  apiUrl = environment.apiUrl;
  videoId: string | null = null;
  videoData: any = null;
  toastResponse: boolean = false;
  isMuted: boolean = false;
  isResolutionPopupOpen: boolean = false;
  selectedResolution: string = 'auto';
  isUserSelectedResolution: boolean = false;
  newFile: string = '';
  speedMbps: number = 0; // Netzwerkgeschwindigkeit in Mbit/s
  testCount: number = 0;
  resolution = '720p';
  foundProgress: boolean | any = false;
  bufferedTime: number = 0;
  bufferedPercent: number = 0;
  isProgressChecked = false;
  hasDismissedProgressToast: boolean = false;
  private maxTests: number = 5;
  private intervalId: any; // Referenz für das Interval

  @ViewChild('target', { static: false }) target!: ElementRef<HTMLVideoElement>;
  @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;
  videoLoaded = false;

  seekbarValue: number = 0;
  videoDuration: string = '00:00';
  currentTime: number = 0;
  myPlayer: any = null;
  resizeListener!: () => void;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private progressService: VideoProgressService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
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

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.videoId = params.get('videoId');
      if (this.videoId) {
        await this.loadVideoData(this.videoId); // Warten auf Daten
 

        // SetTimeout, um sicherzugehen, dass Angular das Video-Element gerendert hat
        setTimeout(async () => {
          if (this.target) {
            console.log('🎥 Video-Element gefunden!');
            // this.initializeVideoPlayer();
            const video = this.target.nativeElement;

            // 🎯 Abgespielten Bereich flüssig updaten
            video.addEventListener('timeupdate', () => {
              this.currentTime = video.currentTime;
              this.updateBufferedProgress();
            });

            video.addEventListener('progress', () => {
              this.bufferedTime = this.getBufferedTime();
              this.updateBufferedProgress();
            });

            video.addEventListener('loadedmetadata', async () => {
              console.log('✅ Metadaten geladen!');
              console.log('📌 Dauer des Videos:', video.duration);
              // console.log('savedProgress: ' +savedProgress);

              // Jetzt ist die Dauer verfügbar
              this.videoDuration = this.formatTime(video.duration);
              this.seekbarValue = 0;

              const savedProgress = await this.checkVideoProgress(
                this.videoId as string
              );

              if (savedProgress > 0 && !this.hasDismissedProgressToast) {
                // 🟠 3. Benutzer fragen, ob er fortsetzen möchte
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
                        video.currentTime = savedProgress;
                        this.seekbarValue = savedProgress;
                        this.isProgressChecked = true;
                      } else {
                        this.hasDismissedProgressToast = true;
                      }
                    },
                    error: (err) =>
                      console.error('Fehler bei Toast-Antwort:', err),
                  });
              }

          
            });

            // video.load(); // Lade das Video neu, falls nötig

            // this.videoDuration = this.formatTime(video.duration);
          } else {
            console.error('❌ target ist immer noch undefined!');
          }
        });
      }
    });

    // Bildschirmgröße überwachen (aber keine neuen Netzwerk-Tests starten!)
    this.resizeListener = () => {
      this.cdr.detectChanges();
      if (!this.isUserSelectedResolution) {
        this.determineOptimalResolution();
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    this.saveProgress();
    window.removeEventListener(
      'beforeunload',
      this.saveProgressBeforeUnload.bind(this)
    );

    this.determineOptimalResolution();

    window.removeEventListener('resize', this.resizeListener);
    clearInterval(this.intervalId);

    if (this.target?.nativeElement) {
      const video = this.target.nativeElement;

      // 🛑 Falls Video noch läuft → Pausieren
      if (!video.paused) {
        video.pause();
      }

      // 🚀 Video-Quelle entfernen, um das Laden komplett zu stoppen
      video.src = '';
      video.load(); // Browser zwingt ein Neuladen der Video-Elemente
    }
  }

  getBufferedTime(): number {
    if (!this.target) return 0;

    const video = this.target.nativeElement;
    if (video.buffered.length > 0) {
      // console.log(video.buffered.length);

      return video.buffered.end(video.buffered.length - 1); // Letzter gepufferter Bereich
    }
    return 0;
  }

  determineOptimalResolution(): void {
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
        const currentTime = video ? video.currentTime : 0;

        this.resolution = newResolution;
        this.selectedResolution = newResolution;

        console.log(
          `📺 Neue Auflösung: ${this.resolution} (Bildschirm: ${screenWidth}px)`
        );

        this.toastService.showToast(
          `Die Videoauflösung wurde automatisch auf ${this.resolution} optimiert!`,
          false
        );
        this.cdr.detectChanges();
        // console.log(this.resolution, this.speedMbps);

        this.setResolution(this.resolution, this.currentTime);
      }

      // this.setResolution(this.resolution, this.currentTime);
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

      console.log('✅ Video geladen:', data.video_file);

      this.videoData = data;
    } catch (error) {
      console.error('❌ Fehler beim Laden des Videos:', error);
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
            () => console.log('Progress saved successfully'),
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
    // console.log('updateSeekbar');
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
    if (!this.target || !this.target.nativeElement) return;
    const video = this.target.nativeElement;

    if (!document.fullscreenElement) {
      video.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  toggleMute(): void {
    if (!this.target || !this.target.nativeElement) return;
    const video = this.target.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  toggleResolutionPopup(): void {
    this.isResolutionPopupOpen = !this.isResolutionPopupOpen;
  }

  userSelectedResolution(resolution: string): void {
    // this.selectedResolution = 'auto';
    this.isUserSelectedResolution = true;
    this.setResolution(resolution);
  }

  setResolution(resolution: string, resumeTime: number = 0): void {
    console.log('setResolution: ' + resumeTime);

    if (!this.target) return;
    this.selectedResolution = resolution;

    const video = this.target.nativeElement;

    // 🟢 1. Speichere aktuelle Zeit
    const currentTime = video.currentTime;
    console.log(`⏳ Speichere Position: ${currentTime} Sekunden`);

    // 🟡 2. Ändere die Video-URL zur neuen Auflösung
    const baseUrl = this.videoData.video_file.replace(
      /_(120p|360p|720p|1080p)\.mp4$/,
      ''
    );
    const newSrc = `${baseUrl}_${resolution}.mp4`;

    // const newUrl = `${this.apiUrl}${baseUrl}_${resolution}.mp4`;

    this.videoData.video_file = newSrc;
    console.log(`🎥 Neue Auflösung: ${resolution}, neue URL: ${newSrc}`);

    // 🟠 3. Warte, bis Metadaten geladen sind, dann setze `currentTime`
    // video.pause();

    video.src = this.apiUrl + newSrc;
    video.load(); // Lade das neue Video
    // video.paused ? video.play() : video.pause();
    video.addEventListener(
      'loadedmetadata',
      () => {
        console.log(
          `✅ Metadaten geladen, Setze Position: ${currentTime} Sekunden`
        );
        setTimeout(() => {
          if (resumeTime > 0) {
            video.currentTime = resumeTime;
          } else {
            video.currentTime = currentTime;
          }
          // video.play();
          video.paused ? video.play() : video.pause();
        }, 100);
      },
      { once: true }
    ); // 🔄 Event-Listener wird nur einmal ausgeführt
  }
}
