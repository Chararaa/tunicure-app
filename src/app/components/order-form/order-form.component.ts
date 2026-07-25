
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { GeneralCategoryService, GeneralCategory } from '../../services/general-category.service';
import { CategoryService, Category } from '../../services/category.service';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { CountryService, Country } from '../../services/country.service';


// Interface étendue pour TypeScript strict
interface ExtendedOrder extends Order {
  categoryName?: string;
  generalCategoryName?: string;
  additionalInfo: { [key: string]: string }; // Changé de ? à obligatoire
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, AfterViewInit {

  @ViewChild('subcategorySwiper') subcategorySwiperRef!: ElementRef;
  private subcategorySwiper: Swiper | undefined;

  currentStep: number = 1;
  isSubmitting: boolean = false;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  // Catégories avec initialisation correcte
  generalCategories: GeneralCategory[] = [];
  subcategories: Category[] = [];
  selectedGeneralCategory: GeneralCategory | null = null;
  selectedCategory: Category | null = null;
  isLoadingCategories: boolean = false;

  showPhotoPrivacyModal: boolean = false;
  hasAcceptedPhotoPrivacy: boolean = false;
  showSuccessModal: boolean = false;

  showAlertModal: boolean = false;
  alertMessage: string = '';
  alertTitle: string = 'Information';

  countries: Country[] = [];

  // Initialisation complète de l'objet order
  order: ExtendedOrder = {
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      gender: '',
      country: '',
      address: '',
      zipCode: '',
      state: '',
      dateBirth: '',
      weight: undefined,
      height: undefined,
      age: undefined
    },
    medicalInfo: {
      smokes: 'no',
      alcoholConsumption: '',
      contagiousDisease: '',
      previousOperations: 'no',
      previousOperationsDetails: '',
      woundHealingAbnormality: '',
      bleedingClottingAbnormality: '',
      chronicMedication: 'no',
      allergies: 'no',
      allergiesDetails: '',
      expectations: ''
    },
    category: '',
    generalCategory: '',
    pack: 'bronze',
    photos: [],
    additionalInfo: {}
  };

  constructor(
    private orderService: OrderService,
    private generalCategoryService: GeneralCategoryService,
    private categoryService: CategoryService,
    private countryService: CountryService
  ) { }

  ngOnInit() {
    this.loadGeneralCategories();
    this.loadCountries();
    // Vérifier si l'utilisateur a déjà accepté la politique
    if (localStorage.getItem('photoPrivacyAccepted') === 'true') {
      this.hasAcceptedPhotoPrivacy = true;
    }
  }

  loadCountries() {
    this.countryService.getCountries().subscribe({
      next: countries => this.countries = countries,
      error: err => console.error('Erreur pays', err)
    });
  }

