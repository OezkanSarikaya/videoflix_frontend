import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // HttpClientMocking
import { ActivatedRoute } from '@angular/router'; // ActivatedRoute importieren
import { of } from 'rxjs';  // Um ein mock Observable zu erzeugen
import { VideoOfferComponent } from './video-offer.component';

describe('VideoOfferComponent', () => {
  let component: VideoOfferComponent;
  let fixture: ComponentFixture<VideoOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VideoOfferComponent,       // Deine Komponente
        HttpClientTestingModule,   // HttpClientMocking
      ],
      providers: [
        {
          provide: ActivatedRoute,  // Mock der ActivatedRoute
          useValue: { 
            snapshot: { 
              queryParams: { uid: '123', token: 'abc' }  // Beispiel-Query-Parameter
            } 
          }
        }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(VideoOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
