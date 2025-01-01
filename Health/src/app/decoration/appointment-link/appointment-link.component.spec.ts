import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentLinkComponent } from './appointment-link.component';

describe('AppointmentLinkComponent', () => {
  let component: AppointmentLinkComponent;
  let fixture: ComponentFixture<AppointmentLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
