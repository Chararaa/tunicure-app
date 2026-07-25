// src/app/components/subcategory-detail/subcategory-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Category, CategoryService } from '../../services/category.service';
import { DescriptionParserService, StructuredSection } from '../../services/description-parser.service';

@Component({
  selector: 'app-subcategory-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subcategory-detail.component.html',
  styleUrls: ['./subcategory-detail.component.css']
})
export class SubcategoryDetailComponent implements OnInit {
  subcategory: Category | null = null;
  loading = true;
  error: string | null = null;
  descriptionSections: StructuredSection[] = [];
  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private descriptionParser: DescriptionParserService

  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSubcategory(id);
    } else {
      this.error = 'ID de sous-catégorie non fourni';
      this.loading = false;
    }
  }

  loadSubcategory(id: string): void {
    this.categoryService.getCategoryById(id).subscribe({
      next: (data) => {
        this.subcategory = data;

        this.descriptionSections =
          this.descriptionParser.parseToStructuredSections(data.description);

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la sous-catégorie';
        this.loading = false;
        console.error(error);
      }
    });
  }

  getPriceRange(): string {
    if (!this.subcategory?.priceRange) return 'Non disponible';
    const { min, max, currency } = this.subcategory.priceRange;
    return `${min} - ${max} ${currency}`;
  }

  getSafeKeywords(): string[] {
    return this.subcategory?.keywords || [];
  }

  getSafeBenefits(): any[] {
    return this.subcategory?.benefits || [];
  }

  getSafeFaqs(): any[] {
    return this.subcategory?.faqs || [];
  }

  getSafeDescription(): string {
    return this.subcategory?.description || 'Aucune description disponible';
  }

  getSafeName(): string {
    return this.subcategory?.name || 'Sous-catégorie';
  }

  getSafeBanner(): string {
    return this.subcategory?.banner || 'assets/images/default-banner.jpg';
  }

  getSafeAverageDuration(): string {
    return this.subcategory?.averageDuration || 'Non spécifié';
  }

  getSafeRecoveryTime(): string {
    return this.subcategory?.recoveryTime || 'Non spécifié';
  }
}