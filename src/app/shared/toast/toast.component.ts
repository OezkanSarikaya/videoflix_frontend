import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  message: string = '';
  isVisible: boolean = false;
  showActionButton: boolean = false;
  // actionEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor(private toastService: ToastService) {}

  showToast(message: string, showActionButton: boolean = false) {
    this.message = message;
    this.showActionButton = showActionButton;
    this.isVisible = true;

    // Automatisch schließen nach 3 Sekunden, wenn kein Button gezeigt wird
    if (!this.showActionButton) {
      setTimeout(() => this.closeToast(), 3000);
    }
  }

  closeToast() {
    this.toastService.setResponse(false);
    this.isVisible = false;
  }

  onAction(response: boolean) {
    this.isVisible = false;
    this.toastService.setResponse(response); // Rückmeldung an den Service
  }
}
