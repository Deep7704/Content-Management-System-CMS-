import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:5248/api/Login/Login';

  constructor(private http: HttpClient) {}

  login(loginData: any): Observable<any> {
    return this.http.post(this.apiUrl, loginData, { withCredentials: true });
  }
}
