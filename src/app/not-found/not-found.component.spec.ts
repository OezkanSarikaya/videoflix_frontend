import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Mock für AuthService erstellen
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NotFoundComponent], // Standalone-Komponente gehört in imports
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } }, // Mock für ActivatedRoute
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
