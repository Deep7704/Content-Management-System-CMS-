import { Component , CUSTOM_ELEMENTS_SCHEMA, Input,HostListener} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

interface SocialLinks {
  Twitter?: string;
  Facebook?: string;
  Instagram?: string;
  Linkedin?: string;
}

interface FooterLinks {
  Legal: { Url: string; Text: string };
  Privacy: { Url: string; Text: string };
}

interface FooterData {
  id: number;
  websiteTitle: string;
  email: string;
  copyrightText: string;
  socialLinks: SocialLinks;
  footerLinks: FooterLinks;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  menuOpen = false; // initial state of the menu

  toggleMenu() {
    this.menuOpen = !this.menuOpen; // toogleMenu fuction
  }

  @Input() isfooter:boolean  = false;
  @Input() shownavbar:boolean  = true;
  isScrolled = false;

  showFooter: boolean = true; // Add this line
  editing: boolean = false;
  updatedFooter: any = {};
  isAdmin:boolean = true;
  title:string = 'my-app';
  private isAdminSubscription : Subscription | undefined;
  showHeaderFooter: boolean = true;
  constructor(public authService: AuthService, private router: Router,private http:HttpClient) {
    this.router.events.subscribe(() => {
      // Hide navbar if the route is "/backend", "/Login", or "/"
      this.shownavbar = !(this.router.url === '/backend/admin' ||this.router.url === '/backend/editor'|| this.router.url === '/backend'|| this.router.url === '/login' || this.router.url === '/');
      this.showHeaderFooter =!(this.router.url ==='/login')
      this.showFooter = !(this.router.url === '/backend/admin' || this.router.url === '/backend/editor' || this.router.url === '/backend' || this.router.url==='/');  // Add this line
    });
  }
  footerData: FooterData = {
    id: 1,
    websiteTitle: 'Content Management System',
    email: 'cms@software.com',
    copyrightText: 'Copyright © 2025 by Trusted company, India',
    socialLinks: {},
    footerLinks: {
      Legal: {
        Url: '',
        Text: ''
      },
      Privacy: {
        Url: '',
        Text: ''
      }
    }
  }; 
  debugNavigation(route: string) {
    // console.log('Navigating to:', route);n
  }
 
  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }
  
  ngOnInit(): void {
    this.fetchFooterData();
    // const token = localStorage.getItem('token');
    // const role = localStorage.getItem('role');
    this.isAdminSubscription = this.authService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }
  toggleEdit() {
    this.editing = !this.editing;
    if (this.editing) {
      this.updatedFooter = JSON.parse(JSON.stringify(this.footerData)); // Deep copy to avoid reference issues
    }
  }
  redirectToLogin() {
    this.router.navigate(['/login']); // Always redirect to login page
  }
  

  fetchFooterData(): void {
    this.http.get<FooterData>('http://localhost:5248/api/ContentMaster/footer?id=1').subscribe({
      next: (data) => {
        this.footerData = data;
      },
      error: (err) => {
        console.error('Error fetching footer data:', err);
      }
    });
  }
  ngOnDestroy(): void {
    if (this.isAdminSubscription) {
      this.isAdminSubscription.unsubscribe();
    }
  }
  saveFooter() {
    const requestData = {
      WebsiteTitle: this.updatedFooter.websiteTitle || '',
      Email: this.updatedFooter.email || '',
      CopyrightText: this.updatedFooter.copyrightText || '',
      SocialLinks: {
        Twitter: this.updatedFooter.socialLinks?.Twitter || '',
        Facebook: this.updatedFooter.socialLinks?.Facebook || '',
        Instagram: this.updatedFooter.socialLinks?.Instagram || '',
        Linkedin: this.updatedFooter.socialLinks?.Linkedin || '',
      },
      FooterLinks: {
        Legal: {
          Text: this.updatedFooter.footerLinks?.Legal?.Text || '',
          Url: this.updatedFooter.footerLinks?.Legal?.Url || '',
        },
        Privacy: {
          Text: this.updatedFooter.footerLinks?.Privacy?.Text || '',
          Url: this.updatedFooter.footerLinks?.Privacy?.Url || '',
        }
      }
    };
  
    this.http.put('http://localhost:5248/api/ContentMaster/footer/update', requestData).subscribe({
      next: (response) => {
        console.log('Footer updated successfully:', response);
        this.footerData = { ...this.updatedFooter };
        this.editing = false;
      },
      error: (err) => {
        console.error('Error updating footer:', err);
        alert('Failed to update footer. Please try again.');
      }
    });
  }
}  