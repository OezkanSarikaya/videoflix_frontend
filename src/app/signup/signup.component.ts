import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../app/services/auth.service'; 
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from './../services/toast/toast.service';
// import { NgModule } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  password: string = '';
  password_confirmed: string = '';
  showPassword: boolean = false;
  email: string = '';
  errorMessage: string = '';
  showSuccessMessage: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit() {
    // E-Mail aus Query-Params übernehmen, falls vorhanden
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  signup() {
    if (this.password !== this.password_confirmed) {
      this.errorMessage = "Passwords do not match!";
      return;
    }

    this.authService.signup(this.email, this.password).subscribe(
      (response) => {
        console.log('Signup successful', response);
        this.showSuccessMessage = true; // Erfolgsmeldung anzeigen
        this.errorMessage = ''; // Fehler zurücksetzen
        // Handle successful signup (e.g., redirect to login page or dashboard)
      },
      (error) => {
        // console.error('Signup failed', error);
        this.errorMessage = "Signup failed, please try again.";
        this.showSuccessMessage = false; // Erfolgsmeldung zurücksetzen
        this.toastService.showToast(
          this.errorMessage,
          false
        );
      }
    );
  }
}
