import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Doctor } from '../../models/doctor.model';
import { DoctorService } from '../../services/doctor.service';
import { GeoService } from '../../services/geo.service'; // AJOUTER
@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.css']
})
export class DoctorDetailsComponent implements OnInit {
  doctor: Doctor | null = null;
  loading = true;
  selectedImageIndex = 0;
  currentSection = 'about';

  zoomImageIndex: number | null = null;
  imageLoading = false;
  galleryRevealed: boolean = false;
  isAfricanVisitor = false; // AJOUTER
  accessDenied = false; // AJOUTER


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private el: ElementRef,
    private geoService: GeoService, // AJOUTER
  ) { }

   ngOnInit(): void {
    // Vérifier d'abord si le visiteur est africain
    this.geoService.isAfricanVisitor().subscribe(isAfrican => {
      this.isAfricanVisitor = isAfrican;

      if (isAfrican) {
        // Si visiteur africain, on bloque l'accès
        this.accessDenied = true;
        this.loading = false;
      } else {
        // Sinon, on charge normalement
        this.route.params.subscribe(params => {
          const id = params['id'];
          if (id) {
            this.loadDoctorDetails(id);
          }
        });
      }
    });
  }
  loadDoctorDetails(id: string): void {
    this.doctorService.getDoctorById(id).subscribe({
      next: (data) => {
        this.doctor = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading doctor details:', err);
        this.loading = false;
      }
    });
  }

  // ========== MÉTHODES POUR LA GALERIE ==========

  // Vérifie si la galerie existe et contient des images
  hasGallery(): boolean {
    return !!this.doctor?.appointmentInfo?.beforeAfterGallery?.length;
  }

  // Récupère les images de la galerie (retourne un tableau vide si non existant)
  getGalleryImages(): string[] {
    return this.doctor?.appointmentInfo?.beforeAfterGallery || [];
  }


  // ========== MÉTHODES POUR LE ZOOM ==========


  nextZoomImage(): void {
    if (this.zoomImageIndex === null) return;

    const images = this.getGalleryImages();
    if (images.length > 0) {
      this.zoomImageIndex = (this.zoomImageIndex + 1) % images.length;
    }
  }

  prevZoomImage(): void {
    if (this.zoomImageIndex === null) return;

    const images = this.getGalleryImages();
    if (images.length > 0) {
      this.zoomImageIndex = (this.zoomImageIndex - 1 + images.length) % images.length;
    }
  }

  downloadZoomedImage(): void {
    if (this.zoomImageIndex === null || !this.doctor) return;

    const images = this.getGalleryImages();
    const imageUrl = images[this.zoomImageIndex];

    if (imageUrl) {
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `doctor-${this.doctor.personalInfo.name?.replace(/\s+/g, '-').toLowerCase()}-${this.zoomImageIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    }
  }

  // ========== NAVIGATION CLAVIER ==========

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.zoomImageIndex === null) return;

    switch (event.key) {
      case 'Escape':
        this.zoomImageIndex = null;
        document.body.style.overflow = 'auto';
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.prevZoomImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextZoomImage();
        break;
      case ' ':
        event.preventDefault();
        this.zoomImageIndex = null;
        document.body.style.overflow = 'auto';
        break;
    }
  }

  // ========== NAVIGATION TACTILE ==========

  private touchStartX = 0;
  private touchEndX = 0;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.zoomImageIndex !== null) {
      this.touchStartX = event.changedTouches[0].screenX;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.zoomImageIndex !== null) {
      this.touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe();
    }
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextZoomImage();
      } else {
        this.prevZoomImage();
      }
    }
  }

  // ========== AUTRES MÉTHODES ==========

  setSection(section: string): void {
    this.currentSection = section;
    // Réinitialise le zoom si on change de section
    if (section !== 'gallery') {
      this.zoomImageIndex = null;
      document.body.style.overflow = 'auto';
    }
  }

  navigateToBooking(): void {
    if (this.doctor?.appointmentInfo.bookingLink) {
      window.open(this.doctor.appointmentInfo.bookingLink, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }


  toggleGalleryReveal(): void {
    this.galleryRevealed = !this.galleryRevealed;

    // Optionnel : si on révèle toutes les images, on ferme le zoom en cours
    if (this.galleryRevealed && this.zoomImageIndex !== null) {
      this.zoomImageIndex = null;
    }
  }
  toggleImageZoom(index: number): void {
    if (this.zoomImageIndex === index) {
      this.zoomImageIndex = null;
    } else {
      this.zoomImageIndex = index;
      // Optionnel : si on zoome sur une image, on désactive automatiquement la révélation globale
      if (this.galleryRevealed) {
        this.galleryRevealed = false;
      }
    }
  }

  closeZoom(): void {
    this.zoomImageIndex = null;
    this.galleryRevealed = false;
    document.body.style.overflow = 'auto';
  }

}
