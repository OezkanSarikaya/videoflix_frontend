// import {
//   Component,
//   ElementRef,
//   ViewChild,
//   AfterViewInit,
//   AfterViewChecked,
//   OnInit,
//   OnDestroy,
//   ChangeDetectorRef,
// } from '@angular/core';
// import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
// import { VideoService } from '../services/videos/video.service';
// import { VideoProgressService } from '../services/videos/video-progress.service';
// import { CommonModule } from '@angular/common';
// import { ToastService } from '../services/toast/toast.service';
// import { HeaderComponent } from '../shared/header/header.component';
// import { environment } from '../environment/environment';
// import { lastValueFrom } from 'rxjs';

// @Component({
//   selector: 'app-videoplayer',
//   standalone: true,
//   imports: [CommonModule, RouterOutlet, RouterLink, HeaderComponent],
//   templateUrl: './videoplayer.component.html',
//   styleUrls: ['./videoplayer.component.scss'],
// })
// export class VideoplayerComponent implements AfterViewInit, OnInit, OnDestroy, AfterViewChecked {

//   @ViewChild('target') target!: ElementRef<HTMLVideoElement>;
//   @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;
//   // private onLoadedMetadata: (() => void) | null = null;
//   apiUrl = environment.apiUrl;
//   videoId: string | null = null;
//   public videoData: any = null;
//   toastResponse: boolean = false;
//   isMuted: boolean = false;
//   isResolutionPopupOpen: boolean = false;
//   selectedResolution: string = 'auto';
//   isUserSelectedResolution: boolean = false;
//   newFile: string = '';
//   speedMbps: number = 0; // Netzwerkgeschwindigkeit in Mbit/s
//   testCount: number = 0;
//   resolution = '720p';
//   resolutions: string[] = ['120p', '360p', '720p', '1080p'];
//   foundProgress: boolean | any = false;
//   bufferedTime: number = 0;
//   bufferedPercent: number = 0;
//   isProgressChecked = false;
//   isVideoDescriptionVisible = false;
//   hasDismissedProgressToast: boolean = false;
//   private isSeeked: boolean = false;
//   private intervalId: any; // Referenz für das Interval
//   private metadataLoaded: boolean = false;

  
//   videoLoaded = false;

//   seekbarValue: number = 0;
//   videoDuration: string = '00:00';
//   public currentTime: number = 0;
//   myPlayer: any = null;
//   resizeListener!: () => void;

//   constructor(
//     private route: ActivatedRoute,
//     private videoService: VideoService,
//     private progressService: VideoProgressService,
//     private toastService: ToastService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {}

//   ngAfterViewInit(): void {
   
        
//         this.route.paramMap.subscribe(async (params) => {
//           this.videoId = params.get('videoId');
//           if (this.videoId) {
//             await this.loadVideoData(this.videoId); // Warten auf Daten
       
//             setTimeout(async () => {
//               if (this.target) {
//                 this.cdr.detectChanges();
//                 this.target.nativeElement.currentTime = 5;
//                 // const video = this.target.nativeElement;
//                 // video.currentTime = 5;
//                 this.updateSeekbar();
//                 console.log('currentTime: ', this.target.nativeElement.currentTime);
//               }
//             });
//           }
//         });
      


//     // SetTimeout, um sicherzugehen, dass Angular das Video-Element gerendert hat
//     // setTimeout(async () => {
//     //   if (this.target) {
//     //     console.log('🎥 Video-Element gefunden!');
//     //     // this.initializeVideoPlayer();
//     //     const video = this.target.nativeElement;

//     //     // 🎯 Abgespielten Bereich flüssig updaten
//     //     video.addEventListener('timeupdate', () => {
//     //       this.currentTime = video.currentTime;
//     //     });

//     //     video.addEventListener('progress', () => {
//     //       this.bufferedTime = this.getBufferedTime();
//     //     });

//     //     video.addEventListener('loadedmetadata', async () => {
//     //       // const video = this.target.nativeElement;
//     //       video.currentTime = 5;
//     //       console.log(video.currentTime);

//     //       // Jetzt ist die Dauer verfügbar
//     //       this.videoDuration = this.formatTime(video.duration);
//     //       this.seekbarValue = 0;

