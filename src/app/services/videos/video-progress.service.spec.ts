import { TestBed } from '@angular/core/testing';
import { VideoProgressService } from './video-progress.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';
import { environment } from '../../environment/environment';

// Mock AuthService
class MockAuthService {
  getAuthHeaders() {
    return { Authorization: 'Bearer fake-token' };
  }
}

describe('VideoProgressService', () => {
  let service: VideoProgressService;
  let httpMock: HttpTestingController;
  let authService: MockAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Für das Mocken von HTTP-Anfragen
      providers: [
        VideoProgressService,
        { provide: AuthService, useClass: MockAuthService } // Mock AuthService verwenden
      ]
    });

    service = TestBed.inject(VideoProgressService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  afterEach(() => {
    httpMock.verify(); // Überprüft, ob keine ausstehenden HTTP-Anfragen vorhanden sind
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call saveProgress and return a response', () => {
    const videoId = 1;
    const progress = 50;
    const mockResponse = { success: true };

    // Spy und Mock der saveProgress-Methode
    service.saveProgress(videoId, progress).subscribe((response) => {
      expect(response).toEqual(mockResponse);  // Überprüfe, ob die Antwort wie erwartet ist
    });

    // HTTP-Anfrage wird ausgelöst
    const req = httpMock.expectOne((request) =>
      request.url === `${environment.apiUrl}/api/video-progress/` && request.method === 'POST'
    );

    // Überprüfe die Anfrage-Daten
    expect(req.request.body).toEqual({ video: videoId, progress: progress });
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token'); // Überprüfe den Auth-Header

    // Simuliere eine Antwort vom Backend
    req.flush(mockResponse);
  });

  it('should call getProgress and return a response', () => {
    const videoId = 1;
    const mockProgress = { video: videoId, progress: 50 };

    // Spy und Mock der getProgress-Methode
    service.getProgress(videoId).subscribe((progress) => {
      expect(progress).toEqual(mockProgress);  // Überprüfe, ob die Antwort wie erwartet ist
    });

    // HTTP-Anfrage wird ausgelöst
    const req = httpMock.expectOne((request) =>
      request.url === `${environment.apiUrl}/api/video-progress/${videoId}/` && request.method === 'GET'
    );

    // Überprüfe den Auth-Header
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    // Simuliere eine Antwort vom Backend
    req.flush(mockProgress);
  });

});
