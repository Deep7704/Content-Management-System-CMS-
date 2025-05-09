import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2'; // ✅ Correct package
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptor/auth.interceptor'; // <--- FUNCTION import

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideMonacoEditor(), // ✅ Use from ngx-monaco-editor-v2
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), // <--- FUNCTION provider
    provideClientHydration(withEventReplay()),
    {
      provide: 'API_URL',
      useValue: 'http://localhost:5248/api' // Replace with your API URL if needed
    },
  ]
};