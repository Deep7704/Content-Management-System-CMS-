import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-contact',
    imports: [CommonModule, FormsModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
    images: any[] = []; // Define the images array
    mapLink: string = 'https://www.google.com/maps?q=default+location';
    newMapLink: string = '';
    successMessage: string = '';
    errorMessage: string = '';
    showSuccess: boolean = false;
    showError: boolean = false;

    @Input() showNavbar: boolean = true;
    @Input() isadmin: boolean = false;
    @Input() showbgimg: boolean = true;

    footerData = {
        title: 'CMS',
        message: 'Add photos and a welcome message. \nCreate kind of best things.',
        craftedBy: 'Developer',
        poweredBy: 'A Trusted Company',
        twitterLink: '',  
        facebookLink: '',
        instagramLink: '',
        linkedinLink: '' 
    };

    isEditing = false;


    backgroundImageUrl: string = '';
    newImage = { itemId: 2, userId: 4, pagename: 'Contact', imageFile: null };
    showUploadForm = false;
    apiBaseUrl = 'http://localhost:5248';

    contactForm = {
        inquiry_id: 0,
        name: '',
        email: '',
        phone: '',
        message: ''
    };

    constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit() {
        this.fetchMapLink();
        this.fetchBackgroundImage();

        if (isPlatformBrowser(this.platformId)) {
            const savedFooter = localStorage.getItem('footerData');
            if (savedFooter) {
                this.footerData = JSON.parse(savedFooter);
            }
        }
        const savedLink = localStorage.getItem('mapLink');
        if (savedLink) {
          this.mapLink = savedLink;
        }
    }

    saveFooter() {
        if (!this.footerData.title.trim() || !this.footerData.message.trim() || !this.footerData.craftedBy.trim()) {
            alert('Please fill in at least the title, message, and crafted by fields.');
            return;
        }

        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('footerData', JSON.stringify(this.footerData));
        }
        this.isEditing = false;
    }

    enableEditing() {
        this.isEditing = true;
    }

    cancelEditing() {
        this.isEditing = false;
        this.ngOnInit();
    }

    onSubmit() {
        if(!this.contactForm.name|| !this.contactForm.email||!this.contactForm.phone||!this.contactForm.message){
            this.showError = true;
            this.errorMessage = 'Please fill out all fields.';
            return;
        }
        const newInquiry = {
            name:this.contactForm.name,
            email:this.contactForm.email,
            phone:this.contactForm.phone,
            message:this.contactForm.message
        };
    
        this.http.post('http://localhost:5248/api/ContentMaster/SubmitInquiry', newInquiry)
        .subscribe(
            (response)=>{
                this.showSuccess = true;
                this.successMessage = 'Your message has been submitted successfully!';
                this.showError = false; // Hide error alert
                this.contactForm = {inquiry_id: 0, name: '', email: '', phone: '', message: '' };
            },
            (error)=>{
                console.error('Error submitting Message :', error)
                this.showError = true;
                this.errorMessage = 'Failed to submit inquiry. Please check your details.';
                this.showSuccess = false; // Hide success alert
            }
        );
    }
    
    fetchBackgroundImage() {
        const apiUrl = 'http://localhost:5248/api/ContentMaster/images/download/2?userid=4&pagename=Contact';
        console.log("Fetching image from:", apiUrl);

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch image');
                }
                return response.blob();
            })
            .then((blob) => {
                if (blob.type.startsWith('image')) {
                    const imageUrl = URL.createObjectURL(blob);
                    console.log("Resolved Image URL:", imageUrl);
                    this.backgroundImageUrl = imageUrl; // Set image as background
                } else {
                    console.error('Invalid image response received.');
                }
            })
            .catch((error) => {
                console.error("Error fetching image:", error);
            });
    }

  // Fetch map link from database6
  fetchMapLink() {
    this.http.get<{ mapLink: string ,textcontent:string}>(`http://localhost:5248/api/ContentMaster/about/11`).subscribe(
      (response) => {
        console.log(response);
        this.mapLink = response.textcontent;
      },
      (error) => {
        console.error('Error fetching map link:', error);
      }
    );
  }

  // Enable editing mode
  editMapLink() {
    this.isEditing = true;
    this.newMapLink = this.mapLink;
  }

  // Save updated map link to database and hide buttons
  saveMapLink() {
    const body = { Heading: "MapLink",
        TextContent:this.newMapLink
     };

    this.http.put(`http://localhost:5248/api/ContentMaster/editabouttext/11?userid=8`, body).subscribe(
      (response: any) => {
        this.mapLink = this.newMapLink; // Update the map link
        this.isEditing = false; // Hide Save & Cancel buttons
      },
      (error) => {
        console.error('Error updating map link:', error);
      }
    );
  }

  // Cancel editing mode without saving
  cancelEdit() {
    this.isEditing = false;
  }
}