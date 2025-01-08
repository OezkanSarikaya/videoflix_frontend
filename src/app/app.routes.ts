import { Routes } from '@angular/router';
import { StartsiteComponent } from './startsite/startsite.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VideoOfferComponent } from './video-offer/video-offer.component';
import { VideoplayerComponent } from './videoplayer/videoplayer.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from '../app/services/auth.guard';


export const routes: Routes = [
    {path: "", component: StartsiteComponent},
    {path: "login", component: LoginComponent},
    {path: "signup", component: SignupComponent},
    {path: "forgot-password", component: ForgotPasswordComponent},
    {path: "reset-password", component: ResetPasswordComponent},
    {path: "videos", component: VideoOfferComponent, canActivate: [AuthGuard]},
    {path: "videoplayer/:id", component: VideoplayerComponent, canActivate: [AuthGuard]},

];
