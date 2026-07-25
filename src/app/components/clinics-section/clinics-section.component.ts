import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CLINICS_DATA, Clinic } from '../../models/clinics-data';

@Component({
  selector: 'app-clinics-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './clinics-section.component.html',
  styleUrls: ['./clinics-section.component.css']
})
export class ClinicsSectionComponent implements OnInit {
  clinics = CLINICS_DATA.map(clinic => ({
    id: clinic.id,
    name: clinic.name,
    location: clinic.location,
    mainImage: clinic.image,
    description: clinic.description,
    specialties: clinic.specialties,
    rooms: clinic.rooms,
    operationRooms: clinic.operationRooms,
    doctors: clinic.doctors,
    rating: clinic.rating,
    highlights: clinic.highlights
  }));

  constructor(private router: Router) { }

  ngOnInit(): void { }

  viewClinicDetails(clinicId: number): void {
    //    console.log('Navigating to clinic details:', clinicId);
    this.router.navigate(['/clinic', clinicId], {
      fragment: 'clinic'
    });
  }

  getSpecialtiesText(specialties: string[]): string {
    return specialties.slice(0, 3).join(', ') + (specialties.length > 3 ? '...' : '');
  }
  navigateToOrder(): void {
    this.router.navigate(['/order']).then(() => {
      setTimeout(() => {
        const element = document.getElementById('order');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    });
  }
}