// category-details.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Category, CategoryService } from '../../services/category.service';
import { GeneralCategoryService } from '../../services/general-category.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DescriptionParserService, StructuredSection } from '../../services/description-parser.service';


declare global {
  interface Window {
    instgrm: any;
    FB: any;
  }
}

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('instagramContainer') instagramContainer!: ElementRef;
  @ViewChild('facebookContainer') facebookContainer!: ElementRef;

  category: any;
  subCategories: Category[] = [];
  descriptionSections: StructuredSection[] = [];
  loading = true;
  error: string | null = null;
  isInstagramVideo = false;
  isFacebookVideo = false;
  isYouTubeVideo = false;
  isVimeoVideo = false;
  videoEmbedUrl: SafeResourceUrl | null = null;

  // Propriétés pour suivre le chargement des scripts
  instagramScriptLoaded = false;
  facebookScriptLoaded = false;
  instagramLoading = false;
  facebookLoading = false;

  private instagramProcessed = false;
  private facebookProcessed = false;

  constructor(
    private route: ActivatedRoute,
    private generalCategoryService: GeneralCategoryService,
    private categoryService: CategoryService,
    private sanitizer: DomSanitizer,
    private descriptionParser: DescriptionParserService

  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategory(id);
      this.loadSubCategories(id);
    }
  }

  ngAfterViewInit(): void {
    // Initialiser après un court délai
    setTimeout(() => {
      if (this.isInstagramVideo && !this.instagramScriptLoaded) {
        this.loadInstagramScript();
      }
      if (this.isFacebookVideo && !this.facebookScriptLoaded) {
        this.loadFacebookScript();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    // Nettoyage
  }

  loadCategory(id: string): void {
    this.generalCategoryService.getCategoryById(id).subscribe({
      next: (data) => {
        this.category = data;
        this.descriptionSections = this.descriptionParser.parseToStructuredSections(data.description);
        this.analyzeAndPrepareVideo();
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la catégorie';
        console.error(error);
      }
    });
  }

  formatSectionContent(section: StructuredSection): string {
    let html = '';

    // Ajouter les paragraphes
    section.paragraphs.forEach(p => {
      if (p.trim()) {
        html += `<p class="section-paragraph">${p}</p>`;
      }
    });

    // Ajouter les listes
    section.lists.forEach(list => {
      html += '<ul class="section-list">';
      list.forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += '</ul>';
    });

    return html;
  }

  loadSubCategories(id: string): void {
    this.categoryService.getCategoriesByGeneralCategory(id).subscribe({
      next: (data) => {
        this.subCategories = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des sous-catégories';
        this.loading = false;
        console.error(error);
      }
    });
  }

  private analyzeAndPrepareVideo(): void {
    if (!this.category?.video) return;

    const videoUrl = this.category.video;

    // Détection du type de vidéo
    if (this.isYouTubeUrl(videoUrl)) {
      this.isYouTubeVideo = true;
      this.videoEmbedUrl = this.getYouTubeEmbedUrl(videoUrl);
    }
    else if (this.isVimeoUrl(videoUrl)) {
      this.isVimeoVideo = true;
      this.videoEmbedUrl = this.getVimeoEmbedUrl(videoUrl);
    }
    else if (this.isInstagramUrl(videoUrl)) {
      this.isInstagramVideo = true;
      this.instagramLoading = true;
    }
    else if (this.isFacebookUrl(videoUrl)) {
      this.isFacebookVideo = true;
      this.facebookLoading = true;
    }
  }

  private loadInstagramScript(): void {
    this.instagramLoading = true;

    // Vérifier si le script est déjà chargé
    if (window.instgrm) {
      this.instagramScriptLoaded = true;
      this.processInstagramEmbed();
      return;
    }

    const scriptId = 'instagram-embed-script';
    if (document.getElementById(scriptId)) {
      // Le script existe déjà, attendre qu'il soit chargé
      this.waitForInstagramScript();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.src = 'https://www.instagram.com/embed.js';

    script.onload = () => {
      console.log('Instagram script chargé');
      this.instagramScriptLoaded = true;
      this.instagramLoading = false;
      this.processInstagramEmbed();
    };

    script.onerror = () => {
      console.error('Loading error du script Instagram');
      this.instagramLoading = false;
    };

    document.body.appendChild(script);
  }

  private waitForInstagramScript(): void {
    const checkInterval = setInterval(() => {
      if (window.instgrm) {
        clearInterval(checkInterval);
        this.instagramScriptLoaded = true;
        this.instagramLoading = false;
        this.processInstagramEmbed();
      }
    }, 100);

    // Timeout après 5 secondes
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.instgrm) {
        console.error('Timeout chargement Instagram script');
        this.instagramLoading = false;
      }
    }, 5000);
  }

  private processInstagramEmbed(): void {
    if (!this.isInstagramVideo || this.instagramProcessed) return;

    if (window.instgrm && this.instagramContainer) {
      // Créer le blockquote pour Instagram
      const container = this.instagramContainer.nativeElement;
      container.innerHTML = '';

      const blockquote = document.createElement('blockquote');
      blockquote.className = 'instagram-media';
      blockquote.setAttribute('data-instgrm-permalink', this.category.video);
      blockquote.setAttribute('data-instgrm-version', '14');
      blockquote.setAttribute('data-instgrm-captioned', 'true');

      // Style minimal pour l'instant
      blockquote.style.cssText = `
        background: #FFF;
        border: 0;
        border-radius: 3px;
        box-shadow: 0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15);
        margin: 1px;
        max-width: auto;
        min-width: 326px;
        padding: 0;
        width: 99.375%;
        width: -webkit-calc(100% - 2px);
        width: calc(100% - 2px);
      `;

      container.appendChild(blockquote);

      // Traiter l'embed
      window.instgrm.Embeds.process();
      this.instagramProcessed = true;
    } else {
      // Réessayer après un délai
      setTimeout(() => this.processInstagramEmbed(), 500);
    }
  }

  private loadFacebookScript(): void {
    this.facebookLoading = true;

    // Vérifier si le script est déjà chargé
    if (window.FB) {
      this.facebookScriptLoaded = true;
      this.processFacebookEmbed();
      return;
    }

    const scriptId = 'facebook-jssdk';
    if (document.getElementById(scriptId)) {
      // Le script existe déjà, attendre qu'il soit chargé
      this.waitForFacebookScript();
      return;
    }

    // Créer la div fb-root si elle n'existe pas
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    // Note: Remplacez YOUR_APP_ID par votre vrai App ID Facebook
    script.src = 'https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v17.0';

    script.onload = () => {
      console.log('Facebook script chargé');
      this.facebookScriptLoaded = true;
      this.facebookLoading = false;
      this.processFacebookEmbed();
    };

    script.onerror = () => {
      console.error('Loading error du script Facebook');
      this.facebookLoading = false;
    };

    document.body.appendChild(script);
  }

  private waitForFacebookScript(): void {
    const checkInterval = setInterval(() => {
      if (window.FB) {
        clearInterval(checkInterval);
        this.facebookScriptLoaded = true;
        this.facebookLoading = false;
        this.processFacebookEmbed();
      }
    }, 100);

    // Timeout après 5 secondes
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.FB) {
        console.error('Timeout chargement Facebook script');
        this.facebookLoading = false;
      }
    }, 5000);
  }

  private processFacebookEmbed(): void {
    if (!this.isFacebookVideo || this.facebookProcessed) return;

    if (window.FB && this.facebookContainer) {
      const container = this.facebookContainer.nativeElement;
      container.innerHTML = '';

      const fbDiv = document.createElement('div');
      fbDiv.className = 'fb-video';
      fbDiv.setAttribute('data-href', this.category.video);
      fbDiv.setAttribute('data-width', '560');
      fbDiv.setAttribute('data-show-text', 'false');
      fbDiv.setAttribute('data-show-captions', 'true');
      fbDiv.setAttribute('data-lazy', 'true');

      container.appendChild(fbDiv);

      // Analyser le contenu Facebook
      window.FB.XFBML.parse();
      this.facebookProcessed = true;
    } else {
      // Réessayer après un délai
      setTimeout(() => this.processFacebookEmbed(), 500);
    }
  }

  // Méthodes d'identification des URLs
  private isYouTubeUrl(url: string): boolean {
    return /youtube\.com|youtu\.be/.test(url);
  }

  private isVimeoUrl(url: string): boolean {
    return /vimeo\.com/.test(url);
  }

  private isInstagramUrl(url: string): boolean {
    return /instagram\.com\/(p|reel|tv)\//.test(url);
  }

  private isFacebookUrl(url: string): boolean {
    return /facebook\.com|fb\.watch/.test(url);
  }

  // Méthodes de création des URLs embed
  private getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const videoId = this.extractYouTubeId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private getVimeoEmbedUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVimeoId(url);
    const embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractYouTubeId(url: string): string {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  private extractVimeoId(url: string): string {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  }

  hasVideo(): boolean {
    return !!this.category?.video;
  }

  // Méthode pour afficher un lien de secours
  getVideoDirectLink(): string {
    return this.category?.video || '#';
  }

  getVideoPlatformName(): string {
    if (this.isInstagramVideo) return 'Instagram';
    if (this.isFacebookVideo) return 'Facebook';
    if (this.isYouTubeVideo) return 'YouTube';
    if (this.isVimeoVideo) return 'Vimeo';
    return 'la plateforme';
  }
}