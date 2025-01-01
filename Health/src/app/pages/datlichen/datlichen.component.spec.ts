import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatlichenComponent } from './datlichen.component';

describe('DatlichenComponent', () => {
  let component: DatlichenComponent;
  let fixture: ComponentFixture<DatlichenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatlichenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatlichenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
