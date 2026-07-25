import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicsSectionComponent } from './clinics-section.component';

describe('ClinicsSectionComponent', () => {
  let component: ClinicsSectionComponent;
  let fixture: ComponentFixture<ClinicsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