//     //       const savedProgress = await this.checkVideoProgress(
//     //         this.videoId as string
//     //       );

//     //       if (savedProgress > 0 && !this.hasDismissedProgressToast) {
//     //         // 🟠 3. Benutzer fragen, ob er fortsetzen möchte
//     //         this.toastService
//     //           .showToast(
//     //             `Möchten Sie das Video bei ${savedProgress.toFixed(
//     //               0
//     //             )} Sekunden fortsetzen?`,
//     //             true
//     //           )
//     //           .subscribe({
//     //             next: (response: boolean) => {
//     //               if (response) {
//     //                 video.currentTime = savedProgress;
//     //                 console.log(
//     //                   'nach Toast: ',
//     //                   video.currentTime,
//     //                   savedProgress
//     //                 );

//     //                 this.seekbarValue = savedProgress;
//     //                 this.isProgressChecked = true;
//     //               } else {
//     //                 this.hasDismissedProgressToast = true;
//     //               }
//     //             },
//     //             error: (err) =>
//     //               console.error('Fehler bei Toast-Antwort:', err),
//     //           });
//     //       }
//     //     });
//     //   } else {
//     //     console.error('❌ target ist immer noch undefined!');
//     //   }
//     // });

//     //   }
//     // });
//   }

//   ngAfterViewChecked(): void {
//     // Wenn das Video-Element verfügbar ist und videoData geladen ist, dann starten wir das Laden der Quelle
//     if (this.target && this.videoData && this.target.nativeElement.src === '') {
//       this.loadVideoSource();
//     }

//     const video = this.target?.nativeElement;
//     if (video && !video.paused) {
//       video.pause();
//       video.currentTime = 0;  // Stoppt das Video, wenn es nicht pausiert wurde
//       console.log('Video pausiert und zurückgesetzt in ngAfterViewChecked');
//     }
//   }

//   public onLoadedMetadata(): void {
//     const video = this.target.nativeElement;
//     console.log('📥 Metadaten geladen:', video.duration);
  
//     // Setzen von currentTime mit einer Verzögerung (falls Video noch nicht bereit ist)
//     setTimeout(() => {
//       video.currentTime = 5;
//       console.log('⏱️ currentTime gesetzt:', video.currentTime);
  
//       // Warten auf das 'seeking' Event, um sicherzustellen, dass das Video die Zeit springt
//       video.addEventListener('seeking', () => {
//         console.log('⏳ Video versucht zu springen zu:', video.currentTime);
//       });
  
//       // Warten auf das 'seeked' Event, um sicherzustellen, dass das Video den neuen Wert erreicht hat
//       video.addEventListener('seeked', () => {
//         console.log('✅ Seek abgeschlossen bei:', video.currentTime);
//         this.updateSeekbar();
//       });
//     }, 500);  // Versuche es mit einer Verzögerung von 500ms, um sicherzustellen, dass das Video bereit ist
//   }
  
  
  

//   private loadVideoSource(): void {
//     if (this.target && this.videoData) {
//       const video = this.target.nativeElement;
//       video.src = this.apiUrl + this.videoData.video_file;
//       video.load();
  
//       console.log('🎬 Video-Quelle gesetzt:', video.src);
//     } else {
//       console.error('❌ Video-Element oder Video-Daten fehlen.');
//     }
//   }

//   ngOnDestroy(): void {
//     // clearInterval(this.intervalId);

//     const video = this.target?.nativeElement;
//     if (video) {
//       video.pause();  // Stoppt das Video
//       video.currentTime = 0;  // Setzt das Video zurück auf den Anfang
//       console.log('Video pausiert und zurückgesetzt');
//     }


