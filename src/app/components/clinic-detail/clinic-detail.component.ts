import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CLINICS_DATA } from '../../models/clinics-data';

@Component({
  selector: 'app-clinic-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './clinic-detail.component.html',
  styleUrls: ['./clinic-detail.component.css']
})
export class ClinicDetailComponent implements OnInit {
  clinic: any = null;
  selectedImage: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const clinicId = +params['id'];
      this.loadClinicDetails(clinicId);
    });
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'clinic') {
        // Attendre un peu que la page se charge
        setTimeout(() => {
          const element = document.getElementById('clinic');
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      }
    });

  }

  loadClinicDetails(id: number): void {
    const clinicData = CLINICS_DATA.find(clinic => clinic.id === id);
    if (clinicData) {
      this.clinic = clinicData;
      this.selectedImage = this.clinic.mainImage || this.clinic.images[0];
      console.log('Clinic loaded:', this.clinic);
    } else {
      console.error('Clinique non trouvée avec l\'ID:', id);
    }
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
    // Option: Ouvrir un modal lightbox
    this.showLightbox(imageUrl);
  }

  showLightbox(imageUrl: string): void {
    // Implémentez un modal lightbox ici si nécessaire
    console.log('Show lightbox for:', imageUrl);
  }

  bookAppointment(): void {
    alert(`Book appointment at ${this.clinic.name}\nPhone: ${this.clinic.phone}\nEmail: ${this.clinic.email}`);
    // Redirigez vers un formulaire de rendez-vous
    // this.router.navigate(['/appointment', this.clinic.id]);
  }
}