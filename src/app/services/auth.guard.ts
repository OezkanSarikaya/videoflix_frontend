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

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const isAuthPage =
      next.routeConfig?.path === 'login' ||
      next.routeConfig?.path === 'signup' ||
      next.routeConfig?.path === '';

    // ✅ Wenn der User eingeloggt ist und zur Login/Signup/Start-Seite will → Umleiten zu /videos
    if (isLoggedIn && isAuthPage) {
      this.router.navigate(['/videos']);
      return false;
    }

    // ✅ Wenn der User NICHT eingeloggt ist und auf Login oder Signup geht → ERLAUBEN!
    if (!isLoggedIn && isAuthPage) {
      return true;
    }

    // ✅ Eingeloggt → Zugriff auf geschützte Seite gewähren
    if (isLoggedIn) {
      return true;
    }

    if (this.authService.isRefreshTokenAvailable()) {
      return this.authService
        .refreshToken()
        .toPromise()
        .then(() => {
          // console.log('✅ Refresh-Token erfolgreich, Zugriff erlaubt');
          return true;
        })
        .catch((err) => {
          // console.error(
          //   '❌ Refresh-Token fehlgeschlagen, weiter zu /login',
          //   err
          // );
          this.router.navigate(['/login']);
          return false;
        });
    } else {
      // console.log('🚪 Nicht eingeloggt, weiter zu /login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
