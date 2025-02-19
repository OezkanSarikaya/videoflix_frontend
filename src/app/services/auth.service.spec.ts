import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';  // Dein Pfad zur AuthService-Datei

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],  // HttpClientTestingModule hinzufügen
      providers: [AuthService]  // AuthService bereitstellen
    }).compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(AuthService);  // AuthService instanziieren
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