  // À AJOUTER après vos méthodes existantes
  ngAfterViewInit() {
    // Petit délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      this.initSubcategorySwiper();
    }, 200);
  }


  private initSubcategorySwiper() {
    if (!this.subcategorySwiperRef) return;

    const element = this.subcategorySwiperRef.nativeElement;

    // 🔥 important : détruire l'ancien swiper
    if (this.subcategorySwiper) {
      this.subcategorySwiper.destroy(true, true);
    }

    this.subcategorySwiper = new Swiper(element, {
      modules: [Navigation, Pagination],
      slidesPerView: 4,
      spaceBetween: 20,

      navigation: {
        nextEl: element.querySelector('.swiper-button-next'),
        prevEl: element.querySelector('.swiper-button-prev'),
      },

      pagination: {
        el: element.querySelector('.swiper-pagination'),
        clickable: true,
      },

      breakpoints: {
        320: { slidesPerView: 1 },
        480: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 }
      },

      observer: true,
      observeParents: true,
    });
  }


  // AJOUTEZ CETTE MÉTHODE - À APPELER APRÈS LE CHARGEMENT DES SOUS-CATÉGORIES
  initSwiperAfterLoad() {
    setTimeout(() => {
      this.initSubcategorySwiper();
    }, 100);
  }

  loadGeneralCategories() {
    this.isLoadingCategories = true;
    this.generalCategoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.generalCategories = categories;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  loadSubcategories(generalCategoryId: string) {
    this.isLoadingCategories = true;

    this.categoryService.getCategoriesByGeneralCategory(generalCategoryId).subscribe({
      next: (categories) => {
        this.subcategories = categories;
        this.isLoadingCategories = false;

        // ⭐ attendre que Angular rende les slides
        setTimeout(() => {
          if (this.currentStep === 3) {
            this.initSubcategorySwiper();
          }
        }, 0);
      },
      error: (error) => {
        console.error('Erreur chargement sous-catégories:', error);
        this.isLoadingCategories = false;
      }
    });
  }


  // Méthode sécurisée pour vérifier les questions FAQ
  hasFaqs(): boolean {
    return !!this.selectedCategory &&
      !!this.selectedCategory.faqs &&
      this.selectedCategory.faqs.length > 0;
  }

  // Méthode sécurisée pour récupérer les FAQ
  getFaqs(): any[] {
    return this.selectedCategory?.faqs || [];
  }

  // Navigation améliorée avec validation
  nextStep() {
    if (this.currentStep < 5) {
      // Validation spécifique par étape
      let canProceed = true;

      switch (this.currentStep) {
        case 1:
          if (!this.isStep1Valid()) {
            this.openAlert('Please fill in all your personal Information.');
            canProceed = false;
          }
          break;

        case 2:
          if (!this.selectedGeneralCategory) {
            this.openAlert('Please select a main category.');
            canProceed = false;
          }
          break;

        case 3:
          if (!this.selectedCategory) {
            this.openAlert('Please select a specific procedure.');
            canProceed = false;
          } else if (this.subcategories.length === 0) {
            this.openAlert('No procedures available. Please choose another category.');
            canProceed = false;
          }
          break;

        case 4:
          if (!this.isStep4Valid()) {
            this.openAlert('Please fill in your age, height and weight.');
            canProceed = false;
          }
          break;
      }

      if (canProceed) {
        this.currentStep++;
        if (this.currentStep === 3 && this.subcategories.length > 0) {
          setTimeout(() => this.initSubcategorySwiper(), 50);
        }
        if (this.currentStep === 5) {
          setTimeout(() => {
            this.showPhotoPrivacyModal = true;
          });
        }
        setTimeout(() => {
          const element = document.getElementById('order');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
      }

    }
  }


  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;

      // Recharger les sous-catégories si nécessaire
      if (this.currentStep === 3 && this.selectedGeneralCategory) {
        this.loadSubcategories(this.selectedGeneralCategory._id);
      }
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return !!this.selectedGeneralCategory;
      case 3:
        return !!this.selectedCategory;
      case 4:
        return true; // Questions optionnelles
      case 5:
        return true; // Photos optionnelles
      default:
        return false;
    }
  }

  isStep1Valid(): boolean {
    const ci = this.order.clientInfo;
    return !!(ci.name && ci.email && ci.phone && ci.country && ci.gender);
  }

  selectGeneralCategory(category: GeneralCategory) {
    this.selectedGeneralCategory = category;
    this.order.generalCategory = category._id;
    this.order.generalCategoryName = category.name;
    this.loadSubcategories(category._id);
    this.selectedCategory = null;
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.order.category = category._id;
    this.order.categoryName = category.name;
  }

  // Méthode sécurisée pour accéder aux FAQ
  getCategoryFaqs(): any[] {
    if (!this.selectedCategory || !this.selectedCategory.faqs) {
      return [];
    }
    return this.selectedCategory.faqs;
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      const remainingSlots = 5 - this.selectedFiles.length;
      const filesToAdd = Math.min(files.length, remainingSlots);

      for (let i = 0; i < filesToAdd; i++) {
        const file = files[i];

        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
          this.selectedFiles.push(file);

          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previewUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else if (file.size > 5 * 1024 * 1024) {
          this.openAlert(`The file ${file.name} is too large. Maximum size: 5MB`);
        }
      }

      if (files.length > remainingSlots) {
        this.openAlert(`You can only upload 5 images maximum. ${filesToAdd} images added.`);
      }
    }
  }

  removeImage(index: number): void {
    if (index >= 0 && index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
      this.previewUrls.splice(index, 1);
    }
  }

  submitForm() {
    if (!this.hasAcceptedPhotoPrivacy) {
      this.showPhotoPrivacyModal = true;
      return;
    }
    if (!this.isFormValid()) {
      this.openAlert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    // Créer un objet order complet
    const completeOrder: Order = {
      ...this.order,
      additionalInfo: this.order.additionalInfo || {},

    };

    if (this.selectedFiles.length > 0) {
      this.orderService.createOrderWithPhotos(completeOrder, this.selectedFiles).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showSuccessModal = true;
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.openAlert('Error during submission. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.orderService.createOrder(completeOrder).subscribe({
        next: (response) => {
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.openAlert('Error during submission. Please try again.');
          this.isSubmitting = false;
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.order.clientInfo.name &&
      this.order.clientInfo.email &&
      this.order.clientInfo.phone &&
      this.order.clientInfo.country &&
      this.order.clientInfo.gender &&
      this.order.category &&
      this.order.generalCategory
    );
  }

  resetForm() {
    this.currentStep = 1;
    this.selectedGeneralCategory = null;
    this.selectedCategory = null;
    this.selectedFiles = [];
    this.previewUrls = [];
    this.subcategories = [];
    this.order.additionalInfo = {};

    this.order = {
      clientInfo: {
        name: '',
        email: '',
        phone: '',
        gender: '',
        country: '',
        address: '',
        zipCode: '',
        state: '',
        dateBirth: '',
        weight: undefined,
        height: undefined,
        age: undefined
      },
      medicalInfo: {
        smokes: 'no',
        alcoholConsumption: '',
        contagiousDisease: '',
        previousOperations: 'no',
        previousOperationsDetails: '',
        woundHealingAbnormality: '',
        bleedingClottingAbnormality: '',
        chronicMedication: 'no',
        allergies: 'no',
        allergiesDetails: '',
        expectations: ''
      },
      category: '',
      generalCategory: '',
      pack: 'bronze',
      photos: [],
      additionalInfo: {}
    };
  }

  showMedicalDetails(field: string): boolean {
    const medicalInfo = this.order.medicalInfo as any;
    return medicalInfo[field] === 'yes';
  }

  onDateOfBirthChange(event: any): void {
    const dateOfBirth = event.target.value;
    this.order.clientInfo.dateBirth = dateOfBirth;
    this.calculateAge(dateOfBirth);
  }

  calculateAge(dateOfBirth: string): void {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      this.order.clientInfo.age = age;
    } else {
      this.order.clientInfo.age = undefined;
    }
  }

  formatPrice(category: Category | null): string {
    if (!category || !category.priceRange) {
      return 'Not available';
    }

    const priceRange = category.priceRange;
    return `${priceRange.min} - ${priceRange.max} ${priceRange.currency}`;
  }
  getAdditionalInfoValue(key: string): string {
    return this.order.additionalInfo?.[key] || '';
  }

  updateAdditionalInfo(key: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;

    if (!this.order.additionalInfo) {
      this.order.additionalInfo = {};
    }

    this.order.additionalInfo[key] = value;
  }
  // Ajoutez cette méthode dans la classe OrderFormComponent
  isStep4Valid(): boolean {
    return !!(
      this.order.clientInfo.age &&
      this.order.clientInfo.height &&
      this.order.clientInfo.weight
    );
  }

  // Ajoutez ces nouvelles méthodes:
  openPhotoPrivacyModal() {
    this.showPhotoPrivacyModal = true;
  }

  closePhotoPrivacyModal() {
    this.showPhotoPrivacyModal = false;
  }

  acceptPhotoPrivacy() {
    this.hasAcceptedPhotoPrivacy = true;
    this.showPhotoPrivacyModal = false;

    // Stocker l'acceptation dans localStorage pour les futures visites
    localStorage.setItem('photoPrivacyAccepted', 'true');
  }
  closeSuccessModal() {
    this.showSuccessModal = false;
    this.resetForm(); // optionnel mais logique ici
  }
  // Ajoutez cette méthode dans la classe OrderFormComponent
  truncateDescription(description: string | undefined, maxSentences: number = 5): string {
    if (!description) return '';

    // Diviser le texte en phrases (en tenant compte des points, points d'exclamation, points d'interrogation)
    const sentences = description.split(/(?<=[.!?])\s+/);

    if (sentences.length <= maxSentences) {
      return description;
    }

    // Prendre les X premières phrases et les rejoindre
    return sentences.slice(0, maxSentences).join(' ') + '...';
  }
  openAlert(message: string, title: string = 'Information') {
    this.alertMessage = message;
    this.alertTitle = title;
    this.showAlertModal = true;
  }

  closeAlert() {
    this.showAlertModal = false;
  }

}
