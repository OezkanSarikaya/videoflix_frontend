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
    if (this.authService.isLoggedIn()) {
      return true;
    } else if (this.authService.isRefreshTokenAvailable()) {
      return this.authService
        .refreshToken()
        .toPromise()
        .then(() => {
          return true;
        })
        .catch((err) => {
          this.router.navigate(['/login']);
          return false;
        });
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
