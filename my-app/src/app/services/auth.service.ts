import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'; // Import CookieService

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl = 'http://localhost:5248/api/Login/Login';
  private readonly registerUrl = 'http://localhost:5248/api/Register';
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService, // Inject CookieService
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize from cookie only in the browser
      const storedToken = this.cookieService.get('token');
      const storedRole = this.cookieService.get('userRole');

      this.tokenSubject.next(storedToken);
      this.userRoleSubject.next(storedRole);
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials).pipe(
      tap(response => {
        if (response && response.token && response.role) {
          this.cookieService.set('token', response.token);
          this.cookieService.set('userRole', response.role);
  
        console.log("token settled:",response.token);
        console.log("token settled:",response.role)

          this.tokenSubject.next(response.token);
          this.userRoleSubject.next(response.role);
  
          // Redirect based on role
          if (response.role === 'admin') {
            this.router.navigate(['/backend/admin']);
          } else if (response.role === 'editor') {
            this.router.navigate(['/backend/editor']);
          } else {
            this.router.navigate(['/profile']);
          }
        }
      }),
      catchError(this.handleError)
    );
  }
  

  getToken(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  isAdmin(): Observable<boolean> {
    return this.userRoleSubject.asObservable().pipe(
      map(role => role === 'admin')
    );
  }
  getUserRole(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.delete('token');
      this.cookieService.delete('userRole');
    }

    this.tokenSubject.next(null);
    this.userRoleSubject.next(null);
    console.log('Removed token');
    this.router.navigate(['/login']);
  }

  addAuthorizationHeader(headers: HttpHeaders): HttpHeaders {
    const token = this.tokenSubject.value;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  signup(userData: any): Observable<any> {
    return this.http.post<any>(this.registerUrl, userData).pipe(
      tap(response => {
        console.log('Signup successful:', response);
      }),
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    const errorMessages: { [key: number]: string } = {
      400: 'Invalid input! Please check your details.',
      401: 'Unauthorized! Please check your credentials.',
      403: 'Forbidden! You do not have permission.',
      404: 'Resource not found!',
      409: 'Conflict! This email or mobile number is already registered.',
      413: 'File size too large! Please upload a smaller file.',
      415: 'Unsupported file type! Please upload a valid format.',
      422: 'Invalid input! Please follow the required format.',
      429: 'Too many attempts! Please try again later.',
      503: 'Service unavailable! Please try again later.'
    };
  
    let errorMessage = errorMessages[error.status] || `Unexpected Error: ${error.message}`;
  
    // Handle server errors (500)
    if (error.status === 500) {
      if (error.error?.includes('23505')) {
        if (error.error?.includes('email_id')) {
          errorMessage = 'Error: This email is already registered.';
        } else if (error.error?.includes('mobilenumber')) {
          errorMessage = 'Error: This mobile number is already registered.';
        } else {
          errorMessage = 'Error: Duplicate entry detected! Please check your inputs.';
        }
      } else {
        errorMessage = 'Internal Server Error! Please try again later.';
      }
    }
  
    // Handle network errors
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    }
  
    console.error(`Error (${error.status}):`, errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  
}
