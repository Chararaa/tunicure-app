import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsCarouselComponent } from './testimonials-carousel.component';

describe('TestimonialsCarouselComponent', () => {
  let component: TestimonialsCarouselComponent;
  let fixture: ComponentFixture<TestimonialsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
