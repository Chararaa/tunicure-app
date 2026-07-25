import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { CommonModule } from '@angular/common';

Swiper.use([Pagination]);

interface Testimonial {
  id: number;
  name: string;
  avatar: string; // Gardé pour compatibilité mais plus utilisé
  message: string;
  fullMessage: string;
  rating: number;
  showFullMessage: boolean;
}

@Component({
  selector: 'app-testimonials-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials-carousel.component.html',
  styleUrls: ['./testimonials-carousel.component.css']
})
export class TestimonialsCarouselComponent implements AfterViewInit {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  swiper: any;

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Jennifer Osborne',
      avatar: '', // Plus besoin du chemin d'image
      fullMessage: 'I first heard about Tunicure from a friend that had had some surgery there she showed me her breast implants and a tummy tuck the results were amazing. I was a bit nervous about going to Tunisia but I was so glad I went. I went over in June 2025 for a breast lift everything was amazing they looked after you, you got the after care back home in the UK. I had to leave it 6 months before I could go back, so in November 2025 I went back for a mummy makeover. I was met at the airport by the Tunicure team they took me to the hotel then after a few hours I was taken to the hospital where I stayed for 4 nights. After the first night I had my surgery the next day, the consultant came to meet me and explained everything. The nurses were very helpful and they were all very friendly and could speak good English they were very reassuring. Once I’d had my breast implants and my tummy tuck I went back to my room the nurses couldn’t do enough for you, helping me to the bathroom washing me etc. The food was very nice too nice and healthy and plenty of it. After my 3 night stay in hospital I was taken back to the hotel for a week to rest and recover the after care was amazing I saw the doctor a few times before I was due to fly home and I saw someone from Tunicure every day till I went home. Then when it was time to go I got the all clear, I was taken back to the airport it was sad as I’d got to know everyone. The after care carried on just a WhatsApp message or a call away, they kept in touch with me. I would highly recommend Tunicure for any surgery they were absolutely amazing and very friendly, I would definitely use them again a 100 percent.',
      message: '',
      rating: 5,
      showFullMessage: false
    },
    {
      id: 2,
      name: 'Samia Idoudi',
      avatar: '',
      fullMessage: 'Je suis parti faire une liposuccion avec Tunicure et mon expérience a été extrêmement positive. Le service était impeccable du début à la fin, avec une équipe professionnelle, compétente et particulièrement attentive à mes besoins. Le personnel s’est montré à l’écoute, rassurant et très bienveillant tout au long du processus. Avec un suivi personnalisé. Excellent forfait qualité prix. Agence à recommander.',
      message: '',
      rating: 5,
      showFullMessage: false
    },
    {
      id: 3,
      name: 'Nohaila Hallam',
      avatar: '',
      fullMessage: 'I had an excellent experience with Tunicure in Tunisia for my breast surgery. From the very first contact, the team was professional, responsive, and reassuring. They provided clear information about the procedure, costs, and recovery, which helped me feel confident in my decision. The medical staff and surgeon were highly skilled and attentive, taking the time to understand my expectations and answer all my questions. The clinic was clean, modern, and well-equipped, and I felt safe and well cared for throughout my stay. Tunicure also handled the logistics perfectly, including accommodation, transportation, and post-operative follow-up. Their support did not stop after the surgery — they continued to check on my recovery and wellbeing, which I truly appreciate.',
      message: '',
      rating: 5,
      showFullMessage: false
    },
    {
      id: 4,
      name: 'Bushra',
      avatar: '',
      fullMessage: 'I had my tummy tuck done at Tunicure in Tunisia, and it was an amazing experience from start to finish! The clinic was spotless, the staff were so professional, and the before and after care were outstanding. I stayed for 10 days, which gave me plenty of time to rest and recover properly — unlike in Turkey, where I wouldn’t have had such a long and supportive stay. The procedure went smoothly, and I’m so happy with my results. I’d definitely recommend Tunicure and would go back again!',
      message: '',
      rating: 5,
      showFullMessage: false
    }
  ];

  constructor() {
    this.testimonials.forEach(testimonial => {
      testimonial.message = this.getFirstSixSentences(testimonial.fullMessage);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initSwiper(), 100);
  }

  initSwiper(): void {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      slidesPerView: 1,
      spaceBetween: 25,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1200: { slidesPerView: 3 },
      }
    });
  }

  getFirstSixSentences(text: string): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length <= 3) {
      return text;
    }
    return sentences.slice(0, 3).join(' ');
  }

  hasMoreThanSixSentences(text: string): boolean {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.length > 3;
  }

  toggleMessage(testimonial: Testimonial): void {
    testimonial.showFullMessage = !testimonial.showFullMessage;
    if (testimonial.showFullMessage) {
      testimonial.message = testimonial.fullMessage;
    } else {
      testimonial.message = this.getFirstSixSentences(testimonial.fullMessage);
    }
  }

  getStars(rating: number) {
    return new Array(rating);
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
