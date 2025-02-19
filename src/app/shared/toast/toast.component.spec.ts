import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show toast with message and action button', () => {
    component.showToast('Test Message', true);
    expect(component.message).toBe('Test Message');
    expect(component.showActionButton).toBeTrue();
    expect(component.isVisible).toBeTrue();
  });

  it('should hide toast after timeout if no action button is shown', fakeAsync(() => {
    component.showToast('Auto-close Message', false);
    expect(component.isVisible).toBeTrue();
    
    tick(3000); // Simuliert 3 Sekunden Wartezeit
    expect(component.isVisible).toBeFalse();
  }));

  it('should call toastService.setResponse when closing toast', () => {
    spyOn(toastService, 'setResponse');
    component.closeToast();
    expect(toastService.setResponse).toHaveBeenCalledWith(false);
  });

  it('should call toastService.setResponse with true on action', () => {
    spyOn(toastService, 'setResponse');
    component.onAction(true);
    expect(toastService.setResponse).toHaveBeenCalledWith(true);
    expect(component.isVisible).toBeFalse();
  });

  it('should call toastService.setResponse with false on action', () => {
    spyOn(toastService, 'setResponse');
    component.onAction(false);
    expect(toastService.setResponse).toHaveBeenCalledWith(false);
    expect(component.isVisible).toBeFalse();
  });
});
