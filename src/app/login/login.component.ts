import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from './../services/toast/toast.service';

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
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  password: string = '';
  showPassword: boolean = false;
  email: string = '';
  rememberme: boolean = false;
  errorMessage: string = '';
  toastResponse: boolean | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.authService
      .login(this.email, this.password, this.rememberme)
      .subscribe({
        next: (response) => {
          // Erfolgreich angemeldet, Navigiere zur Video-Seite
          this.router.navigate(['/videos']);
        },
        error: (err) => {
          this.toastService.showToast(
            'Login fehlgeschlagen. Überprüfe deine E-Mail und das Passwort.',
            false
          );
        },
      });
  }
}
