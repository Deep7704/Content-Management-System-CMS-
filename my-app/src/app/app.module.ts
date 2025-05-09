import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  // Import this line

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';  // Update with your component path

@NgModule({
  declarations: [
    
  ],
  imports: [

    ReactiveFormsModule,  // Add this to the imports array
  ],
  providers: [],

})
export class AppModule { }
