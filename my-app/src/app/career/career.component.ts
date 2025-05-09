import { Component,Input, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';


interface SocialLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

interface FooterLinks {
  legal?: { url: string; text: string };
  privacy?: { url: string; text: string };
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
  selector: 'app-career',
  templateUrl: './career.component.html',
  imports: [CommonModule, FormsModule,MonacoEditorModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./career.component.css'],
})
export class CareerComponent {

    @Input() isadmin: boolean = false;
    @Input() showNavbar: boolean = true;
    @Input() showbgimg:boolean = true;

   @ViewChild('headingInput') headingInput!: ElementRef;
   @ViewChild('textInput') textInput!: ElementRef;
    heading: string = 'hello';
    textcontent: string = '';
    isEditing: boolean = true;
    isEditingHeading: boolean = false;
    isEditingTextcontent: boolean =false;
    userid: number = 0;
    aboutid: number = 0;
    imageurl:string = '';
    footerData: FooterData = {
      id: 1,
      websiteTitle: 'Content Management System',
      email: 'cms@software.com',
      copyrightText: 'Copyright © 2025 by Trusted company, India',
      socialLinks: {},
      footerLinks: {}
    };
    editorOptions = {
      theme: 'vs-light',
      language: 'html', // or 'plaintext'
      minimap: { enabled: false },
      fontSize: 18,
      lineNumbers: 'off',
      automaticLayout: true
    };
    
    onMonacoInit(editor: any) {
      setTimeout(() => {
        editor.focus();
      }, 100);
    }
    
markFieldsAsTouched(form: any) {
  Object.keys(form.controls).forEach((key) => {
    form.controls[key].markAsTouched();  // Mark all fields as touched
  });
}
constructor(private http: HttpClient, private elementRef: ElementRef, private cdr:ChangeDetectorRef){}
  userId: string = '';
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  mobileNumber: string = '';
  email: string = '';
  location: string = '';
  showUpdateForm:boolean = false;
  selectedFile: File | null = null;
  resumeFile: File | null = null;
  resumeError: string = '';
  formSubmitted = false; // Track if form was submitted
  backgroundImageUrl: string = ''; // Stores background image URL
  newImage = { itemId: 4, userId: 4, pagename: 'Career', imageFile: null };
  showUploadForm = false; // Form visibility control
  newimage: {
    image: any; name: string; url: string; item_id:number; userId:number,pagename:string,fileName:string} 
    = { name: '', url: '' ,image:'', item_id:0, userId:0,pagename:'',fileName:''};
    images: { itemId: number; userId: number; pagename: string; fileName: string }[] = [];


  ngOnInit() {
    this.fetchBackgroundImage();
    this.fetchImage(12,8,'Career');
    this.fetchFooterData();
    this.fetchContent(10);
  }
  
  async fetchContent(aboutId:number){
    try{
      const response = await fetch(`http://localhost:5248/api/ContentMaster/about/${aboutId}`);
      if(!response.ok){
        throw new Error(`failed to load content${aboutId}`)
      }
      const data = await  response.json();
      if (data) {
        switch (aboutId) {
          case 10:
            this.heading = data.heading;
            this.textcontent = data.textcontent;
            break;
          // case 6:
          //   this.designHeading = data.heading;
          //   this.designTextContent = data.textcontent;
            break;    
    }
    this.aboutid = data.aboutid;
    this.userid = data.userid;
  }
} catch (error) {
  console.error(`Failed to load content for aboutId: ${aboutId}`, error);
}
  }

  // Fetch background image using fetch API
  fetchBackgroundImage() {
    const apiUrl = 'http://localhost:5248/api/ContentMaster/images/download/4?userid=4&pagename=Career';
    console.log("Fetching image from:", apiUrl);

    fetch(apiUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        console.log("Resolved Image URL:", imageUrl);
        this.backgroundImageUrl = imageUrl; // Set image as background
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }

  fetchImage(ItemId:number, userId:number,pageName:string) {
    const apiUrl = `http://localhost:5248/api/ContentMaster/images/download/12?userid=8&pagename=Career&t=${Date.now()}`;
    console.log("Fetching image from:", apiUrl);
  
    fetch(apiUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        console.log("Resolved Image URL:", imageUrl);
        this.imageurl = imageUrl; // Set image as background
  
        // Set the fetched values for update
        this.newimage.item_id = ItemId;  // Replace with dynamic value if available
        this.newimage.userId = userId;  // Replace with dynamic value if available
        this.newimage.pagename = pageName;  
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }
  

  toggleUpdate() {
    this.isEditing = !this.isEditing;
  }

  // Handle click outside to save changes
  handleOutsideClick(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isEditingHeading && this.isEditingTextcontent) {
      this.isEditingHeading = false;
      this.isEditingTextcontent = false;
      // this.updateAbout();
    }
  }

  editHeading() {
    if (!this.isadmin) return;
    this.isEditingHeading = true;
    setTimeout(() => {
      if (this.headingInput) {
        // this.headingInput.nativeElement.focus(); 
      }
    }, 0);
  }
  editTextContent() {
    if (!this.isadmin) return;
    this.isEditingTextcontent = true;
    setTimeout(() => {
      if (this.textInput) {
        this.textInput.nativeElement.focus(); 
      }
    }, 0);
  }
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.resumeFile = file;
      this.resumeError = '';  // Clear error if valid
    } else {
      this.resumeFile = null;
      this.resumeError = "Please upload a valid PDF file."; // Show error message
    }
  }

  // Update About content using fetch API
  async updateText() {
    try {
      const editUrl = `http://localhost:5248/api/ContentMaster/editabouttext/10?userid=8`;
      const updatedData = { heading: this.heading, textcontent: this.textcontent };

      const response = await fetch(editUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to Update content');
      }

      this.isEditingHeading = false;
      this.isEditingTextcontent = false;
    } catch (error) {
      console.error('Error updating heading:', error);
      this.isEditingHeading = false;
      this.isEditingTextcontent = false;
    }
  }

  EditImage(images: { pagename: 'Career'; fileName: 'image'; userId: 8; itemId: 12 }) {
    console.log("Editing Image - Item ID:", images.itemId); // Debugging
  
    this.newimage.item_id = images.itemId;
    this.newimage.userId = images.userId;
    this.newimage.fileName = images.fileName;
    this.newimage.pagename = images.pagename;
    this.showUpdateForm = true;
  }

toggleupdateForm(item?: { itemid: number; userid: number; pagename: string }) { 
  if (item) {
    // Check if the form is already open for the same item, then toggle it
    if (this.newimage.item_id === item.itemid && this.showUpdateForm) {
      this.showUpdateForm = false;
    } else {
      this.newimage.item_id = item.itemid; 
      this.newimage.userId = item.userid;
      this.newimage.pagename = item.pagename;
      this.showUpdateForm = true;
    }
  } else {
    this.showUpdateForm = !this.showUpdateForm; // Toggle when no item is provided
  }
}


onImageFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input?.files?.[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.newimage.image = e.target?.result as string; // Store base64 image data
    };
    reader.readAsDataURL(file);
  }
}

