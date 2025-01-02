import { Component } from '@angular/core';
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FooterComponent, HeaderComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

}
