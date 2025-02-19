import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let mockActivatedRoute: any;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Mock für ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'uid') return 'mock-uid';
            if (key === 'token') return 'mock-token';
            return null;
          }
        }
      }
    };

    // Mock für AuthService
    authService = jasmine.createSpyObj('AuthService', [
      'validateResetToken',
      'resetPassword',
      'isAuthenticated'
    ]);

    // Sicherstellen, dass validateResetToken immer ein Observable zurückgibt
    authService.validateResetToken.and.returnValue(of(null)); // Simuliert eine erfolgreiche Validierung des Tokens

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, 
        FormsModule, 
        ResetPasswordComponent,   // Hier fügen wir die Standalone-Komponente hinzu
        HeaderComponent,
        FooterComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: authService }
      ]
    });

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create the ResetPasswordComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize uid and token from route query params', fakeAsync(() => {
    // Prüfe, ob die Route korrekt gemockt wurde
    expect(mockActivatedRoute.snapshot.paramMap.get('uid')).toBe('mock-uid');
    expect(mockActivatedRoute.snapshot.paramMap.get('token')).toBe('mock-token');
    
    fixture.detectChanges();  // ngOnInit() wird aufgerufen
    tick();  // Warte auf asynchrone Operationen

    // Vergewissere dich, dass `uid` und `token` korrekt gesetzt wurden
    expect(component.uid).toBe('mock-uid');
    expect(component.token).toBe('mock-token');
  }));

  it('should set resetStatus to valid when token is valid', fakeAsync(() => {
    // Mock für eine gültige Antwort
    authService.validateResetToken.and.returnValue(of(null));

    fixture.detectChanges();  // ngOnInit() wird aufgerufen
    tick();  // Warte auf asynchrone Operationen

    expect(component.resetStatus).toBe('valid');
  }));

  it('should set resetStatus to invalid when token is invalid', fakeAsync(() => {
    // Mock für eine ungültige Antwort
    authService.validateResetToken.and.returnValue(throwError(() => new Error('Token invalid')));

    fixture.detectChanges();  // ngOnInit() wird aufgerufen
    tick();  // Warte auf asynchrone Operationen

    expect(component.resetStatus).toBe('invalid');
  }));

  it('should set resetStatus to mismatch if passwords do not match', () => {
    component.password = 'newpassword';
    component.passwordConfirmed = 'differentpassword';

    component.resetPassword();

    expect(component.resetStatus).toBe('mismatch');
  });

  it('should set resetStatus to success when password reset is successful', () => {
    authService.resetPassword.and.returnValue(of(null));  // Simuliere eine erfolgreiche Antwort

    component.password = 'newpassword';
    component.passwordConfirmed = 'newpassword';
    component.resetPassword();

    expect(component.resetStatus).toBe('success');
  });

  it('should set resetStatus to error when password reset fails', () => {
    authService.resetPassword.and.returnValue(throwError(() => new Error('Reset failed')));

    component.password = 'newpassword';
    component.passwordConfirmed = 'newpassword';
    component.resetPassword();

    expect(component.resetStatus).toBe('error');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });
});
