import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddhospitalsComponent } from './addhospitals.component';

describe('AddhospitalsComponent', () => {
  let component: AddhospitalsComponent;
  let fixture: ComponentFixture<AddhospitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddhospitalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddhospitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
