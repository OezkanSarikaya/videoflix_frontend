import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';
// import { log } from 'console';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  passwordConfirmed: string = '';
  showPassword: boolean = false;
  uid: string = '';
  token: string = '';
  resetStatus: string = ''; // success, error, oder leer

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';

    // Überprüfen, ob uid und token vorhanden sind
    if (this.uid && this.token) {
      this.authService.validateResetToken(this.uid, this.token).subscribe({
        next: () => {
          this.resetStatus = 'valid';
        },
        error: (err) => {
          this.resetStatus = 'invalid';
          console.error('Token invalid', err);
        },
      });
    }
  }

  // Passwortänderung absenden
  resetPassword(): void {
    if (this.password !== this.passwordConfirmed) {
      this.resetStatus = 'mismatch';
      return;
    }

    this.authService
      .resetPassword(this.uid, this.token, this.password)
      .subscribe({
        next: () => {
          this.resetStatus = 'success';
        },
        error: () => {
          this.resetStatus = 'error';
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
