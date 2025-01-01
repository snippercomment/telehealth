import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuvanComponent } from './tuvan.component';

describe('TuvanComponent', () => {
  let component: TuvanComponent;
  let fixture: ComponentFixture<TuvanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuvanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TuvanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
