import { Component,Input, OnInit, WritableSignal, signal ,CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import AOS from 'aos';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

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
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // providers: [
  //   {
  //     provide: NGX_MONACO_EDITOR_CONFIG,
  //     useValue: {
  //       baseUrl: 'assets', // Path to Monaco Editor assets
  //       defaultOptions: { scrollBeyondLastLine: false },
  //       onMonacoLoad: () => console.log('Monaco Editor Loaded'),
  //     },
  //   },
  // ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css',],
})

export class HomeComponent implements OnInit {
  
  @Input() title: string = "Our Latest Work";
  @Input() description: string = "Explore our recent projects and creative work. We bring innovative ideas to life with seamless execution.";
  @Input() showNavbar: boolean = true;
  @Input() isadmin:boolean = false;

  @ViewChild('contentDiv', { static: false }) contentDiv!: ElementRef;
  @ViewChild('headingInput') headingInput!: ElementRef;
  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('designHeadingInput') designHeadingInput!: ElementRef;
  @ViewChild('designTextInput') designTextInput!: ElementRef;
  @ViewChild('staticHeadingInput') staticHeadingInput!: ElementRef;
  @ViewChild('staticTextInput') staticTextInput!: ElementRef;
  @ViewChild('bottomHeadingInput') bottomHeadingInput!: ElementRef;
  @ViewChild('bottomTextInput') bottomTextInput!: ElementRef;


  heading: string = '';
  textcontent: string = '';
  isEditing: boolean = true;
  isEditingHeading: boolean = false;
  isEditingTextcontent: boolean =false;
  designHeading: string = ''
  designTextContent: string = '';
  isEditingDesignHeading: boolean = false;
  isEditingDesignTextcontent: boolean = false;
  staticHeading: string = ''
  staticTextContent: string = '';
  isEditingStaticHeading: boolean = false;
  bottomHeading: string = ''
  isEditingStaticTextcontent: boolean = false;
  isEditingBottomHeading: boolean = false;
  isEditingBottomTextcontent: boolean = false;
  userid: number = 0;
  aboutid: number = 0;
  updateimage:boolean=false;
  @ViewChild('welcomeText') welcomeText!: ElementRef;
  homebanneritems: any[] = [];
  editorOptions = { theme: 'vs-dark', language: 'html' };
  banners: WritableSignal<Banner[]> = signal<Banner[]>([]);
  private apiUrl = 'http://localhost:5248/api/HomeBanner';
  public galleryUrl = `http://localhost:5248/api/ContentMaster/gallery`;
  rightimage:string='';
  leftimage:string = ''
  newimage: {
     item_id:number; userId:number,pagename:string} 
    = { item_id:0, userId:0,pagename:''};
    images: { itemId: number; userId: number; pagename: string; fileName: string }[] = [];
    showUpdateForm:boolean = false;
  private sliderInterval: any;
  loading = true;
  currentSlideIndex = 0;
  currentBanner: Banner | undefined;
  showUploadForm = false; 
  newImage: {
    image: any; name: string; url: string; item_id:number; userId:number} 
    = { name: '', url: '' ,image:'',item_id:0,userId:0};
  bottomTextContent: any;
  leftimageFile: File | undefined;
  rightimageFile: File | undefined;
  imageSide: 'left' | 'right' | undefined;
  // Track which image is being updated


  constructor( private cdr: ChangeDetectorRef, private router :Router,private elementRef: ElementRef, private http:HttpClient) {}
  navigateToPage(page: string) {
    this.router.navigate([`/${page}`]); 
  }
//private router : Router its a dependency injection means when we need to use Router then we simpply inject it from here by roouter
// or in some cases its not work we have to prevent dependency injection then use this : const userService = new UserService(); // manually create it
//or can be create this :providers: [UserService] // inside component instead of app.module
  
