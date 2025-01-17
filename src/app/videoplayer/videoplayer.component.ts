import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { VideoService } from '../../app/services/videos/video.service';
import { VideoProgressService } from '../../app/services/videos/video-progress.service';
import { CommonModule } from '@angular/common';
import { ToastService } from './../services/toast/toast.service';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements AfterViewInit, OnInit, OnDestroy {
  videoId: string | null = null;
  videoData: any = null;
  toastResponse: boolean = false;

  // @ViewChild('target', { static: false })
  @ViewChild('target', { static: false }) target!: ElementRef<HTMLVideoElement>;
  // target!: ElementRef;
  @ViewChild('seekbar') seekbar!: ElementRef<HTMLInputElement>;

  seekbarValue: number = 0;
  videoDuration: string = '00:00';
  currentTime: number = 0;
  myPlayer: any = null;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private progressService: VideoProgressService,
    private toastService: ToastService,
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
  }

  loadVideoData(id: string): void {
    this.videoService.getVideoById(id).subscribe(
      (data) => {
        this.videoData = data;
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
          console.log('Metadaten geladen:', video.duration);

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
                console.log('Toast Response:', response);

                if (this.toastResponse) {
                  video.currentTime = res.progress;
                  // this.videoPlayer.currentTime(res.progress);
                  console.log(
                    'Video fortgesetzt bei Sekunde:',
                    res.progress,
                    'Current Time:',
                    video.currentTime
                  );
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
  }

  rewind(seconds: number): void {
    if (this.target) {
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
}
