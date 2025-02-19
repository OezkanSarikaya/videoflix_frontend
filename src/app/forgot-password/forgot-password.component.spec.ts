import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

// Erstelle einen Mock für ActivatedRoute
const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: (key: string) => key === 'uid' ? 'mock-uid' : 'mock-token'  // Gib hier deine gewünschten Mock-Werte zurück
    }
  }
};

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Mock für AuthService
    authService = jasmine.createSpyObj('AuthService', ['forgotPassword']);
    authService.forgotPassword.and.returnValue(of(null));  // Erfolgsfall

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ForgotPasswordComponent,  // Standalone-Komponente
        HeaderComponent,
        FooterComponent
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: activatedRouteMock }  // ActivatedRoute mocken
      ]
    });

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create the ForgotPasswordComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set statusMessage and hide the form when forgotPassword succeeds', fakeAsync(() => {
    component.email = 'test@example.com';
    component.onSubmit();  // Trigger der Methode

    tick();  // Warten auf asynchrone Operationen

    expect(component.statusMessage).toBe('Reset link sent! Please, check your email.');
    expect(component.hideForm).toBeTrue();
    expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
  }));

  it('should set statusMessage and not hide the form when forgotPassword fails', fakeAsync(() => {
    authService.forgotPassword.and.returnValue(throwError(() => new Error('Something went wrong.')));

    component.email = 'test@example.com';
    component.onSubmit();  // Trigger der Methode

    tick();  // Warten auf asynchrone Operationen

    expect(component.statusMessage).toBe('Something went wrong. Please try again.');
    expect(component.hideForm).toBeFalse();
  }));
});