  ngOnInit() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        AOS.init({ duration: 1000, easing: 'ease-in-out', once: false });
      }, 500);

      this.fetchContent(5); // About Us
      this.fetchContent(6); // Design Text
      this.fetchContent(7); // Static Text
      this.fetchContent(8); // Static Text
      this.fetchImage();
    }
  
    fetch(this.apiUrl)
      .then((response) => response.json())
      .then((data: Banner[]) => {
        const updatedBanners: Banner[] = data.map((banner) => ({
          ...banner,
          imageUrl: `http://localhost:5248/api/HomeBanner/download${banner.item_id}`,
          content: banner.textContent || 'No content available',
        }));
        this.banners.set(updatedBanners);
        this.startSlider();
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
        this.loading = false;
      });
  }
  
  fetchImage() {
    const rightImageUrl = 'http://localhost:5248/api/ContentMaster/images/download/14?userid=8&pagename=Home';
    const leftImageUrl = 'http://localhost:5248/api/ContentMaster/images/download/15?userid=8&pagename=Home';

    const rightimage$ = this.http.get(rightImageUrl, { responseType: 'blob' });
    const leftimage$ = this.http.get(leftImageUrl, { responseType: 'blob' });

    forkJoin([rightimage$, leftimage$]).subscribe(
      ([rightBlob, leftBlob]) => {
        this.rightimage = URL.createObjectURL(rightBlob);
        this.leftimage = URL.createObjectURL(leftBlob);
      },
      (error) => {
        console.error('Error fetching images:', error);
      }
    );
  }

    animatedBoxes = [
      { icon: "create-sharp", heading: "Bring in your designs", textcontent: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat, deleniti.", isEditingHeading: false, isEditingText: false },
      { icon: "cloud-upload-sharp", heading: "Upload images", textcontent: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat, deleniti.", isEditingHeading: false, isEditingText: false },
      { icon: "logo-buffer", heading: "Update Content", textcontent: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat, deleniti.", isEditingHeading: false, isEditingText: false }
    ];

    async fetchContent(aboutId: number) {
      try {
        const response = await fetch(`http://localhost:5248/api/ContentMaster/about/${aboutId}`);
        if (!response.ok) {
          throw new Error(`Failed to load content for aboutId: ${aboutId}`);
        }
        const data = await response.json();
    
        if (data) {
          switch (aboutId) {
            case 5:
              this.heading = data.heading;
              this.textcontent = data.textcontent;
              break;
            case 6:
              this.designHeading = data.heading;
              this.designTextContent = data.textcontent;
              break;
            case 7:
              this.staticHeading = data.heading;
              this.staticTextContent = data.textcontent;
              break;
            case 8:
                this.bottomHeading = data.heading;
                this.bottomTextContent = data.textcontent;
                break;
          }
          this.aboutid = data.aboutid;
          this.userid = data.userid;
        }
      } catch (error) {
        console.error(`Failed to load content for aboutId: ${aboutId}`, error);
      }
    }
    
 toggleUpdate() {
    this.isEditing = !this.isEditing;
  }

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
  
  
  // Handle click outside to save changes
  handleOutsideClick(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isEditingHeading && this.isEditingTextcontent) {
      this.isEditingHeading = false;
      this.isEditingTextcontent = false;
    
      this.updateContent(5,2);
    }
  }

  // Update About content using fetch API
  async updateContent(aboutid:number, userid:number) {
    try {
      const editUrl = `http://localhost:5248/api/ContentMaster/editabouttext/${aboutid}?userid=${userid}`;
          
    let updatedData;

    // Determine what data to send based on aboutid
    switch (aboutid) {
      case 5:
        updatedData = {
          heading: this.heading || '',
          textcontent: this.textcontent || ''
        };
        break;
      case 6:
        updatedData = {
          heading: this.designHeading || '',
          textcontent: this.designTextContent || ''
        };
        break;
      case 7:
        updatedData = {
          heading: this.staticHeading || '',
          textcontent: this.staticTextContent || ''
        };
        break;
      case 8:
        updatedData = {
          heading: this.bottomHeading || '',
          textcontent: this.bottomTextContent || ''
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
      this.isEditingDesignHeading = false;
      this.isEditingDesignTextcontent = false;
      this.isEditingStaticHeading= false;
      this.isEditingStaticTextcontent = false;
      this.isEditingBottomHeading= false;
      this.isEditingBottomTextcontent= false;
      //this can also be manage by declaring only two flags 
      //here i declared all the seprate flags for understanding purpose.
    } catch (error) {
      console.error('Error updating heading:', error);
      this.isEditingHeading = false;
      this.isEditingTextcontent = false;
      this.isEditingDesignHeading = false;
      this.isEditingDesignTextcontent = false;
      this.isEditingStaticHeading= false;
      this.isEditingStaticTextcontent = false;
      this.isEditingBottomHeading= false;
      this.isEditingBottomTextcontent= false;
    }
  }

  saveChanges() {
      console.log("Content saved:", this.title, this.description, this.banners);
    }  

  startSlider() {
    this.stopSlider();
    if (this.banners().length > 1) {
      this.sliderInterval = setInterval(() => {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.banners().length;
      }, 3000);
    }
  }


  stopSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }
  editText(banner: Banner) {
    if (!this.isadmin) return; // Prevent editing in frontend home
    this.stopSlider();
    this.currentBanner = banner;
    banner.isEditing = true;
    banner.tempContent = banner.content ?? '';
    this.cdr.detectChanges();
  }

  saveText(banner: Banner) {
    if (!this.isadmin) return; // Prevent saving in frontend home
    if (!banner.tempContent || banner.tempContent.trim() === banner.content.trim()) {
      banner.isEditing = false;
      this.startSlider();
      return;
    }
    banner.content = banner.tempContent;
    banner.isEditing = false;
    this.startSlider();
  

    const itemId = banner.item_id;
    const userId = 1; // Replace with actual logged-in user ID

    if (!itemId) {
      console.error('Error: item_id is undefined or invalid', banner);
      alert('Error: item_id is missing!');
      return;
    }

   const apiUrl= `${this.apiUrl}/edittext/${itemId}`;
   const payload = {
    userId: userId,
    textContent: banner.tempContent
   };
   fetch(apiUrl,{
    method:'PUT',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(payload)
   })
   .then(response=>{
    if(!response.ok) {
      return response.json().then(err=>{throw err;});
    }
    return  response.json();
   })
   .then(response=>{
    console.log('Content updated successfully',response);
    banner.content=banner.tempContent??'';
    banner.isEditing =false;
    alert('content saved');
    this.startSlider();
   }).catch(error=>{
    console.log('Error saving content',error);
    alert("failed to save content");
   })
  }
  toggleUploadForm(event: Event): void {
    event.preventDefault();
    this.showUploadForm = !this.showUploadForm;

    if(!this.showUploadForm){
      this.startSlider();
    }
  }

  editImage(banner: Banner) {
    this.stopSlider();
    this.currentBanner = banner; 
    console.log('Selected Banner ID:', banner.item_id); 
    
    // Check if item_id is valid before assigning
    if (banner.item_id && banner.item_id !== 0) {
      this.newImage.item_id = banner.item_id;
    } else {
      console.error('Item ID is invalid:', banner.item_id);
    }
    // // Ensure userId is assigned from a valid source (e.g., logged-in user)
    // this.newImage.userId = 4; // Replace with actual logged-in user ID (for testing, use 1)
    this.newImage.userId = banner.userId;
    console.log('Assigned Item ID:', banner.item_id);
    console.log('Assigned User ID:', this.newImage.userId);
  
    this.showUploadForm = true; 
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


  updateImage(): void {
    if (!this.newImage.image || !this.newImage.item_id || !this.newImage.userId) {
      alert('Please ensure all required fields are filled.');
      return;
    }
  
    // Create FormData to send the image and other necessary data
    const formData = new FormData();
  
    // Convert the base64 string into a Blob object
    const byteString = atob(this.newImage.image.split(',')[1]);
    const u8arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8arr[i] = byteString.charCodeAt(i);
    }
  
    // Create a Blob from the base64 string and append it to the FormData
    const blob = new Blob([u8arr], { type: 'image/webp' }); 
    formData.append('file', new File([blob], 'image.webp', { type: 'image/webp' }));
  
    // Append itemId and userId to FormData
    formData.append('item_id', this.newImage.item_id.toString());
    formData.append('userId', this.newImage.userId.toString());
  
    const apiUrl = `http://localhost:5248/api/HomeBanner/updateimage/${this.newImage.item_id}?userId=${this.newImage.userId}`;
  
    fetch(apiUrl, {
      method: 'PUT',
      body: formData,
    })
      .then(response => {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          throw new Error(`Expected JSON response but got: ${contentType}`);
        }
      })
      .then(response => {
        console.log('Image uploaded successfully:', response);
        alert('Image updated successfully!');
        this.showUploadForm = false; 
        this.startSlider(); 
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
      });
  }

  // toggleupdateimage(side?: 'left' | 'right') {
  //   if (side === 'left') {
  //     this.newimage.item_id = 15;  // Set itemId for left image
  //     this.newimage.userId = 8;
  //     this.newimage.pagename = 'Home';
  //   } else if (side === 'right') {
  //     this.newimage.item_id = 14;  // Set itemId for right image
  //     this.newimage.userId = 8;
  //     this.newimage.pagename = 'Home';
  //   }
  
  //   this.showUpdateForm = !this.showUpdateForm; // Toggle form visibility
  // }
  
  
  EditImage(images: { pagename: 'Career'; fileName: 'image'; userId: 8; itemId: 12 }) {
    console.log("Editing Image - Item ID:", images.itemId); // Debugging
  
    this.newimage.item_id = images.itemId;
    this.newimage.userId = images.userId;
    // this.newimage.fileName = images.fileName;
    this.newimage.pagename = images.pagename;
    this.showUpdateForm = true;
  }

  toggleupdateimage(side?: 'left' | 'right') {
    this.showUpdateForm = !this.showUpdateForm;
  
    if (side) {
      this.imageSide = side;
      this.newimage = {
        item_id: side === 'left' ? 15 : 14,
        userId: 8,
        pagename: 'Home',
      };
    } else {
      this.imageSide = undefined; // Reset side when closing
    }
  }
  
  
  
  onimageFileChange(event: Event, side: 'left' | 'right'): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
  
      if (side === 'left') {
        this.leftimageFile = file;
        this.newimage.item_id = 15;  // Set itemId for left image
      } else {
        this.rightimageFile = file;
        this.newimage.item_id = 14;  // Set itemId for right image
      }
      
      this.newimage.userId = 8;
      this.newimage.pagename = 'Home';
    }
  }
  
  updateSingleImage(): void {
    if (!this.newimage.item_id || !this.newimage.userId || !this.newimage.pagename) {
      alert('Missing required fields!');
      return;
    }
  
    const selectedImage = this.imageSide === 'left' ? this.leftimageFile : this.rightimageFile;
    
    if (!selectedImage) {
      alert(`Please select an image for ${this.imageSide} side.`);
      return;
    }
  
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('itemId', this.newimage.item_id.toString());
    formData.append('userId', this.newimage.userId.toString());
    formData.append('pagename', this.newimage.pagename);
  
    const apiUrl = `http://localhost:5248/api/ContentMaster/updateimage/${this.newimage.item_id}?userId=${this.newimage.userId}&pagename=${this.newimage.pagename}`;
  
    fetch(apiUrl, {
      method: 'PUT',
      body: formData,
    })
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to update item ${this.newimage.item_id}`);
      return response.json();
    })
    .then(() => {
      alert(`Image updated successfully for ${this.imageSide} side!`);
      this.fetchImage();
      this.showUpdateForm = false;
    })
    .catch((err) => {
      console.error('Error updating image:', err);
      alert('Error updating image.');
    });
  }
  

  }
