import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdithospitalsComponent } from './edithospitals.component';

describe('EdithospitalsComponent', () => {
  let component: EdithospitalsComponent;
  let fixture: ComponentFixture<EdithospitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdithospitalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EdithospitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
