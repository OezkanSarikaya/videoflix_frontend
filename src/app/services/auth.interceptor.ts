import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let accessToken = localStorage.getItem('accessToken');
    console.log('Interceptor: Checking for access token');

    if (accessToken) {
      console.log('Interceptor: Access token found, adding to request');
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } else {
      console.log('Interceptor: No access token found');
    }

    return next.handle(req).pipe(
      catchError(err => {
        console.log('Interceptor: Error occurred', err);
        if (err.status === 401) {
          console.log('Interceptor: Token expired, refreshing token');
          return this.authService.refreshToken().pipe(
            switchMap(tokens => {
              console.log('Interceptor: Tokens refreshed', tokens);
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokens.access}`
                }
              });
              return next.handle(req);
            }),
            catchError(refreshError => {
              console.log('Interceptor: Refresh token failed', refreshError);
              this.authService.logout();  // Falls der Refresh Token ungültig ist
              return throwError(refreshError);
            })
          );
        }
        return throwError(err);
      })
    );
  }
}
