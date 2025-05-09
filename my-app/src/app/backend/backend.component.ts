import { ChangeDetectorRef, Component , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { HomeComponent } from '../home/home.component';
import { AboutComponent } from '../about/about.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { CareerComponent } from '../career/career.component';
import { ContactComponent } from '../contact/contact.component';
import { AppComponent } from "../app.component";
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';


interface Banner {
  imageUrl: string;
  galleryurl:string;
  itemId: number;
  fileName: string;
  image: string;
  fileType: string;
  content: string;
  isEditing?: boolean;
  tempContent?: string;
  textContent: string;
  item_id: number;
  userId:number;
  pagename:string;
}
interface Resume {
  id: number;
  resumeId: number;
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  mobileNo: string;
  emailId: string;
  location: string;
  fileName: string;
  downloadUrl: string;
}
interface Inquiry {
  inquiry_id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  isactive: boolean; 
}

@Component({
  selector: 'app-backend',
  imports: [FormsModule, CommonModule, HomeComponent, AboutComponent, GalleryComponent, CareerComponent, ContactComponent, AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './backend.component.html',
  styleUrl: './backend.component.css'
})
export class BackendComponent {
  isBackend = true; // Set to true only in the backend component

  private apiUrl = 'http://localhost:5248/api/HomeBanner';
  currentRoute: string = '';
  banners: any;
  users: any[] = [];
  title: string = '';
  description: string = '';
  visibleCount = 4; // Initially show 4 resumes
  loadMoreStep = 4; // Load 4 more on each click
  resumes: Resume[] = [];
  galleryItems: any[] = [];
  contactSubmissions:Inquiry[] = [];
  totalUsers:number=0;
  showUploadForm:boolean= false;
  showUpdateForm:boolean= false;
  showupdateForm:boolean = false;
  showPreview: boolean = false;
  isSidebarOpen: boolean = false;
  userRole: string = ''; // Holds the logged-in user's role
  panelTitle: string = ''; // Will hold "Admin Panel" or "Editor Panel"
  backgroundImageUrl:string='';
  previewImageUrl: string = '';
  newImage: {
    image: any; name: string; url: string;Item_id:number, item_id:number;item_Id:number; userId:number,textContent:string,pagename:string,fileName:string} 
    = { name: '', url: '' ,image:'',Item_id:0, item_id:0,item_Id:0, userId:0,textContent:'',pagename:'',fileName:''};
itemId: number|undefined;
resumeId:number|undefined;

// totalusers: number = 100; 
activeUsers: number = 0;
InactiveUsers :number = 0;
constructor(private authService: AuthService, private router: Router, private cdr:ChangeDetectorRef,private http:HttpClient){}
  
toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}
showPage(page: string) {
  this.selectedPage = page;  
}

loadMore() {
  if (this.visibleCount === 4 && this.resumes.length > 4) {
    this.visibleCount = this.resumes.length; // Show all resumes
  }
}
showLess() {
 if(this.visibleCount > 4){
  this.visibleCount -=this.loadMoreStep;
  if(this.visibleCount < 4){
    this.visibleCount = 4;
  }
 }
}
  selectedPage: string = 'Admin'; // Default page content
  
  ngOnInit() {
    this.getUserRole();
    this.fetchResumes(); 
    this.fetchImages();
    this.fetchGalleryItems();
    this.fetchusers();//check for activate nd inactive user for chart
    this.fetchInquiries();
    this.fetchUsers();// get the users from register table
    // this.createUserChart();

    fetch(this.apiUrl)
      .then((response) => response.json())
      .then((data: Banner[]) => {
        this.banners = data.map((banner) => ({
          ...banner,
          imageUrl: `http://localhost:5248/api/HomeBanner/download${banner.item_id}`,
          content: banner.textContent || 'No content available',
        }));
        console.log('Fetched banners:', this.banners); // Debugging Log
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
      });
  }

getUserRole() {
  this.authService.getUserRole().subscribe((role) => {
    if (role) {
      this.userRole = role; 
      this.panelTitle = role === 'Admin' ? 'Admin Panel' : 'Editor Panel';
    }
    this.cdr.detectChanges(); // Ensures Angular detects changes after async call
  });
}


previewImage(image: any) {
  console.log('Preview Image:', image);

  this.previewImageUrl = `http://localhost:5248/api/ContentMaster/images/download/${image.itemId}?userid=${image.userId}&pagename=${image.pagename}`;
  this.showPreview = true;
}

closePreview() {
  this.showPreview = false;
}
  
canUpload(): boolean {
   return this.userRole === 'Admin';
}

  fetchUsers() {
    this.http.get<any[]>(`http://localhost:5248/api/Register/getusers`).subscribe(
      (response) => {
        this.users = response.map(user => ({
          ...user,
          Role: user.Role, 
          canEdit: user.user_Id !== 8 ,
          canDeactivate:user.user_Id !== 8
        }));
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  changeUserRole(user: any): void {
    const newRole = user.role === 'User' ? 'Editor' : 'User';

    const updatedRole = { role: newRole };

    this.http.put(`http://localhost:5248/api/Register/UpdateUserRole?userid=${user.user_Id}&username=${user.username}`,updatedRole)
      .subscribe(
        (response: any) => {
          if (response && response.role) {
            user.role = response.role; // Update UI with new role
          }
        },
        (error) => {
          console.error('Error updating user role:', error);
        }
      );
}

// <--------deacticvateuser------> 
async deactivateuser(user: any): Promise<void> {
  console.log("Deactivating user with ID:", user.user_Id);

  const confirmDeactivation = confirm(`Are you sure you want to deactivate user ${user.user_Id}?`);
  if (!confirmDeactivation) {
    return;
  }

  this.http.delete<{ user_Id: number }>(`http://localhost:5248/api/Register/${user.user_Id}`)
    .subscribe({
      next: () => {
        alert(`Successfully deactivated user with user ID: ${user.user_Id}`);
        // Optional: refresh user list
        // this.loadUsers();
      },
      error: (err) => {
        alert(`Failed to deactivate user. Error: ${err.message}`);
      }
    });
}


//fetch contact details ----------->
  fetchInquiries() {
    fetch('http://localhost:5248/api/ContentMaster/getinquiries')
      .then(response => response.json())
      .then((data: Inquiry[]) => {
        this.contactSubmissions = data.map(({ isactive, ...rest }) => rest as Inquiry); // Exclude isactive
      })
      .catch(error => console.error('Error fetching inquiries:', error));
  }

  deleteInquiry(id: number) {
    if (!confirm("Are you sure you want to delete this inquiry?")) {
      return; 
    }
  
    fetch(`http://localhost:5248/api/ContentMaster/deleteinquiry/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        this.contactSubmissions = this.contactSubmissions.filter(inquiry => inquiry.inquiry_id !== id);
      } else {
        console.error('Failed to delete inquiry');
      }
    })
    .catch(error => console.error('Error deleting inquiry:', error));
  }
  
  // fetch user number------->
  fetchusers() {
    fetch('http://localhost:5248/api/Register/total-users')
      .then(response => response.json())
      .then(data => {
        this.totalUsers = data.totalUsers;
        this.activeUsers = data.activeUsers; 
        this.InactiveUsers = data.totalUsers - data.activeUsers;
        this.cdr.detectChanges(); 
        this.createUserChart();
      })
      .catch(error => {
        console.error("Error fetching total users:", error);
      });
  }
  
  chartInstance: any; // Store chart instance to destroy before re-creating

  createUserChart() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn("Skipping chart creation: Not running in a browser.");
      return;
    }
    setTimeout(() => {
      const canvas = document.getElementById('userChart') as HTMLCanvasElement;
      if (!canvas) {
        console.error("Canvas element not found!");
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Cannot acquire 2D context from canvas!");
        return;
      }
  
      // Destroy previous chart instance if it exists
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
  
      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active Users', 'Inactive Users'],
          datasets: [{
            data: [this.activeUsers, this.totalUsers - this.activeUsers],
            backgroundColor: ['green', 'gray'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }, 0);
  }
  
  saveContentToDatabase() {
    console.log("Saving content:", this.title, this.description, this.banners);
  }

// gallery page new image upload------>
  ToggleUploadForm(event: Event): void {
    event.preventDefault();
    this.showUploadForm = !this.showUploadForm;
  
    // Reset form fields when closing
    if (!this.showUploadForm) {
    }
  }
  
  // Handle image upload
  async uploadImage(): Promise<void> {
    if (!this.newImage.name || !this.newImage.image) {
      alert('Please fill in all fields.');
      return;
    }
  
    const formData = new FormData();
    const byteString = atob(this.newImage.image.split(',')[1]);
    const u8arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8arr[i] = byteString.charCodeAt(i);
    }
  
    formData.append('file', new File([u8arr], this.newImage.name, { type: 'image/webp' }));
  
    try {
      const userId = 4; // Replace with actual user ID
      const response = await fetch(`http://localhost:5248/api/ContentMaster/gallery/upload/${userId}`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) throw new Error('Failed to upload image');
      const jsonResponse = await response.json();
      alert(`Image uploaded successfully! Item ID: ${jsonResponse.itemId}`);
  
      this.galleryItems.push({ id: Date.now(), image: this.newImage.image, name: this.newImage.name });
      this.showUploadForm = false;
      const newImage = { name: '', image: '' ,Item_id:0, userId:0};
    } catch (error) {
      console.error('Error uploading image', error);
    }
  }




//gallery section-------------->
async fetchGalleryItems() {
  try {
    const response = await fetch('http://localhost:5248/api/ContentMaster/gallery');
    if (!response.ok) {
      throw new Error('Failed to fetch gallery data');
    }
    console.log(response);
    const data = await response.json();  

    this.galleryItems = data.map((item: any) => ({
      itemId: item.item_Id,  
      userId: item.userId,
      fileName: item.fileName,
      image: `http://localhost:5248${item.imageUrl}`, 
    }));    
    
  } catch (error) {
    console.error('Error fetching gallery data:', error);
  }
}


Editimage(item: any) {
  if (!item) return;
  console.log('Editing item:', item); // Debugging
  this.newImage.item_id = item.itemId;
  this.newImage.userId = 4; // Replace with actual user ID
  this.newImage.name = item.fileName; // Ensure correct assignment
  this.newImage.image = item.image;

  this.showupdateForm = true;     
}

toggleupdateForm(event: Event): void {
  event.preventDefault();
  this.showupdateForm = false;
  // this.newImage = { item_id: 0, userId: 0, fileName: '', image: '' };
}

  // Handle image file selection
  ONImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (File) {
      this.newImage.fileName = File.name; // Extract and set the filename
    }
    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newImage.image = e.target?.result as string; // Store base64 image data
      };
      reader.readAsDataURL(file);
    }
  }

  async updateImage(): Promise<void> {
    if (!this.newImage.image || !this.newImage.item_id || !this.newImage.userId) {
      alert('Please ensure all fields are correct'); 
      return;
    }
  
    const formData = new FormData();
    
    // Generate new filename
    const newFileName =this.newImage.name; 
  
    // Convert base64 to Blob
    const byteString = atob(this.newImage.image.split(',')[1]);
    const u8arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8arr[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([u8arr], { type: 'image/webp' });
  
    // Append file with new filename
    formData.append('file', new File([blob], newFileName, { type: 'image/webp' }));
    formData.append('fileName', newFileName); // Explicitly send filename
    formData.append('Item_id', this.newImage.item_id.toString());
    formData.append('UserId', this.newImage.userId.toString());
  
    console.log('Sending data:', {
      fileName: newFileName, 
      itemId: this.newImage.item_id,
      userId: this.newImage.userId
    });
  
    const apiUrl = `http://localhost:5248/api/ContentMaster/galleryUpdate/${this.newImage.item_id}?userId=${this.newImage.userId}`;
    
    try {
      const response = await fetch(apiUrl, { method: 'PUT', body: formData });
  
      if (!response.ok) {
        throw new Error('Image update failed');
      }
      alert('Image updated successfully!');
      this.showupdateForm = false;
  
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image. Please try again.');
    }
  }

  async deleteImage(itemId: number | undefined): Promise<void> {
    console.log("Deleting image with ID:", itemId);  // Debugging output
  
    if (!itemId) {
      console.error("Error: Image ID is undefined");
      return;
    }
  
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5248/api/ContentMaster/gallery/delete/${itemId}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) throw new Error('Failed to delete image');
  
      // Remove deleted image from the list
      this.galleryItems = this.galleryItems.filter(item => item.id !== itemId);
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }


  // home page image edit---------------->
  editImage(banner: Banner) {
    if (banner.item_id && banner.item_id !== 0) {
      this.newImage.item_id = banner.item_id;
    } else {
      console.error('Item ID is invalid:', banner.item_id);
    }
  
    this.newImage.userId = banner.userId; // Replace with actual logged-in user ID
    
    console.log('Assigned Item ID:', banner.item_id);
    console.log('Assigned User ID:',this.newImage.userId);
  
    this.showUploadForm = true;
  }
  
    toggleUploadForm(event: Event, page?: 'Home' | 'Gallery'): void {
      event.preventDefault();
      
      // Toggle the form visibility
      this.showUploadForm = !this.showUploadForm;
    
      // If opening, set the selected page
      if (page) {
        this.selectedPage = page; // Keep the page value
      }
    }
  

  Updateimage(): void { 
    if (!this.newImage.image || !this.newImage.item_id || !this.newImage.userId) {
      alert('Please ensure all required fields are filled.');
      return;
    }
  
    const formData = new FormData();
  
    // Convert base64 image to Blob
    const byteString = atob(this.newImage.image.split(',')[1]);
    const mimeString = this.newImage.image.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type
    const u8arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8arr[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([u8arr], { type: mimeString }); 
    formData.append('file', new File([blob], 'image.' + mimeString.split('/')[1], { type: mimeString }));
  
    // Append other fields
    formData.append('itemId', this.newImage.item_id.toString());
    formData.append('userId', this.newImage.userId.toString());
    formData.append('textContent', this.newImage.textContent || ''); 
  
    // **Properly encode textContent in URL**
    const encodedTextContent = encodeURIComponent(this.newImage.textContent || '');
    const apiUrl = `http://localhost:5248/api/HomeBanner/updateimage/${this.newImage.item_id}?userId=${this.newImage.userId}&textContent=${encodedTextContent}`;
  
    fetch(apiUrl, {
      method: 'PUT',
      body: formData,
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not OK');
      return response.json();
    })
    .then(response => {
      console.log('Image and text updated successfully:', response);
      alert('Image updated successfully!');
      this.showUploadForm = false;
  
      // Refresh banners list after updating
      this.ngOnInit();
    })
    .catch(error => {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    });
  }
  
  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newImage.image = e.target?.result as string; // Store base64 image data
      };
      reader.readAsDataURL(file);
    }
  }


