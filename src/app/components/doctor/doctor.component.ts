import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Doctor } from '../../models/doctor.model';
import { DoctorService } from '../../services/doctor.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { GeoService } from '../../services/geo.service';

// register modules
Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css']
})
export class DoctorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  private swiper: Swiper | null = null;

  doctors: Doctor[] = [];
  displayedDoctors: Doctor[] = [];
  loading = true;
  isSwiperInitialized = false;
  isAfricanVisitor = false; // AJOUTER
  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef,
    private geoService: GeoService, // AJOUTER
  ) { }

   ngOnInit(): void {
    // Vérifier d'abord si le visiteur est africain
    this.geoService.isAfricanVisitor().subscribe(isAfrican => {
      this.isAfricanVisitor = isAfrican;

      // Ne charger les docteurs que si ce n'est pas un visiteur africain
      if (!isAfrican) {
        this.loadDoctors();
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDoctors(): void { // AJOUTER cette méthode
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.displayedDoctors = data;
        this.loading = false;
        this.cdr.detectChanges();

        if (!this.isSwiperInitialized) {
          setTimeout(() => this.initSwiper(), 100);
        }
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  ngAfterViewInit(): void {
    // Initialise le swiper seulement si les données sont déjà chargées
    if (!this.loading && !this.isSwiperInitialized) {
      setTimeout(() => this.initSwiper(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  initSwiper(): void {
    if (!this.swiperContainer?.nativeElement) {
      console.warn('Swiper container not found');
      return;
    }

    // Vérifie s'il y a des slides
    const slides = this.swiperContainer.nativeElement.querySelectorAll('.swiper-slide');
    if (slides.length === 0) {
      console.warn('No slides found for Swiper');
      return;
    }

    // Détruit le swiper existant
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }

    try {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          992: {
            slidesPerView: 3,
            spaceBetween: 25
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 30
          },
        },
        // Configuration d'observation améliorée
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        // Active le re-render quand les slides changent
        watchSlidesProgress: true,
        // Pour éviter les problèmes de rendu initial
        runCallbacksOnInit: true,
        init: false // On initialise manuellement
      });

      // Initialise le swiper
      this.swiper.init();
      this.isSwiperInitialized = true;
      console.log('Swiper initialized successfully');

    } catch (error) {
      console.error('Error initializing Swiper:', error);
    }
  }
getDoctorImage(doctor: Doctor): string {
  return doctor.personalInfo?.bannerImage
    || 'assets/img/doctors/default.jpg';
}
  scrollToSection(sectionId: string) {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }
}
