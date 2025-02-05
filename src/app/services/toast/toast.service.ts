import { Injectable } from '@angular/core';
import { ToastComponent } from '../../shared/toast/toast.component';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastComponent!: ToastComponent;
  private toastResponse = new Subject<boolean>();

  // Methode zum Setzen der Toast-Komponente
  setToastComponent(toast: ToastComponent): void {
    this.toastComponent = toast;
  }

  // Zeigt den Toast an und wartet auf die Benutzerreaktion
  showToast(message: string, showButton: boolean): Observable<boolean> {
    if (this.toastComponent) {
      this.toastComponent.showToast(message, showButton);
      
      this.toastResponse = new Subject<boolean>();
      // Der ToastComponent ruft bei Button-Klick `setResponse` auf
      return this.toastResponse.asObservable();
    } else {
      console.error('ToastComponent is not set');
      return new Observable<boolean>((observer) => {
        observer.error('ToastComponent is not set');
      });
    }
  }

  // Diese Methode wird von der Toast-Komponente aufgerufen
  setResponse(response: boolean): void {
    if (this.toastResponse) {
    this.toastResponse.next(response);
    this.toastResponse.complete(); // Schließt den Stream nach der Antwort
    }
  }


}
