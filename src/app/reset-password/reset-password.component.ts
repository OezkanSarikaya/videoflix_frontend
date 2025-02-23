import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';
import { Subscription } from 'rxjs';  // Importing Subscription to manage the subscription

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],  // Fixed 'styleUrl' typo to 'styleUrls'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  password: string = '';
  passwordConfirmed: string = '';
  showPassword: boolean = false;
  uid: string = '';
  token: string = '';
  resetStatus: string = '';  // success, error, mismatch, valid, or invalid
  private resetSubscription: Subscription | null = null;  // Store the subscription

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Retrieve 'uid' and 'token' from the route parameters
    this.uid = this.route.snapshot.paramMap.get('uid') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';

    // Validate the reset token if both 'uid' and 'token' are available
    if (this.uid && this.token) {
      this.resetSubscription = this.authService.validateResetToken(this.uid, this.token).subscribe({
        next: () => {
          this.resetStatus = 'valid';  // Token is valid, allow user to reset the password
        },
        error: (err) => {
          this.resetStatus = 'invalid';  // Token is invalid, display an error
          console.error('Token invalid', err);
        },
      });
    }
  }

  /**
   * Submits the password reset request.
   */
  resetPassword(): void {
    // Check if the passwords match
    if (this.password !== this.passwordConfirmed) {
      this.resetStatus = 'mismatch';  // Passwords do not match
      return;
    }

    // Call the AuthService to reset the password
    this.resetSubscription = this.authService.resetPassword(this.uid, this.token, this.password).subscribe({
      next: () => {
        this.resetStatus = 'success';  // Password reset successful
      },
      error: () => {
        this.resetStatus = 'error';  // Error occurred during password reset
      },
    });
  }

  /**
   * Toggles password visibility between hidden and visible.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Cleanup subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.resetSubscription) {
      this.resetSubscription.unsubscribe();  // Unsubscribe to avoid memory leaks
    }
  }
}
