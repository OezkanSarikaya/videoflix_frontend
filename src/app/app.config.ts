import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { AuthInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),  // HTTP-Client bereitstellen
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,  // AuthInterceptor bereitstellen
      multi: true,  // Erlaubt mehrere Interceptors
    },
  ],
};