updateimage(): void {  
  if (!this.newimage.image || !this.newimage.item_id || !this.newimage.userId) {
    alert('Please ensure all required fields are filled.');
    return;
  }

  const formData = new FormData();

  // Convert base64 image to Blob
  const byteString = atob(this.newimage.image.split(',')[1]);
  const mimeString = this.newimage.image.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type
  const u8arr = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    u8arr[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([u8arr], { type: mimeString }); 
  formData.append('file', new File([blob], 'image.' + mimeString.split('/')[1], { type: mimeString }));

  // Append other fields
  formData.append('itemId', this.newimage.item_id.toString());
  formData.append('userId', this.newimage.userId.toString());
  formData.append('pagename', this.newimage.pagename || ''); // Ensure pagename is not undefined

  // Properly encode textContent in URL

  const apiUrl = `http://localhost:5248/api/ContentMaster/updateimage/9?userId=8&pagename=Gallery`;

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
    this.fetchImage(12,8,'Career');
  })
  .catch(error => {
    console.error('Error uploading image:', error);
    alert('Error uploading image. Please try again.');
  });
} 


submitForm(form: any) {
  this.formSubmitted = true;  // Mark form as submitted
  this.markFieldsAsTouched(form);  // Mark all fields as touched

  if (form.invalid || !this.resumeFile) {
    this.resumeError = !this.resumeFile ? "Please upload a valid PDF file." : "";
    return; // Stop submission if any field is invalid
  }
    const formData = new FormData();
    formData.append('UserId', this.userId);
    formData.append('FirstName', this.firstName);
    formData.append('MiddleName', this.middleName);
    formData.append('LastName', this.lastName);
    formData.append('MobileNo', this.mobileNumber);
    formData.append('EmailId', this.email);
    formData.append('Location', this.location);
    formData.append('File', this.resumeFile, this.resumeFile.name);

    fetch(`http://localhost:5248/api/ContentMaster/resume?userId=${this.userId}`, {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if(response.ok){
        console.log("resume sucess");
      }
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Server Error: ${text}`);
        });
      }
      return response.text(); // Change from .json() to .text()
    })
    .then(data => {
      alert(data); // Show success message from backend
      form.resetForm(); // Reset the form after successful submission
      this.formSubmitted = false; // Reset submission flag
    })
    .catch(error => {
      let errorMessage = 'Error uploading resume: An unknown error occurred.';
      if (error.message.includes('23505')) {
        errorMessage = 'Error: A user with this email or mobile number already exists.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error: Please check your details. The user may not be registered.';
      }
      alert(errorMessage);
    });
    
    markFieldsAsTouched();{
      const formControls = document.querySelectorAll('input, textarea, select');
      formControls.forEach((control) => {
        control.dispatchEvent(new Event('blur'));  // Trigger validation messages
      });
    }
  }
  
  scrollToResume() {
    const resumeSection = document.getElementById('resumeSection');
    if (resumeSection) {
      resumeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  fetchFooterData(): void {
    this.http.get<FooterData>('http://localhost:5248/api/ContentMaster/footer').subscribe({
      next: (data) => {
        this.footerData = data;
      },
      error: (err) => {
        console.error('Error fetching footer data:', err);
      }
    });
  }
  
}

function markFieldsAsTouched() 
{
  throw new Error('Function not implemented.');
}
