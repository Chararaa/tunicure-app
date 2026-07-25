import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappPopupComponent } from './whatsapp-popup.component';

describe('WhatsappPopupComponent', () => {
  let component: WhatsappPopupComponent;
  let fixture: ComponentFixture<WhatsappPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
