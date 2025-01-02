import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-video-offer',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './video-offer.component.html',
  styleUrl: './video-offer.component.scss'
})
export class VideoOfferComponent {

}
