import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { CommonModule } from '@angular/common';
import { HOTELS_DATA } from '../../models/hotel-data';

// Register modules
Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-hotels-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotels-carousel.component.html',
  styleUrls: ['./hotels-carousel.component.css']
})
export class HotelsCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @ViewChild('swiperPrev') swiperPrev!: ElementRef;
  @ViewChild('swiperNext') swiperNext!: ElementRef;
  @ViewChild('swiperPagination') swiperPagination!: ElementRef;  
private swiper: Swiper | null = null;
  private isSwiperInitialized = false;

  // Utilisez les données partagées
  hotels = HOTELS_DATA.map(hotel => ({
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    image: hotel.image,
    description: hotel.description,
    rating: hotel.rating
  }));

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Forcer la détection des changements après le chargement
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSwiper();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  initSwiper(): void {
    if (!this.swiperContainer?.nativeElement) {
      console.error('Swiper container not found');
      return;
    }

    // Vérifier qu'il y a des slides
    const slides = this.swiperContainer.nativeElement.querySelectorAll('.swiper-slide');
    if (slides.length === 0) {
      console.warn('No slides found for Swiper, retrying...');
      // Réessayer après un délai
      setTimeout(() => this.initSwiper(), 200);
      return;
    }

    // Éviter la double initialisation
    if (this.isSwiperInitialized) {
      return;
    }

    // Détruire l'ancienne instance si elle existe
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
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        },
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        watchSlidesProgress: true,
        runCallbacksOnInit: true,
        init: false
      });

      // Initialiser manuellement
      this.swiper.init();
      this.isSwiperInitialized = true;
      console.log('Hotels Swiper initialized successfully with', slides.length, 'slides');

    } catch (error) {
      console.error('Error initializing Hotels Swiper:', error);
    }
  }

  viewHotelDetails(hotelId: number): void {
    this.router.navigate(['/hotel', hotelId], {
      fragment: 'hotel'
    });
  }
}
