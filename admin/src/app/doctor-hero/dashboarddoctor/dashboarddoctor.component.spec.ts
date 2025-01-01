import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboarddoctorComponent } from './dashboarddoctor.component';

describe('DashboarddoctorComponent', () => {
  let component: DashboarddoctorComponent;
  let fixture: ComponentFixture<DashboarddoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboarddoctorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboarddoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
