// hotel-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HOTELS_DATA } from '../../models/hotel-data';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.css']
})
export class HotelDetailComponent implements OnInit {
  hotel: any = null;
  selectedImage: string = '';
  groupedImages: any[] = []; // Pour grouper par 3 images


  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const hotelId = +params['id'];
      this.loadHotelDetails(hotelId);
    });
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'hotel') {
        // Attendre un peu que la page se charge
        setTimeout(() => {
          const element = document.getElementById('hotel');
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

  loadHotelDetails(id: number): void {
    // Trouver l'hôtel dans les données partagées
    const hotelData = HOTELS_DATA.find(hotel => hotel.id === id);

    if (hotelData) {
      this.hotel = hotelData;
      this.selectedImage = this.hotel.mainImage || this.hotel.images[0];
      console.log('Hotel loaded:', this.hotel);
    } else {
      console.error('Hôtel non trouvé avec l\'ID:', id);
    }
    if (this.hotel && this.hotel.images) {
      this.groupImages();
    }
  }
  groupImages(): void {
    this.groupedImages = [];
    for (let i = 0; i < this.hotel.images.length; i += 3) {
      const group = {
        image1: this.hotel.images[i],
        image2: this.hotel.images[i + 1],
        image3: this.hotel.images[i + 2]
      };
      this.groupedImages.push(group);
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  // Ajoutez le bouton retour fonctionnel
  goBack(): void {
    window.history.back();
  }
}