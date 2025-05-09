import './monaco-editor-loader'; // must be first

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router'; 
import { routes } from './app/app.routes'; 
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, FormsModule, MonacoEditorModule),
    provideRouter(routes),

    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: {
        baseUrl: 'assets/vs', // ✅ Match angular.json
        defaultOptions: { scrollBeyondLastLine: false },
        onMonacoLoad: () => console.log('Monaco Editor Loaded'),
      },
    },
  ],
}).catch(err => console.error(err));
