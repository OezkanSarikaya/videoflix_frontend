import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<boolean> | Promise<boolean> | boolean {



  //   console.log('🔍 AuthGuard aktiviert');
  //   console.log('🔗 Aktuelle URL:', state.url);
  //   console.log('🔑 Eingeloggt:', this.authService.isLoggedIn());
  //   console.log('🔄 Refresh-Token verfügbar:', this.authService.isRefreshTokenAvailable());


  //   const isLoggedIn = this.authService.isLoggedIn();  
  //   const isAuthPage = next.routeConfig?.path === 'login' || next.routeConfig?.path === 'signup'  ;

  //   if (isLoggedIn && isAuthPage) {
  //     console.log('🔒 Eingeloggt und versucht auf eine Auth-Seite zuzugreifen:', next.routeConfig?.path);
  //     if (state.url !== '/videos') {
  //       console.log('➡️ Weiterleitung zu /videos');
  //     this.router.navigate(['/videos']); // Weiterleitung zu /videos
  //   } else {
  //     console.log('🔁 Bereits auf /videos, keine Weiterleitung notwendig');
  //   }
  //     return false;
  //   }

  //   // Falls der Nutzer bereits eingeloggt ist, normalen Zugriff erlauben
  //   if (isLoggedIn) {
  //     console.log('✅ Zugriff erlaubt, eingeloggt');
  //     return true;
  //   }
    
  //   if (this.authService.isRefreshTokenAvailable()) {
  //     return this.authService
  //       .refreshToken()
  //       .toPromise()
  //       .then(() => {
  //         console.log('✅ Refresh-Token erfolgreich, Zugriff erlaubt');
  //         return true;
  //       })
  //       .catch((err) => {
  //         console.error('❌ Refresh-Token fehlgeschlagen, weiter zu /login', err);
  //         this.router.navigate(['/login']);
  //         return false;
  //       });
  //   } else {
  //     console.log('🚪 Nicht eingeloggt, weiter zu /login');
  //     this.router.navigate(['/login']);
  //     return false;
  //   }
  // }



  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log('🔍 AuthGuard aktiviert');
    console.log('🔗 Aktuelle URL:', state.url);
    console.log('🔑 Eingeloggt:', this.authService.isLoggedIn());
    console.log('🔄 Refresh-Token verfügbar:', this.authService.isRefreshTokenAvailable());
  
    const isLoggedIn = this.authService.isLoggedIn();
    const isAuthPage = next.routeConfig?.path === 'login' || next.routeConfig?.path === 'signup' || next.routeConfig?.path === '';
  
    // ✅ Wenn der User eingeloggt ist und zur Login/Signup-Seite will → Umleiten zu /videos
    if (isLoggedIn && isAuthPage) {
      console.log('🔒 Eingeloggt und versucht auf eine Auth-Seite zuzugreifen:', next.routeConfig?.path);
      this.router.navigate(['/videos']);
      return false;
    }
  
    // ✅ Wenn der User NICHT eingeloggt ist und auf Login oder Signup geht → ERLAUBEN!
    if (!isLoggedIn && isAuthPage) {
      console.log('🔓 Nicht eingeloggt, aber will sich einloggen → Zugriff erlaubt');
      return true;
    }
  
    // ✅ Eingeloggt → Zugriff auf geschützte Seite gewähren
    if (isLoggedIn) {
      console.log('✅ Zugriff erlaubt, eingeloggt');
      return true;
    }
  
    // ❌ Nicht eingeloggt + versucht auf eine geschützte Seite zuzugreifen → Weiterleiten
    console.log('🚪 Nicht eingeloggt, weiter zu /login');
  
    if (state.url !== '/login') {
      this.router.navigate(['/login']);
    } else {
      console.log('🔁 Schon auf /login, keine erneute Umleitung');
    }
  
    return false;
  }
  
  


}
