import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  tourName = 'Amazing Europe Tour';
  startDate = '2024-12-10';
  endDate = '2024-12-20';
  numberOfDays = 10;
  activities = [
    'Visit the Eiffel Tower',
    'Explore the Louvre Museum',
    'Tour of the Colosseum',
    'Vatican City Visit',
    'Cruise on the Seine River'
  ];

  constructor() { }

  // Method to export the itinerary as a PDF
  exportToPDF() {
    // Dynamically import jsPDF and use it
    import('jspdf').then((jsPDF) => {
      const doc = new jsPDF.default(); // Use the default constructor of jsPDF
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;
  
      // Adding Header
      doc.setFontSize(18);
      doc.text('Itinerary', 20, yPosition);
      yPosition += 20;
  
      // Add Logo on the right side of the header
      const logoPath = 'assets/logo.png'; // Path to your logo
      doc.addImage(logoPath, 'PNG', 170, 10, 30, 30); // Adjust the position and size
  
      // Adding Tour details
      doc.setFontSize(14);
      doc.text(`Tour Name: ${this.tourName}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Dates: ${this.startDate} to ${this.endDate}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Number of Days: ${this.numberOfDays}`, 20, yPosition);
      yPosition += 10;
  
      // Adding Activities
      doc.text('Activities:', 20, yPosition);
      yPosition += 10;
      this.activities.forEach((activity, index) => {
        if (yPosition > pageHeight - 20) { // Create a new page if we're near the bottom
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${index + 1}. ${activity}`, 20, yPosition);
        yPosition += 10;
      });
  
      doc.save('itinerary.pdf');
    }).catch(error => {
      console.error('Error loading jsPDF:', error);
    });
  }  
}
