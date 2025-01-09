import { Component } from '@angular/core';
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, RouterLink, RouterOutlet, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})


export class LoginComponent {
  password: string = '';
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  email: string = '';
  // password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Token speichern
        // this.authService.setAccessToken(response.access);
        // Weiterleitung zur Video-Übersicht oder zum gewünschten Endpoint
        this.router.navigate(['/videos']);
      },
      error: (err) => {
        this.errorMessage = 'Login fehlgeschlagen. Überprüfe deine E-Mail und Passwort.';
      }
    });
  }
}
