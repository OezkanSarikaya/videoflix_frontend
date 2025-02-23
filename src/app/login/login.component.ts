import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from './../services/toast/toast.service';
import { Subscription } from 'rxjs';  // Import Subscription class to manage subscriptions

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterLink,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  // Corrected 'styleUrl' to 'styleUrls'
})
export class LoginComponent implements OnInit, OnDestroy {
  password: string = '';
  showPassword: boolean = false;
  email: string = '';
  rememberme: boolean = false;
  errorMessage: string = '';
  toastResponse: boolean | undefined;
  private loginSubscription: Subscription | null = null;  // Store the subscription

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Any necessary initialization can go here.
  }

  /**
   * Toggles the visibility of the password field.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles the login process. It calls the AuthService to authenticate the user.
   */
  login(): void {
    this.errorMessage = '';  // Clear previous error message

    // Start login process via AuthService
    this.loginSubscription = this.authService
      .login(this.email, this.password, this.rememberme)
      .subscribe({
        next: (response) => {
          // Successfully logged in, navigate to the video page
          this.router.navigate(['/videos']);
        },
        error: (err) => {
          // Show toast message for login failure
          this.toastService.showToast(
            'Login failed. Please check your email and password.',
            false
          );
          this.errorMessage = 'Login failed. Please try again.';  // Provide error message
        },
      });
  }

  /**
   * Clean up the subscription when the component is destroyed to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
