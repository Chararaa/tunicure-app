import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private currentLang = 'en';

  // API Google Translate gratuite
  private translateAPI = 'https://translate.googleapis.com/translate_a/single';

  // Liste des langues supportées
  languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // Mots à ne pas traduire (noms de produits, marques, etc.)
  private protectedWords = ['TuniCure'];

  constructor() {
    // Charger la langue sauvegardée
    const savedLang = localStorage.getItem('siteLanguage');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  // Méthode pour traduire le texte avec protection des mots
  async translateText(text: string, targetLang: string = this.currentLang): Promise<string> {
    if (!text.trim()) return text;

    try {
      // Sauvegarder les mots protégés avec des placeholders
      const placeholders: { [key: string]: string } = {};
      let processedText = text;
      
      this.protectedWords.forEach((word, index) => {
        const placeholder = `__PROTECTED_${index}__`;
        const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'gi');
        processedText = processedText.replace(regex, (match) => {
          placeholders[placeholder] = match;
          return placeholder;
        });
      });

      const url = `${this.translateAPI}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(processedText)}`;
      const response = await fetch(url);
      const data = await response.json();
      let translatedText = data[0].map((item: any) => item[0]).join('');
      
      // Restaurer les mots protégés
      Object.keys(placeholders).forEach(placeholder => {
        const originalWord = placeholders[placeholder];
        const regex = new RegExp(this.escapeRegExp(placeholder), 'g');
        translatedText = translatedText.replace(regex, originalWord);
      });
      
      return translatedText;
    } catch (error) {
      console.error('Erreur de traduction:', error);
      return text;
    }
  }

  // Helper pour échapper les regex
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Traduire TOUT le site
  async translateSite(lang: string): Promise<void> {
    console.log('Changement de langue vers:', lang);

    this.setCurrentLang(lang);
    localStorage.setItem('siteLanguage', lang);
    document.documentElement.lang = lang;

    // Attendre que Angular ait rendu tout le contenu
    setTimeout(async () => {
      await this.translateAllTextContent();
    }, 300);
  }

  // Méthode principale qui traduit TOUT le texte visible
  private async translateAllTextContent(): Promise<void> {
    try {
      // Récupérer tous les éléments avec du texte
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            // Filtrer les nœuds qu'on veut traduire
            const text = node.textContent || '';
            const parent = node.parentElement;

            // Éléments à exclure
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'SCRIPT') return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'INPUT') return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'SELECT') return NodeFilter.FILTER_REJECT;
            if (parent.classList.contains('no-translate')) return NodeFilter.FILTER_REJECT;
            if (parent.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT;
            
            // Vérifier si l'élément parent a la classe 'no-translate-product'
            if (parent.classList.contains('no-translate-product')) return NodeFilter.FILTER_REJECT;

            // Ignorer le texte vide ou les espaces
            if (!text.trim()) return NodeFilter.FILTER_REJECT;

            // Ignorer les nombres seuls
            if (/^\d+$/.test(text.trim())) return NodeFilter.FILTER_REJECT;

            // Ignorer les URLs, emails
            if (text.includes('http://') || text.includes('https://') || text.includes('@')) {
              return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node as Text);
      }

      console.log(`Nœuds texte trouvés: ${textNodes.length}`);

      // Traduire par lots pour éviter de surcharger
      const batchSize = 10;
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);
        const promises = batch.map(async (textNode) => {
          try {
            const originalText = textNode.textContent || '';
            if (originalText.trim()) {
              const translated = await this.translateText(originalText, this.currentLang);
              if (translated !== originalText) {
                textNode.textContent = translated;
              }
            }
          } catch (error) {
            console.warn('Erreur sur un nœud:', error);
          }
        });

        await Promise.all(promises);
        // Pause entre les lots pour éviter le rate limiting
        if (i + batchSize < textNodes.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log('Traduction complète terminée');

    } catch (error) {
      console.error('Erreur dans translateAllTextContent:', error);
    }
  }

  // Version plus simple pour les composants spécifiques
  async translateComponent(componentElement: HTMLElement): Promise<void> {
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
      componentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    for (const textNode of textNodes) {
      const originalText = textNode.textContent || '';
      if (originalText.trim()) {
        const translated = await this.translateText(originalText, this.currentLang);
        if (translated !== originalText) {
          textNode.textContent = translated;
        }
      }
    }
  }

  // Détecter la langue du navigateur
  detectBrowserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    return this.languages.some(l => l.code === browserLang) ? browserLang : 'en';
  }

  getCurrentLang(): string {
    return this.currentLang;
  }

  setCurrentLang(lang: string): void {
    this.currentLang = lang;
    localStorage.setItem('siteLanguage', lang);
    document.documentElement.lang = lang;
  }

  // Ajouter un mot protégé dynamiquement
  addProtectedWord(word: string): void {
    if (!this.protectedWords.includes(word)) {
      this.protectedWords.push(word);
    }
  }

  // Supprimer un mot protégé
  removeProtectedWord(word: string): void {
    const index = this.protectedWords.indexOf(word);
    if (index > -1) {
      this.protectedWords.splice(index, 1);
    }
  }
}