//     if (this.target?.nativeElement) {
//       const video = this.target.nativeElement;
//       // 🛑 1️⃣ Video pausieren (falls noch aktiv)
//       video.pause();
//       video.currentTime = 0; // Zurücksetzen für sicheres Stoppen
//       // 🚫 2️⃣ Video-Quelle komplett entfernen
//       video.removeAttribute('src');
//       video.load(); // Erzwingt komplettes Entladen
//       // 🔊 3️⃣ Falls das Video einen aktiven Media-Stream hat, beenden
//       const mediaStream = video.srcObject as MediaStream;
//       if (mediaStream) {
//         mediaStream.getTracks().forEach((track) => track.stop()); // Alle Streams stoppen
//         video.srcObject = null;
//       }
//       // ⚡ 4️⃣ Event Listener entfernen, um sicherzugehen
//       video.onplay = null;
//       video.onpause = null;
//       video.onended = null;
//       video.ontimeupdate = null;
//       video.onloadedmetadata = null;
//       // 🗑️ 5️⃣ (Optional) Element aus DOM entfernen, falls nötig
//       video.parentNode?.removeChild(video);
//     }
//   }

//   // getBufferedTime(): number {
//   //   if (!this.target) return 0;

//   //   const video = this.target.nativeElement;
//   //   if (video.buffered.length > 0) {
//   //     // console.log(video.buffered.length);

//   //     return video.buffered.end(video.buffered.length - 1); // Letzter gepufferter Bereich
//   //   }
//   //   return 0;
//   // }

//   async loadVideoData(id: string): Promise<void> {
//     try {
//       const data = await lastValueFrom(this.videoService.getVideoById(id));

//       // Standardmäßig 720p hinzufügen, falls kein Suffix existiert
//       if (!data.video_file.match(/_(120p|360p|720p|1080p)\.mp4$/)) {
//         const filename = data.video_file.replace('.mp4', '_720p.mp4');
//         data.video_file = filename;
//       }

//       console.log('✅ Video geladen:', data.video_file);

//       this.videoData = data;
//     } catch (error) {
//       console.error('❌ Fehler beim Laden des Videos:', error);
//     }
//   }

//   // checkVideoProgress(videoId: number | string): Promise<number> {
//   //   return new Promise((resolve, reject) => {
//   //     const videoIdNumber =
//   //       typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;

//   //     if (this.isProgressChecked) return resolve(0); // Schon gesetzt → 0 zurückgeben

//   //     this.progressService.getProgress(videoIdNumber).subscribe(
//   //       (res) => {
//   //         if (res.progress > 0) {
//   //           resolve(res.progress); // ✅ Nur den Wert zurückgeben
//   //         } else {
//   //           resolve(0); // Falls kein Fortschritt → 0 zurückgeben
//   //         }
//   //       },
//   //       (error) => {
//   //         console.error('Fehler beim Laden des Fortschritts:', error);
//   //         reject(error);
//   //       }
//   //     );
//   //   });
//   // }

//   rewind(seconds: number): void {}

//   forward(seconds: number): void {}

//   toggleMute(): void {}

//   toogleVideoDescription(): void {}

//   toggleResolutionPopup(): void {}

//   toggleFullscreen(): void {}

//   determineOptimalResolution(): void {}

//   userSelectedResolution(resolution: string): void {}

//   toggleVideo(): void {
    
//     if (!this.target || !this.target.nativeElement) return;
//     const video = this.target.nativeElement;
//     this.cdr.detectChanges();
//     video.paused ? video.play() : video.pause();
//     this.isResolutionPopupOpen = false;
//   }

//   updateSeekbar(): void {
//     if (this.target) {
//       const video = this.target.nativeElement;
//       this.seekbarValue = (video.currentTime / video.duration) * 100;
//       this.videoDuration = this.formatTime(video.duration);
//       this.currentTime = video.currentTime;
//     }
//   }

//   onSeek(event: Event): void {
//     if (this.target) {
//       const video = this.target.nativeElement;
//       const input = event.target as HTMLInputElement;
//       const seekTo = (parseFloat(input.value) / 100) * video.duration;
//       video.currentTime = seekTo;
//       this.currentTime = video.currentTime;
//       this.videoDuration = this.formatTime(video.duration);
//     }
//   }

//   formatTime(time: number): string {
//     const hours = Math.floor(time / 3600);
//     const minutes = Math.floor((time % 3600) / 60);
//     const seconds = Math.floor(time % 60);

//     if (hours > 0) {
//       return `${hours}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
//     } else {
//       return `${minutes}:${this.padZero(seconds)}`;
//     }
//   }

//   padZero(num: number): string {
//     return num < 10 ? '0' + num : num.toString();
//   }
// }
