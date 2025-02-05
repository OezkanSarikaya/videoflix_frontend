import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { VideoService } from '../services/videos/video.service';
import { VideoProgressService } from '../services/videos/video-progress.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast/toast.service';
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
  targetProgress: number = 0;
  resolution = '720p';
  resolutions: string[] = ['120p', '360p', '720p', '1080p'];
  foundProgress: boolean | any = false;
  bufferedTime: number = 0;
  bufferedPercent: number = 0;
  isProgressChecked = false;
  isVideoDescriptionVisible = false;
  hasDismissedProgressToast: boolean = false;

  private intervalId: any; // Referenz für das Interval
  private isDestroyed = false;

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

  // waitForLoadedMetadata(video: HTMLVideoElement): Promise<void> {
  //   return new Promise((resolve) => {
  //     video.addEventListener('loadedmetadata', () => {
  //       resolve();
  //     }, { once: true });
  //   });
  // }

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
            video.addEventListener('timeupdate', async () => {
              // if (
              //   this.targetProgress &&
              //   !this.isProgressChecked &&
              //   video.readyState >= 2
              // ) {
              //   console.log('⏩ Versuche zu springen:', this.targetProgress);
              //   video.currentTime = this.targetProgress;

              //   video.addEventListener(
              //     'seeked',
              //     () => {
              //       console.log('✅ Seek erfolgreich:', video.currentTime);
              //     },
              //     { once: true }
              //   );

              //   this.seekbarValue = this.targetProgress;
              //   this.isProgressChecked = true; // Nur einmal ausführen
              // }

              this.currentTime = video.currentTime;

              const currentResolutionIndex = this.resolutions.indexOf(
                this.resolution
              );

              if (
                this.bufferedTime < this.currentTime + 3 &&
                this.currentTime + 3 < video.duration &&
                currentResolutionIndex - 1 >= 0
              ) {
                console.log(
                  'Auflösung verringert auf ' +
                    this.resolutions[currentResolutionIndex - 1]
                );

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

              // else {
              //   if (currentResolutionIndex + 1 <= 3) {
              //     this.setResolution(
              //       this.resolutions[currentResolutionIndex + 1],
              //       this.currentTime
              //     );
              //     this.resolution = this.resolutions[currentResolutionIndex - 1];
              //     this.toastService.showToast(
              //       `Die Videoauflösung wurde automatisch auf ${this.resolution} optimiert!`,
              //       false
              //     );
              //   }

              // }

              this.updateBufferedProgress();

              // console.log('⏱️ timeupdate:', video.currentTime);
            });

            video.addEventListener('progress', () => {
              this.bufferedTime = this.getBufferedTime();
              this.updateBufferedProgress();
            });

            // [
            //   'loadstart',
            //   'loadedmetadata',
            //   'timeupdate',
            //   'seeking',
            //   'seeked',
            //   'pause',
            //   'play',
            //   'ended',
            //   'ratechange',
            // ].forEach((eventName) => {
            //   video.addEventListener(eventName, (e) => {
            //     console.log(
            //       `📢 Event: ${eventName}, ⏱️ currentTime: ${video.currentTime}`
            //     );
            //   });
            // });

            video.addEventListener('loadedmetadata', async () => {
              const savedProgress = await this.checkVideoProgress(
                this.videoId as string
              );

              this.videoDuration = this.formatTime(video.duration);

              this.seekbarValue = 0;

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
                        // this.targetProgress = savedProgress; // Zielzeit speichern
                        this.isProgressChecked = true;
                        console.log(video.duration);

                        setTimeout(() => {
                          video.currentTime = savedProgress;
                          console.log(
                            '⏱️ currentTime gesetzt:',
                            video.currentTime
                          );

                          // Warten auf das 'seeking' Event, um sicherzustellen, dass das Video die Zeit springt
                          video.addEventListener('seeking', () => {
                            console.log(
                              '⏳ Video versucht zu springen zu:',
                              video.currentTime
                            );
                          });

                          // Warten auf das 'seeked' Event, um sicherzustellen, dass das Video den neuen Wert erreicht hat
                          video.addEventListener('seeked', () => {
                            console.log(
                              '✅ Seek abgeschlossen bei:',
                              video.currentTime
                            );
                            this.updateSeekbar();
                          });
                        }, 100); // Versuche

                        // console.log(
                        //   'currentTime: ',
                        //   video.currentTime,
                        //   savedProgress
                        // );

                        // console.log(
                        //   'Toast bestätigt: ',
                        //   this.targetProgress,
                        //   this.isProgressChecked
                        // );
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

    window.removeEventListener('resize', this.resizeListener);
    this.determineOptimalResolution();
    clearInterval(this.intervalId);

    if (this.target?.nativeElement) {
      console.log('destroy!');

      const video = this.target.nativeElement;

      if (video) {
        video.pause(); // Stoppt das Video
        video.currentTime = 0; // Setzt das Video zurück auf den Anfang
        console.log('Video pausiert und zurückgesetzt');
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
      video.onloadedmetadata = null;

      // 🗑️ 5️⃣ (Optional) Element aus DOM entfernen, falls nötig
      video.parentNode?.removeChild(video);
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
    this.isVideoDescriptionVisible = false;
  }

  userSelectedResolution(resolution: string): void {
    this.isUserSelectedResolution = true;
    this.setResolution(resolution);
  }

  setResolution(resolution: string, resumeTime: number = 0): void {
    // console.log('setResolution: ' + resumeTime);

    if (!this.target) return;
    this.selectedResolution = resolution;
    // this.resolution = resolution;

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
          video.play();
          // video.paused ? video.play() : video.pause();
        }, 100);
      },
      { once: true }
    ); // 🔄 Event-Listener wird nur einmal ausgeführt
  }
}
