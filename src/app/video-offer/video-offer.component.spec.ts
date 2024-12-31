import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoOfferComponent } from './video-offer.component';

describe('VideoOfferComponent', () => {
  let component: VideoOfferComponent;
  let fixture: ComponentFixture<VideoOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoOfferComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