images: { itemId: number; userId: number; pagename: string; fileName: string }[] = [];


//Admin background image-------------->
toggleUpdateForm(item?: { itemid: number; userid: number; pagename: string }) { 
  if (item) {

    this.newImage.item_id = item.itemid; 
    this.newImage.userId = item.userid;
    this.newImage.pagename = item.pagename;

    console.log("After Assigning - newImage:", this.newImage); // Check if values are assigned
    this.showUpdateForm = true;
  } else {
    this.showUpdateForm = false;
  }
}


EditImage(images: { pagename: string; fileName: string; userId: number; itemId: number }) {
  console.log("Editing Image - Item ID:", images.itemId); // Debugging

  this.newImage.item_id = images.itemId;
  this.newImage.userId = images.userId;
  this.newImage.fileName = images.fileName;
  this.newImage.pagename = images.pagename;

  this.showUpdateForm = true;
}

fetchImages() {
  const apiUrl = 'http://localhost:5248/api/ContentMaster/getimages';

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return response.json();
    })
    .then((data) => {
      this.images = data.map((image: any) => ({
        itemId: image.itemId,
        userId: image.userId,
        fileName:image.fileName,
        pagename: image.pagename,

      }));
      console.log('Fetched images:', this.images);
    })
    .catch(error => {
      console.error('Error fetching images:', error);
    });
}


