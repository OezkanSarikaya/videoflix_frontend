import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';  // Importing Subscription class

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']  // Corrected typo from 'styleUrl' to 'styleUrls'
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  email: string = '';
  statusMessage: string = '';
  hideForm: boolean = false;
  private forgotPasswordSubscription: Subscription | null = null;  // Storing the subscription

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Initialization logic if needed
  }

  /**
   * Handles the form submission for password reset request.
   * Sends the reset email via AuthService.
   */
  onSubmit(): void {
    this.statusMessage = '';  // Clear previous status message
    this.hideForm = false;  // Make sure form is visible in case of errors

    // Start password reset request via AuthService
    this.forgotPasswordSubscription = this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.statusMessage = 'Reset link sent! Please, check your email.';
        this.hideForm = true;  // Hide form after success
      },
      error: () => {
        this.statusMessage = 'Something went wrong. Please try again.';
        this.hideForm = false;  // Keep the form visible if there was an error
      },
    });
  }

  /**
   * Lifecycle hook to clean up the subscription when the component is destroyed.
   * This prevents memory leaks.
   */
  ngOnDestroy(): void {
    if (this.forgotPasswordSubscription) {
      this.forgotPasswordSubscription.unsubscribe();
    }
  }
}
