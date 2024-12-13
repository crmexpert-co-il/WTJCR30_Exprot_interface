import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as html2pdf from 'html2pdf.js'; // Import the html2pdf library
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('itineraryContent') itineraryContent!: ElementRef; // Reference to the HTML content

  tourData: any = null; // Initially null to indicate data is not loaded
  errorMessage: string | null = null;
  isLoading: boolean = true; // Loading state
  tourId: string | null = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.tourId = params.get('tourId'); // Extract 'tourId' from the URL query
      if (this.tourId) {
        // Load the page only if tourId is present
        console.log(this.tourId);
        this.fetchTourData(this.tourId);
      } else {
        // Handle the case when tourId is not provided (optional)
        console.log('tourId not found');
      }
    });
  }

  itinerary: {
    date?: string;
    unixDate?: number;
    dayOfWeek?: string;
    title?: string;
    dayNumber?: number;
    description?: string;
    categoryAndService?: string[];
    meals?: string; // Optional field
  }[] = []; // Initialize as an empty array

  convertUnixToDate(unixTimestamp: number): string {
    const date = new Date(unixTimestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  }

  getDayOfWeek(date: Date): string {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getDay()];  // Get day of the week as a string
  }

  currentDate: string = new Date().toLocaleDateString(); // or use any other format here

  fetchTourData(tourId: string): void {
    const apiKey = 'NWC5IH1wJhM4KxzFvU8Au4ZpOxQssp0I8hdy8n2Y5sTOID1Tn98w54srF9y8BFjA';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const paramMap = {
      apiKey: apiKey,
      dataSource: 'Cluster0',
      database: 'tourManagement_Test',
      collection: 'tours',
      filter: {
        crmId: tourId
      }
    };

    const dataApi = `https://hojokin-poc-731666484.catalystserverless.com/server/wtj_itinerarydocument_function/getTour`;
    // const dataApi = `http://localhost:3000/server/wtj_itinerarydocument_function/getTour`;

    this.http.post(dataApi, paramMap, { headers }).subscribe({
      next: (response) => {
        this.tourData = response;
        this.isLoading = false; // Data loaded
        const tourDays = this.tourData.document.tourDays;
        // console.log(tourDays);
        for (let i = 0; i < tourDays.length; i++) {
            this.itinerary.push({
              date: this.convertUnixToDate(tourDays[i].date),
              unixDate: tourDays[i].date,
              dayOfWeek: this.getDayOfWeek(new Date(tourDays[i].date)),
              title: tourDays[i].title,
              dayNumber: tourDays[i].dayNumber,
              description: tourDays[i].description,
              categoryAndService: (tourDays[i]?.tourServices && Array.isArray(tourDays[i]?.tourServices) && tourDays[i]?.tourServices.length > 0) 
              ? tourDays[i].tourServices 
              : [{ "name": "NA", "category": "NA" }]
            });
        }

        // Sorting the itinerary array by date, ensuring valid date values
      this.itinerary.sort((a, b) => {
        const dateA = a.unixDate ? new Date(a.unixDate).getTime() : 0;  // Handle undefined dates
        const dateB = b.unixDate ? new Date(b.unixDate).getTime() : 0;  // Handle undefined dates
        return dateA - dateB;
      });
        console.log(this.itinerary);
      },
      error: (error) => {
        this.errorMessage = 'Error fetching data. Please try again later.';
        this.isLoading = false; // Stop loading even on error
        console.error('Error:', error);
      }
    });
  }

  toProperCase(value: string | undefined | null): string {
    if (!value) {
      return '';
    }
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  convertToJson(service: any): any {
    return JSON.parse(JSON.stringify(service));
  }
  
  // Method to export the HTML content as a PDF
  exportToPDF() {
    const element = this.itineraryContent.nativeElement;
    
  
    var opt = {
      margin: [1, 1, 1, 1],
      filename: `Itinerary - ${this.tourData.document.tourName}.pdf`,
      image: {
          type: 'jpeg',
          quality: 1.0
      },
      html2canvas: {
          scale: 2,
          letterRendering: true
      },
      jsPDF: {
          unit: 'in',
          format: 'A4',
          orientation: 'portrait'
      },
      pagebreak: { mode: 'avoid-all', }
  };
  
    // Generate the PDF with the options
    html2pdf().from(element).set(opt).save();
  }
  
}
