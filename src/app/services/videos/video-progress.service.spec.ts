import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VideoProgressService } from './video-progress.service';

describe('VideoProgressService', () => {
  let service: VideoProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Fügt den HttpClient-Testmodul hinzu
      providers: [VideoProgressService]
    });

    service = TestBed.inject(VideoProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
