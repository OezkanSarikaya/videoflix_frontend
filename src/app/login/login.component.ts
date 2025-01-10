import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterLink,
    RouterOutlet,
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

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login() {
    console.log('Remember me: ' + this.rememberme);

    this.authService
      .login(this.email, this.password, this.rememberme)
      .subscribe({
        next: (response) => {
          // Erfolgreich angemeldet, Navigiere zur Video-Seite
          this.router.navigate(['/videos']);
        },
        error: (err) => {
          this.errorMessage =
            'Login fehlgeschlagen. Überprüfe deine E-Mail und Passwort.';
        },
      });
  }
}
