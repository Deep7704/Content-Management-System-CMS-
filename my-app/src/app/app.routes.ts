import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { GalleryComponent } from './gallery/gallery.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CareerComponent } from './career/career.component';
import { ContactComponent } from './contact/contact.component';
import { IntroComponent } from './intro/intro.component';
import { BackendComponent } from './backend/backend.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthGuard } from './auth.guard';
export const routes: Routes = [
    { path: 'login', component: LoginComponent },  
    { path: 'home', component: HomeComponent },  // ✅ Correct
    { path: 'About', component: AboutComponent },
    { path: 'Gallery', component: GalleryComponent, canActivate: [AuthGuard], data: { role: ['admin', 'editor','user'] } },
    { path: 'Career', component: CareerComponent },  
    { path: 'Contact', component: ContactComponent },  
    { path: 'backend', component: BackendComponent,canActivate:[AuthGuard] ,data:{role:['admin','editor']}},
    { path: 'backend/admin', component: BackendComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
    { path: 'backend/editor', component: BackendComponent, canActivate: [AuthGuard], data: { role: 'editor' } },
    { 
        path: 'profile', 
        component: UserProfileComponent, 
        canActivate: [AuthGuard], 
        data: { role: 'user' },
        children: [
          { path: '', component: HomeComponent },
          { path: 'Gallery', component: GalleryComponent },
          { path: 'About', component: AboutComponent },
          { path: 'Career', component: CareerComponent },
          { path: 'Contact', component: ContactComponent }
        ]
    },      
    { path: '', component: IntroComponent },  
    { path: '**', redirectTo: '' },  // Catch-all for unknown routes
];

export const AppRoutingModule = RouterModule.forRoot(routes);
