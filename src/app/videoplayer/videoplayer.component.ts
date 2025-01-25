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
import { VideoService } from '../../app/services/videos/video.service';
import { VideoProgressService } from '../../app/services/videos/video-progress.service';
import { CommonModule } from '@angular/common';
import { ToastService } from './../services/toast/toast.service';
import { HeaderComponent } from '../shared/header/header.component';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HeaderComponent],
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements AfterViewInit, OnInit, OnDestroy {
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
  private maxTests: number = 5;
  private intervalId: any; // Referenz für das Interval

  @ViewChild('target', { static: false }) target!: ElementRef<HTMLVideoElement>;
  @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;

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
    this.route.paramMap.subscribe((params) => {
      this.videoId = params.get('videoId');
      if (this.videoId) {
        this.loadVideoData(this.videoId);
        this.checkVideoProgress(this.videoId);
      }
    });

    window.addEventListener(
      'beforeunload',
      this.saveProgressBeforeUnload.bind(this)
    );
  }

  ngAfterViewInit(): void {
    this.startNetworkTest();
    this.determineOptimalResolution();

    // Bildschirmgröße überwachen (aber keine neuen Netzwerk-Tests starten!)
    this.resizeListener = () => {
      this.cdr.detectChanges();
      if (!this.isUserSelectedResolution) {
      this.determineOptimalResolution();
      }
    };
    window.addEventListener('resize', this.resizeListener);

    if (this.target) {
      const video = this.target.nativeElement;

      video.addEventListener('loadedmetadata', () => {
        this.videoDuration = this.formatTime(video.duration);
        this.currentTime = Math.floor(video.currentTime);
      });

      video.addEventListener('timeupdate', () => {
        this.currentTime = Math.floor(video.currentTime);

        this.videoDuration = this.formatTime(video.duration);
        this.updateSeekbar();
      });
    }
  }

  ngOnDestroy(): void {
    this.saveProgress();
    window.removeEventListener(
      'beforeunload',
      this.saveProgressBeforeUnload.bind(this)
    );

    if (this.target?.nativeElement && !this.target.nativeElement.paused) {
      this.target.nativeElement.pause();
    }

    this.determineOptimalResolution();

    window.removeEventListener('resize', this.resizeListener);
    clearInterval(this.intervalId);
  }

  measureNetworkSpeed(): void {
    const testUrl = `${this.apiUrl}/media/videoflix-screenshot.PNG?nocache=${Date.now()}`;
    const startTime = performance.now();
    
    fetch(testUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) throw new Error('Testdatei nicht gefunden');
        return response.headers.get('content-length');
      })
      .then(size => {
        if (!size) throw new Error('Keine Dateigröße verfügbar');
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // Zeit in Sekunden
        const fileSizeInBits = parseInt(size) * 8;
        this.speedMbps = fileSizeInBits / (duration * 1_000_000);
        this.testCount++;
        console.log(`🔹 Messung #${this.testCount}: ${this.speedMbps.toFixed(2)} Mbit/s`);
        this.cdr.detectChanges();
      })
      .catch(error => console.error('Netzwerkgeschwindigkeit konnte nicht gemessen werden:', error));
  }

  startNetworkTest(): void {
    this.measureNetworkSpeed();
    this.intervalId = setInterval(() => {
      if (this.testCount >= this.maxTests-1) {
        clearInterval(this.intervalId);
        this.determineOptimalResolution(); 
        return;
      }
      this.measureNetworkSpeed();
    }, 500);
  }

  determineOptimalResolution(): void {
    this.isUserSelectedResolution = false;
    

    setTimeout(() => {
        const screenWidth = window.innerWidth;
        let newResolution = '720p';

        if (this.speedMbps > 20 && screenWidth >= 1280) {
          newResolution  = '1080p';
        } else if (this.speedMbps > 10 && screenWidth >= 1024) {
          newResolution  = '720p';
        } else if (this.speedMbps > 5 && screenWidth >= 480) {
          newResolution  = '360p';
        } else {
          newResolution  = '120p';
        }

        // console.log(
        //     `📺 Neue Auflösung: ${this.resolution} (Netzwerk: ${this.speedMbps.toFixed(2)} Mbit/s, Bildschirm: ${screenWidth}px)`
        // );

        if (this.resolution  !== newResolution ) {
          this.resolution = newResolution;
          this.selectedResolution = newResolution;
          console.log(
            `📺 Neue Auflösung: ${
              this.resolution
            } (Netzwerk: ${this.speedMbps.toFixed(
              2
            )} Mbit/s, Bildschirm: ${screenWidth}px)`
          );

          this.toastService.showToast(
            `Die Videoauflösung wurde automatisch auf ${this.resolution} optimiert!`,
            false
          );
          this.cdr.detectChanges();
          this.setResolution(this.resolution);

        }

        

        // 💡 Stelle sicher, dass die Auflösung direkt gesetzt wird
        this.setResolution(this.resolution);
    }, 0);
}


  loadVideoData(id: string): void {
    this.videoService.getVideoById(id).subscribe(
      (data) => {
        // Standardmäßig 720p hinzufügen, falls kein Suffix existiert
        if (!data.video_file.match(/_(120p|360p|720p|1080p)\.mp4$/)) {
          const filename = data.video_file.replace('.mp4', '_720p.mp4');
          data.video_file = filename;
        }
        console.log('loadVideoData'+data.video_file);

        this.videoData = data;
        this.determineOptimalResolution();
      },
      (error) => {
        console.error('Error loading video data:', error);
      }
    );
  }

  checkVideoProgress(videoId: number | string): void {
    const videoIdNumber =
      typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;

    this.progressService.getProgress(videoIdNumber).subscribe((res) => {
      if (res.progress > 0 && this.target) {
        const video = this.target.nativeElement;

        // Warten, bis die Metadaten geladen sind
        video.addEventListener('loadedmetadata', () => {
          // console.log('Metadaten geladen:', video.duration);

          this.videoDuration = this.formatTime(video.duration);
          this.currentTime = video.currentTime;

          // Jetzt den Toast anzeigen
          this.toastService
            .showToast(
              `Möchten Sie das Video an der letzten Stelle bei ${res.progress.toFixed(
                0
              )} Sekunden fortsetzen?`,
              true
            )
            .subscribe({
              next: (response: boolean) => {
                this.toastResponse = response;
                // console.log('Toast Response:', response);

                if (this.toastResponse) {
                  video.currentTime = res.progress;
                }
              },
              error: (err) => {
                console.error('Error handling toast response:', err);
              },
            });
        });

        // Video laden, um sicherzustellen, dass die Metadaten verfügbar sind
        video.load();
      }
    });
  }

  saveProgressBeforeUnload(): void {
    if (this.target && this.target.nativeElement && this.videoId) {
      const video = this.target.nativeElement;
      const progress = video.currentTime;
      this.progressService
        .saveProgress(Number(this.videoId), progress)
        .subscribe(
          () => console.log('Progress saved before unload'),
          (error) => console.error('Error saving progress:', error)
        );
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

  setResolution(resolution: string): void {
    if (!this.videoData || !this.videoData.video_file || !this.target) return;

    const video = this.target.nativeElement;
    const currentTime = video.currentTime; // Speichere aktuelle Zeit
    // console.log(currentTime);

    const isPlaying = !video.paused; // Speichere, ob das Video gerade läuft

    // this.isUserSelectedResolution = true;
    // if (resolution == 'auto') {
    //   this.selectedResolution = 'auto';
    //   this.isUserSelectedResolution = false;
    // }

    // let newFile: string;
    if (this.videoData.video_file.match(/_(120p|360p|720p|1080p)\.mp4$/)) {
      // Falls bereits eine Auflösung im Dateinamen existiert, ersetze sie
      this.newFile = this.videoData.video_file.replace(
        /_(120p|360p|720p|1080p)\.mp4$/,
        `_${resolution}.mp4`
      );
    } else {
      // Falls keine Auflösung existiert (z.B. `dateiname.mp4`), hänge die neue Auflösung an
      this.newFile = this.videoData.video_file.replace('.mp4', `.mp4`);
    }
    // if (resolution == 'auto') {
    //   this.newFile = this.videoData.video_file;
    // }
    const newSrc = `${this.apiUrl}${this.newFile}`;
    // console.log('newSrc: ' + newSrc);

    // 🔹 Prüfen, ob die Datei existiert
    fetch(newSrc, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          console.log(`✅ Videoauflösung verfügbar: ${newSrc}`);

          this.selectedResolution = resolution;
          // console.log('fetch currentTime: ' + currentTime);
          // video.currentTime = currentTime;
          this.changeVideoSource(video, newSrc, currentTime, isPlaying);
        } else {
          throw new Error(`⚠️ Videoauflösung nicht gefunden: ${newSrc}`);
        }
      })
      .catch((error) => {
        console.warn(error.message);
        console.warn('🔄 Versuche eine andere verfügbare Auflösung...');

        // Liste der möglichen Auflösungen in absteigender Reihenfolge
        const resolutions = ['1080p', '720p', '360p', '120p'];
        const fallbackRes = resolutions.find((res) =>
          this.videoData.video_file.includes(`_${res}.mp4`)
        );

        let fallbackFile = this.videoData.video_file; // Standardmäßig Hauptdatei

        if (fallbackRes) {
          fallbackFile = this.videoData.video_file.replace(
            /_(120p|360p|720p|1080p)\.mp4$/,
            `_${fallbackRes}.mp4`
          );
        }

        const fallbackSrc = `${this.apiUrl}${fallbackFile}`;
        console.log(`🔄 Lade stattdessen: ${fallbackSrc}`);
        // this.selectedResolution = newSrc;
        // video.currentTime = currentTime;
        this.changeVideoSource(video, fallbackSrc, currentTime, isPlaying);
      });
  }

  // 🔹 Hilfsfunktion zum Wechseln der Videoquelle
  changeVideoSource(
    video: HTMLVideoElement,
    newSrc: string,
    currentTime: number,
    isPlaying: boolean
  ) {
    video.src = newSrc;
    video.load();

    const setTime = () => {
      if (video.readyState >= 2) {
        // Prüft, ob genug Daten geladen wurden
        video.currentTime = currentTime;
        console.log('setTime: ', currentTime, video.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      // console.log('loadedmetadata: ' + currentTime, video.currentTime);
      setTime();
      video.addEventListener('canplay', onCanPlay);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };

    const onCanPlay = () => {
      // console.log('canplay: ' + currentTime, video.currentTime);
      setTime();
      video.addEventListener('seeked', onSeeked);
      video.removeEventListener('canplay', onCanPlay);
    };

    const onSeeked = () => {
      // console.log('seeked: ' + currentTime, video.currentTime);
      if (isPlaying) video.play();
      video.removeEventListener('seeked', onSeeked);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);

    // 🔹 Falls das nicht reicht, versuche nach 100ms erneut
    setTimeout(() => {
      // console.log('setTimeout fallback: ' + currentTime, video.currentTime);
      if (video.currentTime === 0) {
        setTime();
      }
    }, 100);

    // 🔹 Letzter Trick: Play/Pause, falls nichts hilft
    // setTimeout(() => {
    //   if (video.currentTime === 0) {
    //     // console.log('Final attempt: Play/Pause Trick');
    //     video
    //       .play()
    //       .then(() => {
    //         video.pause();
    //         video.currentTime = currentTime;
    //         if (isPlaying) video.play();
    //       })
    //       .catch((err) => console.warn('Play Trick failed:', err));
    //   }
    // }, 500);
  }
}
