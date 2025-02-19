import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartsiteComponent } from './startsite.component';
import { Router } from '@angular/router';
import { ToastService } from './../services/toast/toast.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StartsiteComponent', () => {
  let component: StartsiteComponent;
  let fixture: ComponentFixture<StartsiteComponent>;
  let router: Router;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StartsiteComponent,
        RouterTestingModule,
        FormsModule,
        CommonModule,
        FooterComponent,
        HeaderComponent,
        HttpClientTestingModule // <-- Hier hinzufügen
      ],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(StartsiteComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show toast for invalid email', () => {
    spyOn(toastService, 'showToast');
    component.email = 'invalid-email';
    component.goToSignup();
    expect(toastService.showToast).toHaveBeenCalledWith('Bitte eine gültige E-Mail eingeben!', false);
  });

  it('should navigate to signup without email', () => {
    spyOn(router, 'navigate');
    component.email = '';
    component.goToSignup();
    expect(router.navigate).toHaveBeenCalledWith(['/signup'], {});
  });

  it('should navigate to signup with email', () => {
    spyOn(router, 'navigate');
    component.email = 'test@example.com';
    component.goToSignup();
    expect(router.navigate).toHaveBeenCalledWith(['/signup'], { queryParams: { email: 'test@example.com' } });
  });
});
