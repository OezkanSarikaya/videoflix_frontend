import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../app/services/auth.service';
import { ToastService } from '../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Für HTTP-Requests im Test

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Mock für AuthService mit allen Methoden, die verwendet werden
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'signup',
      'isAuthenticated', // Füge diese Methode hinzu
    ]);
    authServiceMock.signup.and.returnValue(of({})); // Simuliere ein leeres Observable (Erfolg)
    authServiceMock.isAuthenticated.and.returnValue(true); // Füge die Methode isAuthenticated hinzu

    // Mock für ToastService
    toastServiceMock = jasmine.createSpyObj('ToastService', ['showToast']);
    
    await TestBed.configureTestingModule({
      imports: [SignupComponent, FormsModule, HttpClientTestingModule], // Standalone-Komponente und Module
      providers: [
        { provide: AuthService, useValue: authServiceMock },  // Mock des AuthService
        { provide: ToastService, useValue: toastServiceMock }, // Mock des ToastService
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ email: 'test@example.com' }),  // Mock für queryParams
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email from queryParams', () => {
    expect(component.email).toBe('test@example.com');
  });

  it('should call signup method of AuthService when signup is called', () => {
    // Vorherige Werte setzen
    component.email = 'test@example.com';
    component.password = 'password123';
    component.password_confirmed = 'password123';

    component.signup();  // Methode aufrufen

    // Überprüfen, ob die signup Methode im AuthService aufgerufen wurde
    expect(authServiceMock.signup).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should show success message when signup is successful', () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    component.password_confirmed = 'password123';
    
    component.signup(); // Aufruf von signup

    // Überprüfen, dass keine Fehlernachricht vorhanden ist und Erfolgsmeldung angezeigt wird
    expect(component.errorMessage).toBe('');
    expect(component.showSuccessMessage).toBeTrue();
  });

  it('should show error message when signup fails', () => {
    // Simuliere Fehler beim Signup, indem wir ein Fehler-Observable zurückgeben
    const errorResponse = { error: 'Signup failed' };
    authServiceMock.signup.and.returnValue(throwError(() => errorResponse)); // Fehler-Observable simulieren

    component.email = 'test@example.com';
    component.password = 'password123';
    component.password_confirmed = 'password123';
    
    component.signup(); // Aufruf von signup

    // Überprüfen, dass die Fehlernachricht gesetzt wird
    expect(component.errorMessage).toBe('Signup failed, please try again.');
    expect(component.showSuccessMessage).toBeFalse(); // Erfolgsmeldung sollte false sein
  });
});
