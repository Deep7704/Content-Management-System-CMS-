import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginform!: FormGroup;
  signupform!: FormGroup;
  errorMessage: string | null = null;
  showLogin: boolean = true;
  showsignup: boolean = false;
  showNavbar: boolean = false;
  showLoginPassword: boolean = false;
  showSignupPassword: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cookieservice:CookieService
  ) {}
  welcomeMessage: string | null = null; // Stores welcome text

  ngOnInit(): void {
    this.loginform = this.fb.group({
      user_Id: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.signupform = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z]+$')]],
      middlename: ['', [Validators.pattern('^[a-zA-Z]+$')]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z]+$')]],
      mobilenumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[1-9][0-9]{9}$/) // Matches 10-digit mobile numbers, ensuring the first digit is non-zero.
        ]
      ],
      email_id: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      username: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]]
    });
  }

  get user_Id(): FormControl {
    return this.loginform.get('user_Id') as FormControl;
  }
  get password(): FormControl {
    return this.loginform.get('password') as FormControl;
  }

  get firstname(): FormControl {
    return this.signupform.get('firstname') as FormControl;
  }
  get middlename(): FormControl {
    return this.signupform.get('middlename') as FormControl;
  }
  get lastname(): FormControl {
    return this.signupform.get('lastname') as FormControl;
  }
  get mobilenumber(): FormControl {
    return this.signupform.get('mobilenumber') as FormControl;
  }
  get email_id(): FormControl {
    return this.signupform.get('email_id') as FormControl;
  }
  get username(): FormControl {
    return this.signupform.get('username') as FormControl;
  }
  get passwordup(): FormControl {
    return this.signupform.get('password') as FormControl;
  }

  toggleForm(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.showLogin = !this.showLogin;
    this.showsignup = !this.showsignup;
  }

  togglepassword(type:string){
    if(type=="login"){
      this.showLoginPassword = !this.showLoginPassword;
    }
    else{
      this.showSignupPassword = !this.showSignupPassword;
    }
  }
  signupSubmitted() {
    if (this.signupform.invalid) {
      return;
    }

    const signupData = this.signupform.value;

    this.authService.signup(signupData).subscribe({
      next: (response: { user_Id: any; }) => {
        this.errorMessage = null; // Clear any previous errors

        if (response && response.user_Id) {
          alert(`Signup successful! Your User ID: ${response.user_Id}`);
        } else {
          alert('Signup successful, but User ID not found.');
        }

        this.signupform.reset()
        this.showsignup = false,
        this.showLogin = true
  },
      error: (error:any) => {
        console.error( error);
        alert(error);
        // this.errorMessage = error.error || 'Signup failed. Please try again.';
      }
    });
  }

  getPasswordErrorMessage(): string {
    if (this.passwordup.hasError('required')) {
      return 'Password is required.';
    }
    if (this.passwordup.hasError('minlength')) {
      return 'Password must be at least 8 characters long.';
    }
    if (this.passwordup.hasError('pattern')) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }
    return '';
  }

  loginSubmitted(loginform: any) {
    if (loginform.invalid) return;
  
    const loginData = loginform.value;
  
    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);


        if (response.user_Id) {
          this.cookieservice.set('user_Id', response.user_Id);
        }
  
        let role = response.role?.toLowerCase();
        this.cookieservice.set('userRole', role);   // Store the role in localStorage
        
        let urlFragment = '';
  
        if (role === 'admin') {
          this.welcomeMessage = `Welcome, Admin! Manage your content with ease.`;
          urlFragment = 'admin';
        } else if (role === 'editor') {
          this.welcomeMessage = `Welcome, Editor! Manage your content with ease.`;
          urlFragment = 'editor';
        } else {
          this.welcomeMessage = `Welcome, ${response.username}!`;
          urlFragment = 'user';
        }
  
        console.log('Navigating to:', `/backend/${urlFragment}`);
  
        // Navigate immediately without delay
        if (role === 'admin' || role === 'editor') {
          this.router.navigate([`/backend/${urlFragment}`]);
        } else {
          this.router.navigate(['/profile']);
        }
      },
  
      error: (error: any) => {
        console.error('Login failed:', error);
        this.errorMessage = error.error || 'Login failed. Please try again.';
      }
    });
  }
  
}  