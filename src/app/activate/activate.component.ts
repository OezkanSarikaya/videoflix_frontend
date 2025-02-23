import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Component to handle the account activation process.
 * It uses the activation token and UID passed in the query parameters to activate the user's account.
 */

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent, RouterLink],
  styleUrls: ['./activate.component.scss'],
})
export class ActivateComponent {
  /** Message to be displayed to the user */
  message: string = '';

  /** Whether the activation was successful or not */
  isSuccess: boolean = false;

  /** Represents the current status of the activation process */
  activationStatus: 'success' | 'error' | 'loading' | null = null;

  private activationSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute, // To extract the query parameters
    private http: HttpClient, // To perform HTTP requests if necessary
    private authService: AuthService // To interact with authentication services
  ) {}

  /**
   * Lifecycle hook to initialize the component and start the activation process.
   * Reads 'uid' and 'token' from the URL and triggers the activation API call.
   */
  ngOnInit(): void {
    this.activationStatus = 'loading'; // Set initial status to loading
    // Retrieve the 'uid' and 'token' from the query parameters
    const uid = this.route.snapshot.queryParamMap.get('uid');
    const token = this.route.snapshot.queryParamMap.get('token');

    // Ensure both 'uid' and 'token' are present
    if (uid && token) {
      // Attempt to activate the account with the provided 'uid' and 'token'
      this.activationSubscription = this.authService
        .activateAccount(uid, token)
        .subscribe({
          next: () => {
            this.activationStatus = 'success';
            this.message = 'Your account was successfully activated!';
          },
          error: (err) => {
            console.error('Activation failed:', err);
            this.activationStatus = 'error';
            this.message =
              'Die Aktivierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.';
          },
        });
    } else {
      // If no 'uid' or 'token' is found, set the activation status to error
      this.activationStatus = 'error';
      this.message = '';
    }
  }

  /**
   * Lifecycle hook to clean up the subscription when the component is destroyed.
   */
  ngOnDestroy(): void {
    // Unsubscribe from the activation subscription to prevent memory leaks
    if (this.activationSubscription) {
      this.activationSubscription.unsubscribe();
    }
  }
}
