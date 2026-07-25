// description-parser.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DescriptionParserService {

  private isTitle(line: string): boolean {
    if (!line) return false;
    return line.startsWith('[Q]');
  }

  private cleanTitle(line: string): string {
    return line.replace(/^\[Q\]\s*/, '').trim();
  }

  private cleanContent(line: string): string {
    return line.replace(/^\[A\]\s*/, '').trim();
  }

  parseToStructuredSections(description: string): StructuredSection[] {
    if (!description) return [];

    const sections: StructuredSection[] = [];
    const lines = description.split('\n');

    let currentSection: StructuredSection | null = null;
    let currentParagraph: string[] = [];
    let currentList: string[] = [];
    let inList = false;
    let hasContent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      if (this.isTitle(line)) {
        // Sauvegarder la section précédente
        if (currentSection && hasContent) {
          if (currentParagraph.length > 0) {
            currentSection.paragraphs.push(currentParagraph.join(' '));
          }
          if (currentList.length > 0) {
            currentSection.lists.push([...currentList]);
          }
          sections.push(currentSection);
        }

        // Nouvelle section
        currentSection = {
          title: this.cleanTitle(line),
          paragraphs: [],
          lists: []
        };
        currentParagraph = [];
        currentList = [];
        inList = false;
        hasContent = false;
      }
      else {
        if (!currentSection) {
          currentSection = {
            title: 'Description',
            paragraphs: [],
            lists: []
          };
        }

        // Nettoyer la ligne du [A]
        let cleanLine = this.cleanContent(line);
        hasContent = true;

        // Détection des listes
        if (cleanLine.startsWith('-')) {
          if (!inList && currentParagraph.length > 0) {
            currentSection.paragraphs.push(currentParagraph.join(' '));
            currentParagraph = [];
          }
          inList = true;
          currentList.push(cleanLine.replace(/^-\s*/, '').trim());
        }
        else {
          if (inList && currentList.length > 0) {
            currentSection.lists.push([...currentList]);
            currentList = [];
            inList = false;
          }
          currentParagraph.push(cleanLine);
        }
      }
    }

    // Dernière section
    if (currentSection && hasContent) {
      if (currentParagraph.length > 0) {
        currentSection.paragraphs.push(currentParagraph.join(' '));
      }
      if (currentList.length > 0) {
        currentSection.lists.push([...currentList]);
      }
      sections.push(currentSection);
    }

    console.log('Sections:', sections);
    return sections;
  }
}

export interface StructuredSection {
  title: string;
  paragraphs: string[];
  lists: string[][];
}