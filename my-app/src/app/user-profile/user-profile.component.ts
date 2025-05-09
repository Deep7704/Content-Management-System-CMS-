import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  editableUser: any = {};
  editing: any = {};
  errors: any = {}; // Store validation errors
  loading: boolean = false;
  showPassword: boolean = false;

  togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
  }
  
  constructor(private http: HttpClient, private authService:AuthService, private router:Router,private cookieservice:CookieService) {}

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser() {
    const userId =this. cookieservice.get('user_Id');
    if (!userId) {
      console.error('No user ID found. Please log in first.');
      return;
    }
  
    this.http.get<any>(`http://localhost:5248/api/Register/getuser/${userId}`).subscribe(
      (data) => {
        const matchedUser = data.find((user: any) => user.user_Id == userId);
        if (!matchedUser) {
          console.error(`User with ID ${userId} not found.`);
          return;
        }
        this.user = { ...matchedUser };
      },
      (error) => {
        console.error('Failed to load user data', error);
      }
    );
  }
  
  toggleEdit(field: string) {
    this.editing[field] = !this.editing[field];
    if (this.editing[field]) {
      this.editableUser[field] = this.user[field];
    }
  }

  validateFields(): boolean {
    this.errors = {}; // Reset errors

    const nameRegex = /^[A-Za-z]+$/;
    ["firstname", "middlename", "lastname", "username"].forEach(field => {
      if (this.editableUser[field] && !nameRegex.test(this.editableUser[field])) {
        this.errors[field] = `${field.replace(/^\w/, c => c.toUpperCase())} should contain only letters.or username may be exist`;
      }
    });    

    // Mobile Number Validation
    const mobileRegex = /^(?!.*(\d)\1{9})[0-9]{10}$/; // Ensures no continuous numbers
    if (this.editableUser.mobilenumber && !mobileRegex.test(this.editableUser.mobilenumber)) {
      this.errors.mobilenumber = 'Mobile number must be exactly 10 digits and cannot contain repeated digits.';
    }

    // Email Validation (Lowercase and no "..")
    const email = this.editableUser.email_id;
    if (email && (email !== email.toLowerCase() || email.includes('..') || !/^[a-z0-9._%+-]+@[a-z]+\.[a-z]{2,}$/.test(email))) {
      this.errors.email_id = 'Email must be in lowercase and in a valid format.';
    }

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;<>?,.]).{8,}$/;
    if (this.editableUser.password && !passwordRegex.test(this.editableUser.password)) {
      this.errors.password = 'Password must be at least 8 characters, contain one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    return Object.keys(this.errors).length === 0;
  }

  saveChanges() {
    if (!this.validateFields()) {
      alert('Please fix your details before saving.');
      return;
    }
  
    this.loading = true;
    const userId = this.user.user_Id;
  
    let updatedUser: any = {
      user_Id: userId,
      firstname: this.editableUser.firstname ?? this.user.firstname,
      middlename: this.editableUser.middlename ?? this.user.middlename,
      lastname: this.editableUser.lastname ?? this.user.lastname,
      username: this.editableUser.username ?? this.user.username,
      mobilenumber: this.editableUser.mobilenumber ?? this.user.mobilenumber,
      email_id: this.editableUser.email_id ?? this.user.email_id,
      password: this.editableUser.password !== undefined ? this.editableUser.password : this.user.password
    };
  
    this.http.patch(`http://localhost:5248/api/Register/UpdateUser?userid=${userId}`, updatedUser).subscribe(
      () => {
        Object.assign(this.user, updatedUser);
        this.editableUser = {};
        this.editing = {};
        alert('User details updated successfully!');
        this.loading = false;
      },
      (error) => {
        if (error.error && error.error.Username) {
          this.errors.username = error.error.Username[0]; // Show error under the username field
        } else {
          alert("An error occurred: " + (error.error.message || "Unknown error"));
        }     
        this.loading = false;
      }
    );
  }
  logout() {
    const confirmation = confirm("Are you sure you want to sign out?");
    if (confirmation) {
      this.authService.logout();
      this.router.navigate(['/home']); 
    }
  }  
  
}  