uploadimage(): void {  
  if (!this.newImage.image || !this.newImage.item_id || !this.newImage.userId) {
    alert('Please ensure all required fields are filled.');
    return;
  }

  const formData = new FormData();

  // Convert base64 image to Blob
  const byteString = atob(this.newImage.image.split(',')[1]);
  const mimeString = this.newImage.image.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type
  const u8arr = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    u8arr[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([u8arr], { type: mimeString }); 
  formData.append('file', new File([blob], 'image.' + mimeString.split('/')[1], { type: mimeString }));

  // Append other fields
  formData.append('itemId', this.newImage.item_id.toString());
  formData.append('userId', this.newImage.userId.toString());
  formData.append('pagename', this.newImage.pagename || ''); // Ensure pagename is not undefined

  // Properly encode textContent in URL

  const apiUrl = `http://localhost:5248/api/ContentMaster/updateimage/${this.newImage.item_id}?userId=${this.newImage.userId}&pagename=${this.newImage.pagename}`;

  console.log("Uploading Image to:", apiUrl);

  fetch(apiUrl, {
    method: 'PUT',
    body: formData,
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not OK');
    return response.json();
  })
  .then(response => {
    console.log('Image and text updated successfully:', response);
    alert('Image updated successfully!');
    this.showUpdateForm = false;
    // Refresh the background image after updating

  })
  .catch(error => {
    console.error('Error uploading image:', error);
    alert('Error uploading image. Please try again.');
  });
} 

// Career page -------> 
downloadResume(resumeId: number, fileName: string) {
  fetch(`http://localhost:5248/api/ContentMaster/getresume?ResumeId=${resumeId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary <a> element for downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; 
      document.body.appendChild(a);
      a.click(); 
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error("Error downloading resume:", error);
    });
}

  // get all resume details-------->
  fetchResumes() {
    fetch('http://localhost:5248/api/ContentMaster/resumes')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Resume[]) => {
        this.resumes = data;
        console.log("Resumes fetched:", this.resumes);
      })
      .catch(error => {
        console.error("Error fetching resumes:", error);
      });
  }
  
async deleteResume(resumeId: number | undefined): Promise<void> {
  console.log("Deleting resume with ID:", resumeId); // Debugging output
  if (!resumeId) {
    console.error("Error: Resume ID is undefined");
    return;
  }

  if (!confirm('Are you sure you want to delete this Resume?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5248/api/ContentMaster/resumes/${resumeId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete Resume');

    // Remove deleted resume from the list
    this.resumes = this.resumes.filter(item => item.resumeId !== resumeId);
    alert('Resume deleted successfully');
  } catch (error) {
    console.error('Error deleting Resume:', error);
  }
}

  logout() {
    const confirmation = confirm("Are you sure you want to sign out?");
    if (confirmation) {
      this.authService.logout();
      this.router.navigate(['/home']); 
    }
  }
}