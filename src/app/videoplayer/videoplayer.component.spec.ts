import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoplayerComponent } from './videoplayer.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { VideoService } from '../services/videos/video.service';
import { VideoProgressService } from '../services/videos/video-progress.service';
import { ToastService } from '../services/toast/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Mock der VideoServices
class MockVideoService {
  getVideoById() {
    return of({ video_file: 'mock_video_file.mp4' });
  }
}

class MockVideoProgressService {
  getProgress() {
    return of({ progress: 0 });
  }
}

class MockToastService {
  showToast() {
    return of(true);
  }
}

describe('VideoplayerComponent', () => {
  let component: VideoplayerComponent;
  let fixture: ComponentFixture<VideoplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoplayerComponent, CommonModule, FormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => 'mockVideoId' }) }, // Mock der paramMap mit einem videoId
        },
        { provide: VideoService, useClass: MockVideoService },
        { provide: VideoProgressService, useClass: MockVideoProgressService },
        { provide: ToastService, useClass: MockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
