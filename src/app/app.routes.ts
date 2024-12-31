import { Routes } from '@angular/router';
import { StartsiteComponent } from './startsite/startsite.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VideoOfferComponent } from './video-offer/video-offer.component';
import { VideoplayerComponent } from './videoplayer/videoplayer.component';


export const routes: Routes = [
    {path: "", component: StartsiteComponent},
    {path: "login", component: LoginComponent},
    {path: "signup", component: SignupComponent},
    {path: "forgot-password", component: ForgotPasswordComponent},
    {path: "video-offer", component: VideoOfferComponent},
    {path: "videoplayer", component: VideoplayerComponent},

];
