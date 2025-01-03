import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './videoplayer.component.html',
  styleUrl: './videoplayer.component.scss'
})
export class VideoplayerComponent {
  @ViewChild('videoPlayer') videoPlayer?: ElementRef;

  toggleVideo() {
    const video: HTMLVideoElement = this.videoPlayer?.nativeElement;
    video.paused ? video.play() : video.pause();
  }
}
