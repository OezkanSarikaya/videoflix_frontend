import { Routes } from '@angular/router';
import { StartsiteComponent } from './startsite/startsite.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VideoOfferComponent } from './video-offer/video-offer.component';
import { VideoplayerComponent } from './videoplayer/videoplayer.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from '../app/services/auth.guard';
import { ActivateComponent } from './activate/activate.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { NotFoundComponent } from './not-found/not-found.component';


export const routes: Routes = [
    {path: "", component: StartsiteComponent, canActivate: [AuthGuard]},
    {path: "login", component: LoginComponent, canActivate: [AuthGuard]},
    {path: "activate", component: ActivateComponent},
    {path: "signup", component: SignupComponent, canActivate: [AuthGuard]},
    {path: "forgot-password", component: ForgotPasswordComponent},
    {path: "reset-password/:uid/:token", component: ResetPasswordComponent},
    {path: "videos", component: VideoOfferComponent, canActivate: [AuthGuard]},
    {path: "videoplayer/:videoId", component: VideoplayerComponent, canActivate: [AuthGuard]},
    {path: "legal-notice", component: LegalNoticeComponent},
    {path: "privacy-policy", component: PrivacyPolicyComponent},
    {path: '**', component: NotFoundComponent } // 404-Seite
];
