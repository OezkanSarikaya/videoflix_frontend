import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { RouterLink, Router , RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from './../services/toast/toast.service';

@Component({
  selector: 'app-startsite',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, RouterLink, FormsModule, CommonModule],
  templateUrl: './startsite.component.html',
  styleUrl: './startsite.component.scss'
})
export class StartsiteComponent {
  email: string = '';

  constructor(private router: Router, private toastService: ToastService) {}

  goToSignup() {
    if (this.email && !this.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      // alert('Bitte eine gültige E-Mail eingeben!');
      this.toastService.showToast(
        'Bitte eine gültige E-Mail eingeben!',
        false
      );
      return;
    }

    // Navigiere zur Signup-Seite mit oder ohne E-Mail als Parameter
    const queryParams = this.email ? { queryParams: { email: this.email } } : {};
    this.router.navigate(['/signup'], queryParams);
  }

}
