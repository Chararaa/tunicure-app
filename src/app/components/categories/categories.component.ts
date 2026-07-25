// src/app/components/categories/categories.component.ts
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GeneralCategoryService, GeneralCategory } from '../../services/general-category.service';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';


Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, AfterViewInit {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  swiper: any;


  categories: GeneralCategory[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private generalCategoryService: GeneralCategoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    //console.log('Loading categories from generalcategories endpoint');
    this.loadCategories();
  }


  ngAfterViewInit(): void {
    // Initialiser Swiper après que les données sont chargées
    setTimeout(() => {
      if (this.categories.length > 0) {
        this.initSwiper();
      }
    }, 100);
  }

  initSwiper(): void {
    if (this.swiperContainer && this.swiperContainer.nativeElement) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: this.categories.length > 4,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 25,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 30,
          }
        }
      });
    }
  }

  loadCategories(): void {
    this.loading = true;
    this.generalCategoryService.getAllCategories().subscribe({
      next: (data) => {
        //console.log('Categories loaded:', data);
        this.categories = data;
        this.loading = false;
        setTimeout(() => {
          this.initSwiper();
        }, 0);
      },
      error: (error) => {
        //console.error('Error loading categories:', error);
        this.error = 'Erreur lors du Loading categories';
        this.loading = false;
      }
    });
  }

  navigateToCategory(category: GeneralCategory): void {
    this.router.navigate(['/category', category._id]).then(() => {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 1000);
    });
  }

  getIconClass(iconPath: string): string {
    if (!iconPath || iconPath === '') return 'fas fa-folder';

    // Si c'est une classe FontAwesome complète
    if (iconPath.startsWith('fa')) {
      return iconPath;
    }

    // Si c'est juste un nom d'icône
    return `fas fa-${iconPath}`;
  }

  getIconStyle(iconPath: string): any {
    if (!iconPath) return {};

    // Si c'est une URL, utiliser comme background image
    if (iconPath.startsWith('http') || iconPath.startsWith('assets/') || iconPath.startsWith('data:')) {
      return {
        'background-image': `url('${iconPath}')`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    }

    return {};
  }

  // Vérifier si l'icône est une URL ou une classe
  isIconUrl(iconPath: string): boolean {
    return iconPath ?
      (iconPath.startsWith('http') || iconPath.startsWith('assets/') || iconPath.startsWith('data:')) :
      false;
  }
}

