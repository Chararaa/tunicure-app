import { AfterViewInit, Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { DoctorComponent } from '../doctor/doctor.component';
import { CategoriesComponent } from "../categories/categories.component";
import { HotelsCarouselComponent } from "../hotels-carousel/hotels-carousel.component";
import { ClinicsSectionComponent } from "../clinics-section/clinics-section.component";
import { TestimonialsCarouselComponent } from "../testimonials-carousel/testimonials-carousel.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DoctorComponent, CategoriesComponent, HotelsCarouselComponent, ClinicsSectionComponent, TestimonialsCarouselComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSending: boolean = false;
  mailSent: boolean = false;
  errorMsg: string = '';

  constructor(private router: Router) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.init();
    });
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
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  faqs = [
    {
      question: 'Why choose Tunicure over going alone or using another agency?',
      answer: 'At TUNICURE, you benefit from complete end-to-end organisation — we handle the logistics so you can focus on your care and recovery. TUNICURE works with experienced, credentialed surgeons and reputable clinics, many of whom have international training and experience, and whose facilities uphold strict hygiene and care standards. VIP transfers and luxury accommodation are included in your package, along with a personal patient coordinator to support you at every step. You also benefit from transparent pricing with no hidden fees.'
    },
    {
      question: 'Why do patients choose Tunisia for cosmetic and medical treatments?',
      answer: 'Patients choose Tunisia because it offers excellent quality care at competitive prices — often significantly lower than in Europe or UK — without compromising on medical standards. Many doctors are trained internationally, and clinics use modern technologies. Plus, Tunisia’s Mediterranean setting provides a pleasant recovery environment.'
    },
    {
      question: 'What is included in a Tunicure package?',
      answer: 'Our packages typically include medical consultation and case assessment, clinic and surgeon coordination, airport and VIP  local transfers, hotel accommodation, as well as medical follow-ups and patient assistance. All inclusions are clearly explained with full transparency.'
    },
    {
      question: 'Is it safe to travel to Tunisia for treatment?',
      answer: 'Medical tourism to Tunisia is well established and regulated. Clinics and agencies providing these services work to maintain high patient safety and comfort. (As with all travel, you should follow current travel advisories and consult your healthcare provider.)'
    },
    {
      question: 'What happens after I return home?',
      answer: 'Tunicure continues supporting you through remote follow-ups, communication with your surgeon, and recommendations for recovery care. You’re never left to manage alone once you’re back home.'
    },
    {
      question: 'What happens if I am not medically suitable for surgery?',
      answer: 'If the surgeon determines that surgery is not safe or appropriate, the procedure will not be performed. Patient safety always takes precedence over proceeding with treatment.'
    },
    {
      question: 'How much can I save compared to the UK or Europe?',
      answer: 'With TUNICURE, you can typically save between 50% and 70% compared to treatment costs in the UK or across Europe. Thanks to lower operational expenses in Tunisia, we are able to offer the same high standards of medical care, experienced surgeons, and modern facilities at a significantly more affordable price. Our all-inclusive packages also help you avoid unexpected costs, giving you excellent value without compromising on quality or safety.'
    },
    {
      question: 'How long should I stay in Tunisia for my treatment?',
      answer: 'The length of stay depends on the procedure(s) performed. On average, cosmetic surgery stays range from 7 to 14 days, including clinic stay, recovery time, and follow-up appointments. Your coordinator will provide a personalised timeline.'
    },
    {
      question: 'Are the results guaranteed?',
      answer: 'While no medical procedure can offer a 100% guarantee, Tunicure works only with qualified surgeons who aim for the best possible outcomes based on your anatomy, medical condition, and expectations. All procedures and risks are explained transparently.'
    },
    {
      question: 'How do I get started with Tunicure?',
      answer: 'Simply contact us via our website quotation form or through WhatsApp, and one of our patient coordinators will provide you with a personalised treatment plan tailored to your needs.'
    }
  ];

  activeIndex = 0; // premier ouvert par défaut

  toggleFaq(index: number) {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }
  sendMailto() {

    /* VALIDATION */
    if (!this.form.name || !this.form.email || !this.form.message) {
      this.errorMsg = "Please fill all required fields.";
      setTimeout(() => this.errorMsg = '', 3000);
      return;
    }

    this.isSending = true;
    this.errorMsg = '';

    /* CONSTRUCTION EMAIL */
    const subject = encodeURIComponent(
      this.form.subject || "New message from Tunicure website"
    );

    const body = encodeURIComponent(
      `Hello Tunicure team,

You received a new message from your website.

Name: ${this.form.name}

Message:
${this.form.message}

---
Sent from Tunicure website`
    );

    const mailtoLink = `mailto:contact@tunicure.com?subject=${subject}&body=${body}`;

    /* SIMULATION LOADER UX */
    setTimeout(() => {
      window.location.href = mailtoLink;

      this.isSending = false;
      this.mailSent = true;

      /* reset form */
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };

      /* hide success after 4s */
      setTimeout(() => this.mailSent = false, 4000);

    }, 800);
  }


}
