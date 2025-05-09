import { Component, HostListener,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports:[CommonModule],
  styleUrls: ['./intro.component.css'] // Ensure the styleUrls array is correct
})

export class IntroComponent implements OnInit{
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    console.log('Menu open:', this.menuOpen); 
  }
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the menu and toggle button
    if (!targetElement.closest('.nav-links') && !targetElement.closest('.menu-icon')) {
      this.menuOpen = false;
    }
  }
  constructor(private router: Router,private http:HttpClient) {}

  footerData: FooterData = {
    id: 1,
    websiteTitle: 'Content Management System',
    email: 'cms@software.com',
    copyrightText: 'Copyright © 2025 by Trusted company, India',
    socialLinks: {
      Twitter: '',
      Facebook: '',
      Instagram: '',
      Linkedin: ''
    },
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

  ngOnInit(): void {
    this.fetchFooterData();
  }
  fetchFooterData(): void {
    this.http.get<FooterData>('http://localhost:5248/api/ContentMaster/footer?id=1').subscribe({
      next: (data) => {
        this.footerData = data;
        console.log("foogter data",data)
      },
      error: (err) => {
        console.error('Error fetching footer data:', err);
      }
    });
  }
  
  // Method to navigate to the login page
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
