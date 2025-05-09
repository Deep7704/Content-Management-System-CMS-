import { Component, Input, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import AOS from 'aos';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
interface galleryimages {
  fileName: string;
  image: string;
  fileType: string;
  item_id: number;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule,MonacoEditorModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})

export class GalleryComponent implements OnInit {
  @Input() isadmin: boolean = false;
  @Input() showNavbar: boolean = true;
  @Input() showbgimg:boolean = true;
  @Input() iseditor: boolean = false;
  currentRoute: string = '';
  @ViewChild('headingInput') headingInput!: ElementRef;
  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('anotherheadingInput') anotherheadingInput!: ElementRef;
  @ViewChild('anothertextcontentInput') anothertextcontentInput!: ElementRef;

  userid: number = 0;
  aboutid: number = 0;
  aboutid2:number=0;
  userid2:number= 0;
  heading:string = 'hello';
  textcontent:string= '';
  isEditingHeading:boolean = false;
  isEditingTextcontent :boolean = false;
  anotherheading:string='ello';
  anothertextcontent:string='';
  isEditinganotherHeading:boolean= false;
  isEditinganotherTextcontent:boolean= false;
  isEditing:boolean = true;
  userRole: string | null = null;
  imageurl:string = '';
  videourl:string=''
  @ViewChild('welcomeText') welcomeText!: ElementRef;
  galleryItems: any[] = [];
  showUploadForm: boolean = false;
  showUpdateForm: boolean = false;
  showupdateform:boolean = false;
  backgroundImageUrl: string = ''; // Stores background image URL
  // newimage = { itemId: 1, userId: 4, pagename: 'Gallery', imageFile: null }; 
  showForm:boolean = false; // Form visibility control
  newImage:any = { name: '', image: '' , Item_id:null, UserId:0}; // Image as base64 or URL
  newimage: {
    image: any; name: string; url: string; item_id:number; userId:number,pagename:string,fileName:string} 
    = { name: '', url: '' ,image:'', item_id:0, userId:0,pagename:'',fileName:''};
    images: { itemId: number; userId: number; pagename: string; fileName: string }[] = [];
constructor(private cookies:CookieService, private router: Router,private elementRef: ElementRef){}

editorOptions = {
  theme: 'vs-light',
  language: 'html', // or 'plaintext'
  minimap: { enabled: false },
  fontSize: 18,
  lineNumbers: 'off',
  automaticLayout: true
};
// onMonacoInit(editor: any) {
//   setTimeout(() => {
//     editor.focus();
//   }, 100);

  ngOnInit(): void {
    this.currentRoute = window.location.href; // Get current route

    console.log(this.currentRoute)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn("Skipping DOM operations: Not running in a browser.");
      return;
    }
    this.fetchGalleryItems();
    this.fetchBackgroundImage();

    if (typeof document !== 'undefined') {
      this.fetchContent(12);
      this.fetchContent(13);
      document.addEventListener('click', (event) => this.removeUnderline(event));
    }

