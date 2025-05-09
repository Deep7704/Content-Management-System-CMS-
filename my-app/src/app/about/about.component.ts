import { Component,Input, OnInit, ElementRef, ViewChild, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import AOS from 'aos';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-about',
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  templateUrl: './about.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  @Input() isadmin: boolean = false;
  @Input() showNavbar: boolean = true;
  @Input() showbgimg:boolean = true;
  
  editorOptions = { theme: 'vs-dark', language: 'html' };
  @ViewChild('contentDiv', { static: false }) contentDiv!: ElementRef;
  @ViewChild('headingInput') headingInput!: ElementRef;
  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('headingTitleInput') headingTitleInput!: ElementRef;
  @ViewChild('textTitleInput') textTitleInput!: ElementRef;

  heading: string = ''; 
  textcontent: string = '';
  headingTitle: string = '';
  texttitle: string = '';
  userid: number = 0;
  aboutid: number = 0;
  isEditing: boolean = true;
  isEditingHeading: boolean = false;
  isEditingTextcontent: boolean = false;
  isEditingHeadingTitle: boolean = false;
  isEditingTextTitle: boolean = false;
  showUpdateForm:boolean = false;
  imageurl:string = '';

  backgroundImageUrl: string = ''; // Stores background image URL
  newImage = { itemId: 2, userId: 4, pagename: 'Contact', imageFile: null }; // Added pagename
  showUploadForm = false; // Form visibility control
  apiBaseUrl = 'http://localhost:5248'; // Backend URL
  newimage:{image:any,item_id:number, userId:number, pagename:string,filename:string}  = {image:'',item_id:0, userId: 0, pagename:'',filename:''}

  private contentUrl = `http://localhost:5248/api/ContentMaster/about/3`;
  private titleurl= `http://localhost:5248/api/ContentMaster/about/9`;
  private editUrl = `http://localhost:5248/api/ContentMaster/about/${this.userid}/${this.aboutid}`;

  constructor(private elementRef: ElementRef,private http:HttpClient) {}

  ngOnInit() {
    //  AOS.init({
    //       duration: 1000,  // Animation duration
    //       easing: 'ease-in-out', // Animation easing
    //       once: false, // Whether animation should run only once
    //     });
    this.fetchBackgroundImage();
    this.fetchImage(13,8,'About');
        if (typeof document !== 'undefined') {
      this.fetchAboutUs();
      this.fetchAboutUstitle()
      document.addEventListener('click', (event) => this.removeUnderline(event));
    }
  }

  // Fetch background image using fetch API
  fetchBackgroundImage() {
    const apiUrl = 'http://localhost:5248/api/ContentMaster/images/download/3?userid=4&pagename=Aboutus';
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
    const apiUrl = `http://localhost:5248/api/ContentMaster/images/download/13?userid=8&pagename=About&t=${Date.now()}`;
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

  // Fetch About Us content using fetch API
  async fetchAboutUs() {
    try {
      const response = await fetch(this.contentUrl);
      if (!response.ok) {
        throw new Error('Failed to load content');
      }
      const data = await response.json();
  
      if (data) {  
        this.heading = data.heading;
        this.textcontent = data.textcontent;
        this.aboutid = data.aboutid;
        this.userid = data.userid;
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }

  // Fetch About Us content using fetch API
  async fetchAboutUstitle() {
    try {
      const response = await fetch(this.titleurl);
      if (!response.ok) {
        throw new Error('Failed to load content');
      }
      const data = await response.json();
  
      if (data) {  
        this.headingTitle = data.heading;
        this.texttitle = data.textcontent;
        this.aboutid = data.aboutid;
        this.userid = data.userid;
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }
  
  toggleUpdate() {
    this.isEditing = !this.isEditing;
  }

  toggleUnderline(event: Event) {
    const heading = document.getElementById('aboutHeading');
    const headingtitle = document.getElementById('abouttitle');
    const textcontent = document.getElementById('aboutText');
    const textTitle = document.getElementById('abouttxt');
    
    if (heading) {
      heading.style.borderBottom = "2px dotted blue";
    }
    if (textcontent) {
      textcontent.style.borderBottom = "2px dotted blue";
    }
    if (headingtitle) {
      headingtitle.style.borderBottom = "2px dotted blue";
    }
    if (textTitle) {
      textTitle.style.borderBottom = "2px dotted blue";
    }
  }

  removeUnderline(event: Event) {
    const heading = document.getElementById('aboutHeading');
    const headingtitle = document.getElementById('abouttitle');
    const textcontent = document.getElementById('aboutText');
    const texttitle = document.getElementById('abouttxt');
    if (heading && event.target !== heading) {
      heading.style.borderBottom = "none";
    }
    if (textcontent && event.target !== textcontent) {
      textcontent.style.borderBottom = "none";
    }
    if (headingtitle && event.target !== headingtitle) {
      headingtitle.style.borderBottom = "none";
    }
    if (texttitle && event.target !== texttitle) {
      texttitle.style.borderBottom = "none";
    }
  }

  editHeadig() {
    if (!this.isadmin) return;
    this.isEditingHeading = true;

    setTimeout(() => {
      if (this.headingInput) {
        this.headingInput.nativeElement.focus(); // Auto-focus on input field
      }
    }, 0);
  }

  editText() {
    if (!this.isadmin) return;
    this.isEditingTextcontent = true;
    setTimeout(() => {
      if (this.textInput) {
        this.textInput.nativeElement.focus();
      }
    }, 0);
  }

  editTitleHeading(){
    if (!this.isadmin) return;
    this.isEditingHeadingTitle = true;
    setTimeout(() => {
      if(this.headingTitleInput){
        this.headingTitleInput.nativeElement.focus();
      }
    }, 0);
  }
  editTextTitle() {
    if (!this.isadmin) return;
    this.isEditingTextTitle= true;
    setTimeout(() => {
      if (this.textTitleInput) {
        this.textTitleInput.nativeElement.focus();
      }
    }, 0);
  }
  // Handle click outside to save changes
  // handleOutsideClick(event: Event) {
  //   const clickedInside = this.elementRef.nativeElement.contains(event.target);
  //   if (!clickedInside && this.isEditingHeading && this.isEditingTextcontent && this.isEditingHeadingTitle && this.isEditingTextTitle) {
  //     this.isEditingHeading = false;
  //     this.isEditingHeadingTitle = false;
  //     this.isEditingTextcontent = false;
  //     this.isEditingTextTitle = false;
  //     this.updateAbout();
  //   }
  // }

  // Update About content using fetch API
  async updateAbout() {
    try {
      const editUrl = `http://localhost:5248/api/ContentMaster/editabouttext/3?userid=4`;
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

  async updateAboutTitle() {
    try {
      const editUrl = `http://localhost:5248/api/ContentMaster/editabouttext/9?userid=8`;
      const updatedData = { heading: this.headingTitle, textcontent: this.texttitle };

      const response = await fetch(editUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to Update content');
      }

      this.isEditingHeadingTitle = false;
      this.isEditingTextTitle = false;
    } catch (error) {
      console.error('Error updating heading:', error);
      this.isEditingHeadingTitle = false;
      this.isEditingTextTitle = false;
    }
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

  EditImage(image:{item_id:number,filename:string,userId:number, pagename:string}){
    console.log("updating image with id", image.item_id)
    this.newimage.item_id = image.item_id;
    this.newimage.userId = image.userId;
    this.newimage.pagename = image.pagename;
    this.newimage.filename = image.filename;
    this.showUpdateForm = true;
  }
  
  onImageFileChange(event:Event):void{
    const input = event.target as HTMLInputElement ;
    if(input?. files?.[0]){
      const file = input.files[0];
      const reader = new FileReader;
      reader.onload=(e)=>{
        this.newimage.image = e.target?.result as string;
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
  
    const apiUrl = `http://localhost:5248/api/ContentMaster/updateimage/13?userId=8&pagename=About`;
  
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
      this.fetchImage(13,8,'About');
    })
    .catch(error => {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    });
  } 
  }
