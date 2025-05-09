import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.cookieService.get('token');
    const userRole = this.cookieService.get('userRole'); // Getting role from cookie

    console.log('AuthGuard Check - Token:', token, 'Role:', userRole);

    if (!token || !userRole) {
      // console.warn('No token or role found, redirecting to login...');
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['role'];


    if (Array.isArray(expectedRole)) {
      const matchFound = expectedRole.some(role => role.toLowerCase() === userRole.toLowerCase());
      if (!matchFound) {
        console.log(`Role mismatch. Expected one of: ${expectedRole}, Found: ${userRole}. Redirecting to login...`);
        this.router.navigate(['/login']);
        return false;
      }
    } else {
          // Convert both roles to lowercase for case-insensitive comparison
      if (expectedRole.toLowerCase() !== userRole.toLowerCase()) {
        console.log(`Role mismatch. Expected: ${expectedRole}, Found: ${userRole}. Redirecting to login...`);
        this.router.navigate(['/login']);
        return false;
      }
    }
    
    return true;
  }
}