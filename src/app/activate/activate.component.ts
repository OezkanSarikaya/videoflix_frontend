import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { AuthService } from '../services/auth.service';
import { log } from 'console';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent],
  styleUrls: ['./activate.component.scss'],
})
export class ActivateComponent {
  message: string = '';
  isSuccess: boolean = false;
  activationStatus: 'success' | 'error' | 'loading' | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Lesen von 'uid' und 'token' aus der URL
    this.activationStatus = 'loading';
    const uid = this.route.snapshot.queryParamMap.get('uid');
    const token = this.route.snapshot.queryParamMap.get('token');

    // Sicherstellen, dass beide Werte vorhanden sind
    if (uid && token) {
      console.log('UID:', uid, 'Token:', token);
      this.authService.activateAccount(uid, token).subscribe({
        next: () => {
          console.log('Activation successful');
          this.activationStatus = 'success';
        },
        error: (err) => {
          console.error('Activation failed:', err);
          this.activationStatus = 'error';
        },
      });
    } else {
      console.log('UID or Token is missing');
      this.activationStatus = 'error';
    }
  }

  // activateAccount(uid: string, token: string): void {
  //   // Anfrage ans Backend senden
  //   this.http
  //     .post('http://localhost:8000/api/users/activate/', { uid, token })
  //     .subscribe({
  //       next: () => {
  //         this.isSuccess = true;
  //         this.message = 'Ihr Konto wurde erfolgreich aktiviert!';
  //       },
  //       error: () => {
  //         this.isSuccess = false;
  //         this.message =
  //           'Die Aktivierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.';
  //       },
  //     });
  // }
}
