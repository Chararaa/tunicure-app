import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsCarouselComponent } from './hotels-carousel.component';

describe('HotelsCarouselComponent', () => {
  let component: HotelsCarouselComponent;
  let fixture: ComponentFixture<HotelsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelsCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
