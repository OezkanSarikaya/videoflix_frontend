import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email: string = '';
  statusMessage: string = '';
  hideForm: boolean = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.statusMessage = 'Reset link sent! Please, check your email.';
        this.hideForm = true;
      },
      error: () => {
        this.statusMessage = 'Something went wrong. Please try again.';
        this.hideForm = false;
      },
    });
  }
}
