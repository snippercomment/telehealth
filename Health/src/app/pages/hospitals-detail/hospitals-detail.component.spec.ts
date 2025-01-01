import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalsDetailComponent } from './hospitals-detail.component';

describe('HospitalsDetailComponent', () => {
  let component: HospitalsDetailComponent;
  let fixture: ComponentFixture<HospitalsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HospitalsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
