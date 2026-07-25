import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotPopupComponent } from './chatbot-popup.component';

describe('ChatbotPopupComponent', () => {
  let component: ChatbotPopupComponent;
  let fixture: ComponentFixture<ChatbotPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