    this.fetchImage(9,8,'Gallery');
      AOS.init({
          duration: 1000,
          easing: 'ease-in-out',
          once: false,
        });
        this.fetchVideo(9,8,'Gallery');
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: false,
          });
  }

  async fetchContent(aboutId:number){
    try{
      const response = await fetch(`http://localhost:5248/api/ContentMaster/about/${aboutId}`);
      if(!response.ok){
        throw new Error('Failed to fetch content');
      }
      const data = await response.json();
      if(data){
        switch(aboutId){
          case 12:
          this.heading = data.heading;
          this.textcontent = data.textcontent;
          this.aboutid = data.aboutid;
          this.userid = data.userid;
          break;
          case 13:
            this.anotherheading= data.heading;
            this.anothertextcontent = data.textcontent;
            this.aboutid2 = data.aboutid;
            this.userid2 = data.userid;
            break;
        }
  
      }
    }
    catch(error){
      console.error(`Failed to load content for aboutId: ${aboutId}`, error);
    }
  }
  toggleUpdate() {
    this.isEditing = !this.isEditing;
  }
 
  toggleUnderline(event: Event) {
    const heading = document.getElementById('hero-text');
    const textcontent = document.getElementById('hero-subtext');    
    const anotherheading = document.getElementById('anotherhero-text');
    const anothertextcontent = document.getElementById('anothersub-text'); 
    if (heading) {
      heading.style.borderBottom = "2px dotted blue";
    }
    if (textcontent) {
      textcontent.style.borderBottom = "2px dotted blue";
    }
    if (anotherheading) {
       anotherheading.style.borderBottom = "2px dotted blue";
    }
    if (anothertextcontent) {
        anothertextcontent.style.borderBottom = "2px dotted blue";
    }
  }

  removeUnderline(event: Event) {
    const heading = document.getElementById('hero-text');
    const textcontent = document.getElementById('hero-subtext');
    const anotherheading = document.getElementById('anotherhero-text');
    const anothertextcontent = document.getElementById('anothersub-text'); 
    if (heading && event.target !== heading) {
      heading.style.borderBottom = "none";
    }
    if (textcontent && event.target !== textcontent) {
      textcontent.style.borderBottom = "none";
    }
    if (anotherheading && event.target !== anotherheading) {
      anotherheading.style.borderBottom = "none";
    }
    if (anothertextcontent && event.target !== anothertextcontent) {
      anothertextcontent.style.borderBottom = "none";
    }
  }


  handleOutsideClick(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isEditingHeading && this.isEditingTextcontent && this.isEditinganotherHeading && this.isEditinganotherTextcontent) {
      this.isEditingHeading = false;
      this.isEditingTextcontent = false;
      this.isEditinganotherHeading = false;
      this.isEditinganotherTextcontent= false;
      // this.updateAbout();
    }
  }

    // Update About content using fetch API
    editField(fieldName: string) {
      if (!this.isadmin) return;
    
      // Set the editing flag dynamically (bypass TS check)
      (this as any)[`isEditing${fieldName}`] = true;
    
      // Focus the corresponding input (bypass TS check)
      setTimeout(() => {
        const inputRef = (this as any)[`${fieldName.charAt(0).toLowerCase()}${fieldName.slice(1)}Input`];
        if (inputRef) {
          inputRef.nativeElement.focus();
        }
      }, 0);
    }

    async updateContent(aboutid:number, userid:number) {
      try {
        const editUrl = `http://localhost:5248/api/ContentMaster/editabouttext/${aboutid}?userid=${userid}`;
            
      let updatedData;
  
      // Determine what data to send based on aboutid
      switch (aboutid) {
        case 12:
          updatedData = {
            heading: this.heading || '',
            textcontent: this.textcontent || ''
          };
          break;
        case 13:
          updatedData = {
            heading: this.anotherheading || '',
            textcontent: this.anothertextcontent || ''
          };
          break;
        default:
          updatedData = {
            heading: '',
            textcontent: ''
          };
          break;
      }
  
        const response = await fetch(editUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to Update content');
        }
        console.log("updating with id",aboutid,userid)
        this.isEditingHeading = false;
        this.isEditingTextcontent = false;
        this.isEditinganotherHeading= false;
        this.isEditinganotherTextcontent = false;
        //this can also be manage by declaring only two flags 
        //here i declared all the seprate flags for understanding purpose.
      } catch (error) {
        console.error('Error updating heading:', error);
        this.isEditingHeading = false;
        this.isEditingTextcontent = false;
        this.isEditinganotherHeading= false;
        this.isEditinganotherTextcontent = false;
      }
    }

