import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HopitalsComponent } from './hopitals.component';

describe('HopitalsComponent', () => {
  let component: HopitalsComponent;
  let fixture: ComponentFixture<HopitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HopitalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HopitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
