import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { Observable, Subject } from 'rxjs';

describe('ToastService', () => {
  let service: ToastService;
  let mockToastComponent: jasmine.SpyObj<ToastComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });

    service = TestBed.inject(ToastService);

    // Mock der ToastComponent
    mockToastComponent = jasmine.createSpyObj('ToastComponent', ['showToast']);
    service.setToastComponent(mockToastComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the toast component', () => {
    const newToastComponent = jasmine.createSpyObj('ToastComponent', ['showToast']);
    service.setToastComponent(newToastComponent);
    expect(service['toastComponent']).toBe(newToastComponent);
  });

  it('should call showToast on the ToastComponent', () => {
    service.showToast('Test Message', true);
    expect(mockToastComponent.showToast).toHaveBeenCalledWith('Test Message', true);
  });

  it('should return an observable when showing a toast', (done) => {
    const toastObservable = service.showToast('Test Message', false);
    expect(toastObservable).toBeInstanceOf(Observable);
    done();
  });

  it('should set response and complete the observable', (done) => {
    service.showToast('Test Message', true).subscribe({
      next: (response) => {
        expect(response).toBeTrue();
        done();
      },
    });

    service.setResponse(true);
  });

  it('should log an error if toastComponent is not set', () => {
    spyOn(console, 'error');
    service['toastComponent'] = undefined as any;
    service.showToast('Test Message', false).subscribe({
      error: (err) => {
        expect(err).toBe('ToastComponent is not set');
        expect(console.error).toHaveBeenCalledWith('ToastComponent is not set');
      },
    });
  });
});