fetchBackgroundImage() {
  const apiUrl = 'http://localhost:5248/api/ContentMaster/images/download/1?userid=4&pagename=Gallery';
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

fetchImage(ItemId:number, userId:number,pageName:string) {
  const apiUrl = `http://localhost:5248/api/ContentMaster/images/download/${ItemId}?userid=${userId}&pagename=${pageName}&t=${Date.now()}`;
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

fetchVideo(ItemId:number, userId:number,pageName:string) {
  const apiUrl = `http://localhost:5248/api/ContentMaster/images/download/17?userid=8&pagename=Gallery`;
  console.log("Fetching image from:", apiUrl);

  fetch(apiUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const videourl = URL.createObjectURL(blob);
      console.log("Resolved Image URL:", videourl);
      this.videourl =videourl; // Set image as background

      // Set the fetched values for update
      this.newimage.item_id = ItemId;  // Replace with dynamic value if available
      this.newimage.userId = userId;  // Replace with dynamic value if available
      this.newimage.pagename = pageName;  
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
    });
}

  // Fetch gallery images from the API
  async fetchGalleryItems() {
    try {
      const response = await fetch('http://localhost:5248/api/ContentMaster/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery data');
      }
      const data = await response.json();  
      this.galleryItems = data.map((item: any) => ({
        id: item.item_Id,
        name: item.fileName,
        image: `http://localhost:5248${item.imageUrl}`, 
        url: item.url ?? '#'
      }));
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    }
  }

  toggleUploadForm(event: Event): void {
    event.preventDefault();
    this.showUploadForm = !this.showUploadForm;
  
    // Reset form fields when closing
    if (!this.showUploadForm) {
      this.newImage = { name: '', image: '', Item_id: null, UserId: 0 };
    }
  }
  
  // Handle image file selection
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
      this.newImage = { name: '', image: '' ,Item_id:0, UserId:0};
    } catch (error) {
      console.error('Error uploading image', error);
    }
  }

  toggleUpdateForm(event: Event): void {
    event.preventDefault();
    this.showUpdateForm = !this.showUpdateForm;
  
    // Reset form fields when closing
    if (!this.showUpdateForm) {
      this.newImage = { name: '', image: '', Item_id: null, UserId: 0 };
    }
  }
  
 editImage(item: any) {
  if (!item) return;

  this.newImage.Item_id = item.id;  // Fetch ItemId dynamically
  this.newImage.UserId = 4; // Replace with actual user ID

  this.newImage.name = item.name;
  this.newImage.image = item.image;

  this.showUpdateForm = true;     
}

  async updateImage(): Promise<void> {
    if (!this.newimage.image || !this.newImage.Item_id || !this.newImage.UserId) {
      alert('Please ensure all required fields are filled.');
      return;
    }

    const formData = new FormData();
    const byteString = atob(this.newImage.image.split(',')[1]);
    const u8arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8arr[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([u8arr], { type: 'image/webp' });
    formData.append('file', new File([blob], 'image.webp', { type: 'image/webp' }));
    formData.append('Item_id', this.newImage.Item_id.toString());
    formData.append('UserId', this.newImage.UserId.toString());

    const apiUrl = `http://localhost:5248/api/ContentMaster/galleryUpdate/${this.newImage.Item_id}?userId=${this.newImage.UserId}`;

    fetch(apiUrl, {
      method: 'PUT',
      body: formData,
    })
      .then(response => {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          throw new Error(`Expected JSON but got something else, ${contentType}`);
        }
      })
      .then(response => {
        console.log('Image updated successfully', response);
        alert('Image updated successfully!');
        this.showUpdateForm = false;
      })
      .catch(error => {
        console.error('Error updating image:', error);
        alert('Error updating image. Please try again.');
      });
  }


  EditImage(images: { pagename: 'Gallery'; fileName: 'image'; userId: 8; itemId: 9 }) {
    console.log("Editing Image - Item ID:", images.itemId); // Debugging
  
    this.newimage.item_id = images.itemId;
    this.newimage.userId = images.userId;
    this.newimage.fileName = images.fileName;
    this.newimage.pagename = images.pagename;
    this.showupdateform = true;
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
      this.showupdateform = true;
    }
  } else {
    this.showupdateform = !this.showupdateform; // Toggle when no item is provided
  }
}


onimageFileChange(event: Event): void {
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

updateimages(): void {  
  if (!this.newimage.image || !this.newimage.item_id || !this.newimage.userId) {
    alert('Please ensure all required fields are filled.');
    return;
  }

  const formData = new FormData();

  // Convert base64 to Blob
  const byteString = atob(this.newimage.image.split(',')[1]);
  const mimeString = this.newimage.image.split(',')[0].split(':')[1].split(';')[0];
  const u8arr = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    u8arr[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([u8arr], { type: mimeString });
  const extension = mimeString.split('/')[1];

  formData.append('file', new File([blob], `upload.${extension}`, { type: mimeString }));
  formData.append('itemId', this.newimage.item_id.toString());
  formData.append('userId', this.newimage.userId.toString());
  formData.append('pagename', this.newimage.pagename || '');

  // 🧠 Dynamically use the correct API based on item_id
  const apiUrl = `http://localhost:5248/api/ContentMaster/updateimage/${this.newimage.item_id}?userId=${this.newimage.userId}&pagename=${this.newimage.pagename}`;

  fetch(apiUrl, {
    method: 'PUT',
    body: formData,
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not OK');
    return response.json();
  })
  .then(response => {
    console.log('Media updated successfully:', response);
    alert('Update successful!');
    this.showupdateform = false;

    // Refresh both
    this.fetchImage(9, 8, 'Gallery');   // For image
    this.fetchVideo(17, 8, 'Gallery');  // For video
  })
  .catch(error => {
    console.error('Error uploading media:', error);
    alert('Error occurred. Please try again.');
  });
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
}